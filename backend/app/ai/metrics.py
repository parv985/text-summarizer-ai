import re
from typing import Dict, Any
from rouge_score import rouge_scorer
from app.utils.text_cleaner import calculate_reading_time


class MetricsEvaluator:
    def __init__(self):
        self.scorer = rouge_scorer.RougeScorer(
            ['rouge1', 'rouge2', 'rougeL'], 
            use_stemmer=True
        )

    def evaluate(self, original_text: str, summary_text: str) -> Dict[str, Any]:
        """
        Calculate ROUGE scores (ROUGE-1, ROUGE-2, ROUGE-L F1 scores)
        and comprehensive text/reading statistics.
        """
        if not original_text or not summary_text:
            return {
                "rouge_scores": {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0},
                "statistics": self._get_empty_stats()
            }

        # 1. ROUGE Scores
        try:
            scores = self.scorer.score(original_text, summary_text)
            r1_f1 = round(float(scores['rouge1'].fmeasure), 4)
            r2_f1 = round(float(scores['rouge2'].fmeasure), 4)
            rl_f1 = round(float(scores['rougeL'].fmeasure), 4)
        except Exception as e:
            print(f"⚠️ ROUGE scoring warning: {e}")
            r1_f1, r2_f1, rl_f1 = 0.0, 0.0, 0.0

        # 2. Text Statistics
        orig_words = len(original_text.split())
        summ_words = len(summary_text.split())
        
        orig_chars = len(original_text)
        summ_chars = len(summary_text)

        orig_sentences = len(self._split_sentences(original_text))
        summ_sentences = len(self._split_sentences(summary_text))

        orig_read_time = calculate_reading_time(orig_words)
        summ_read_time = calculate_reading_time(summ_words)

        time_saved = max(0.0, round(orig_read_time - summ_read_time, 2))
        saved_percent = round((time_saved / orig_read_time * 100) if orig_read_time > 0 else 0, 1)

        comp_ratio = round((1 - (summ_words / orig_words if orig_words > 0 else 0)) * 100, 1)

        return {
            "rouge_scores": {
                "rouge1": r1_f1,
                "rouge2": r2_f1,
                "rougeL": rl_f1
            },
            "statistics": {
                "original_word_count": orig_words,
                "summary_word_count": summ_words,
                "original_char_count": orig_chars,
                "summary_char_count": summ_chars,
                "original_sentence_count": orig_sentences,
                "summary_sentence_count": summ_sentences,
                "original_reading_time_min": orig_read_time,
                "summary_reading_time_min": summ_read_time,
                "reading_time_saved_percent": saved_percent,
                "compression_ratio_percent": comp_ratio
            }
        }

    def _split_sentences(self, text: str) -> list[str]:
        return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]

    def _get_empty_stats(self) -> Dict[str, Any]:
        return {
            "original_word_count": 0,
            "summary_word_count": 0,
            "original_char_count": 0,
            "summary_char_count": 0,
            "original_sentence_count": 0,
            "summary_sentence_count": 0,
            "original_reading_time_min": 0.0,
            "summary_reading_time_min": 0.0,
            "reading_time_saved_percent": 0.0,
            "compression_ratio_percent": 0.0
        }
