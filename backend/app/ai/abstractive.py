import os
import time
import torch
from transformers import pipeline, AutoTokenizer
from app.utils.text_cleaner import clean_text, create_sentence_chunks, split_into_sentences


class AbstractiveSummarizer:
    def __init__(self):
        self.model_name = os.getenv("BART_MODEL_NAME", "facebook/bart-large-cnn")
        self.fallback_model = os.getenv("FALLBACK_MODEL_NAME", "sshleifer/distilbart-cnn-12-6")
        self.summarizer_pipeline = None
        self.tokenizer = None
        self.active_model_name = self.model_name
        self.device = 0 if torch.cuda.is_available() else -1

    def load_model(self):
        """
        Loads Hugging Face Transformer summarization model and tokenizer safely into memory.
        Reuses single instance across requests.
        """
        if self.summarizer_pipeline is not None:
            return

        print(f"📦 Loading Abstractive Summarizer model '{self.model_name}' on device {self.device}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.summarizer_pipeline = pipeline(
                "summarization",
                model=self.model_name,
                tokenizer=self.tokenizer,
                device=self.device
            )
            self.active_model_name = self.model_name
            print(f"✅ Abstractive Summarizer '{self.model_name}' loaded successfully!")
        except Exception as e:
            print(f"⚠️ Primary model '{self.model_name}' load failed ({e}). Attempting fallback model '{self.fallback_model}'...")
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(self.fallback_model)
                self.summarizer_pipeline = pipeline(
                    "summarization",
                    model=self.fallback_model,
                    tokenizer=self.tokenizer,
                    device=self.device
                )
                self.active_model_name = self.fallback_model
                print(f"✅ Fallback Abstractive Summarizer '{self.fallback_model}' loaded successfully!")
            except Exception as e_fallback:
                print(f"❌ Fallback model load failed: {e_fallback}")
                self.summarizer_pipeline = None

    def summarize(self, text: str, max_length: int = 150, min_length: int = 30, preset: str = "medium") -> tuple[str, str]:
        """
        Generates a fluent, coherent abstractive summary using BART Transformer model with:
        - Enhanced generation parameters (num_beams=6, repetition_penalty=1.3, no_repeat_ngram_size=3, etc.)
        - Sentence-aware chunking
        - Hierarchical two-pass summarization for long documents/PDFs
        - Dynamic preset percentage length mapping
        - Detailed performance timing logs
        """
        t_start = time.perf_counter()

        # Stage 1: Text Cleaning
        t0 = time.perf_counter()
        cleaned_text = clean_text(text)
        t_clean = (time.perf_counter() - t0) * 1000

        words = cleaned_text.split()
        word_count = len(words)
        if word_count < 10:
            return cleaned_text, "Rule-based Fallback"

        # Stage 2: Dynamic Summary Length Calculation based on Preset Percentages
        # Short: 15-20% | Medium: 30-40% | Long: 50-60%
        if preset == "short":
            target_max = max(35, int(word_count * 0.18))
            target_min = max(15, int(target_max * 0.4))
        elif preset == "long":
            target_max = max(150, int(word_count * 0.55))
            target_min = max(60, int(target_max * 0.4))
        else:  # medium
            target_max = max(80, int(word_count * 0.35))
            target_min = max(30, int(target_max * 0.4))

        # Honor explicit user overrides if provided
        if max_length and max_length > 0:
            target_max = max_length
        if min_length and min_length > 0:
            target_min = min(min_length, target_max - 15)

        target_max = min(600, max(40, target_max))
        target_min = max(10, min(target_min, target_max - 15))

        if self.summarizer_pipeline is None:
            self.load_model()

        if self.summarizer_pipeline is None:
            return self._proportional_fallback(cleaned_text, target_max), "Rule-based Fallback"

        # Stage 3: Sentence-Aware Chunking (never cuts sentences in the middle)
        t0 = time.perf_counter()
        chunks = create_sentence_chunks(cleaned_text, max_chunk_words=400, overlap_sentences=1)
        t_chunking = (time.perf_counter() - t0) * 1000

        # High-Quality BART Generation Parameters
        gen_kwargs = {
            "num_beams": 6,
            "early_stopping": True,
            "length_penalty": 2.0,
            "repetition_penalty": 1.3,
            "no_repeat_ngram_size": 3,
            "do_sample": False,
            "truncation": True
        }

        t_pass1 = 0.0
        t_pass2 = 0.0

        try:
            with torch.no_grad():
                if len(chunks) == 1:
                    # Single Pass Summarization
                    t0 = time.perf_counter()
                    res = self.summarizer_pipeline(
                        chunks[0],
                        max_length=target_max,
                        min_length=target_min,
                        **gen_kwargs
                    )
                    final_summary = res[0]['summary_text'].strip()
                    t_pass1 = (time.perf_counter() - t0) * 1000
                else:
                    # Hierarchical Two-Pass Summarization
                    # Pass 1: Summarize each chunk individually using BART
                    t0 = time.perf_counter()
                    chunk_summaries = []
                    per_chunk_max = max(40, int(target_max / len(chunks)) + 35)
                    per_chunk_min = max(15, int(per_chunk_max * 0.35))

                    for chunk in chunks[:6]:  # Limit to top 6 chunks for speed
                        res = self.summarizer_pipeline(
                            chunk,
                            max_length=per_chunk_max,
                            min_length=per_chunk_min,
                            **gen_kwargs
                        )
                        chunk_summaries.append(res[0]['summary_text'].strip())
                    t_pass1 = (time.perf_counter() - t0) * 1000

                    # Pass 2: Merge chunk summaries and run one final BART pass for maximum coherence
                    t0 = time.perf_counter()
                    merged_intermediate = " ".join(chunk_summaries)
                    final_res = self.summarizer_pipeline(
                        merged_intermediate,
                        max_length=target_max,
                        min_length=target_min,
                        **gen_kwargs
                    )
                    final_summary = final_res[0]['summary_text'].strip()
                    t_pass2 = (time.perf_counter() - t0) * 1000

            t_total = (time.perf_counter() - t_start) * 1000
            print(f"⏱️ [PERF BART Summarizer] Text Cleaning: {t_clean:.1f}ms | Chunking: {t_chunking:.1f}ms ({len(chunks)} chunks) | Pass1: {t_pass1:.1f}ms | Pass2: {t_pass2:.1f}ms | Total Time: {t_total:.1f}ms")

            if torch.cuda.is_available():
                torch.cuda.empty_cache()

            return final_summary, self.active_model_name

        except Exception as err:
            print(f"⚠️ BART inference exception: {err}. Executing smart fallback...")
            return self._proportional_fallback(cleaned_text, target_max), f"{self.active_model_name} (Fallback)"

    def _proportional_fallback(self, text: str, target_max_words: int) -> str:
        """
        Smart fallback that extracts sentences proportional to target length.
        """
        sentences = split_into_sentences(text)
        if not sentences:
            return text[:target_max_words * 5]

        needed_sentences = max(2, min(len(sentences), int(target_max_words / 15)))
        return " ".join(sentences[:needed_sentences])
