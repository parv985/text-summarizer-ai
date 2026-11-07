import time
import torch
from typing import List
import numpy as np


class EmbeddingGenerator:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingGenerator, cls).__new__(cls)
            cls._instance.model_name = "sentence-transformers/all-MiniLM-L6-v2"
            cls._instance.model = None
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
        return cls._instance

    def load_model(self):
        """
        Loads SentenceTransformer model into memory ONCE during server startup.
        Pre-warms weights to ensure fast inference.
        """
        if self.model is not None:
            return

        t0 = time.perf_counter()
        print(f"📦 [EmbeddingGenerator] Pre-loading '{self.model_name}' on device {self.device}...")
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name, device=self.device)
            # Warmup pass
            _ = self.model.encode(["warmup sentence"], show_progress_bar=False)
            t_load = (time.perf_counter() - t0) * 1000
            print(f"✅ [EmbeddingGenerator] Model '{self.model_name}' pre-loaded in {t_load:.2f}ms!")
        except Exception as e:
            print(f"⚠️ [EmbeddingGenerator] Load warning: {e}. Trying fallback initialization...")
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
                print(f"✅ [EmbeddingGenerator] Fallback model loaded!")
            except Exception as e_fallback:
                print(f"❌ [EmbeddingGenerator] Error loading SentenceTransformer: {e_fallback}")
                self.model = None

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Encodes a list of text strings into normalized 384-dimensional dense vectors using optimized batching.
        Logs stage duration.
        """
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        if self.model is None:
            self.load_model()

        if self.model is None:
            raise RuntimeError("SentenceTransformer embedding model is not loaded.")

        t0 = time.perf_counter()
        
        # Batching optimization (batch_size=32)
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        
        t_embed = (time.perf_counter() - t0) * 1000
        print(f"⏱️ [PERF] Embedding Generation for {len(texts)} chunks completed in {t_embed:.2f}ms ({t_embed/max(1, len(texts)):.2f}ms/chunk).")
        return embeddings.astype(np.float32)

    def generate_single_embedding(self, text: str) -> np.ndarray:
        return self.generate_embeddings([text])


# Export singleton
embedding_generator = EmbeddingGenerator()
