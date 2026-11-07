import threading
import time
from typing import List, Tuple, Optional, Dict, Any
import numpy as np


class FAISSVectorStore:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(FAISSVectorStore, cls).__new__(cls)
                cls._instance.index = None
                cls._instance.chunks: List[str] = []
                cls._instance.dimension = 384
                cls._instance.status = "idle"  # idle, indexing, ready, error
                cls._instance.stage_message = "No document loaded"
                cls._instance.error_detail = None
                cls._instance.last_index_time_ms = 0.0
        return cls._instance

    def set_status(self, status: str, message: str, error_detail: Optional[str] = None):
        with self._lock:
            self.status = status
            self.stage_message = message
            self.error_detail = error_detail

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "status": self.status,
                "stage_message": self.stage_message,
                "error_detail": self.error_detail,
                "chunk_count": len(self.chunks),
                "ready": self.status == "ready" and len(self.chunks) > 0,
                "indexing_time_ms": round(self.last_index_time_ms, 2)
            }

    def create_index(self, chunks: List[str], embeddings: np.ndarray, indexing_time_ms: float = 0.0):
        """
        Creates and caches a new FAISS inner-product vector index for normalized embeddings.
        """
        with self._lock:
            self.clear_data()
            if len(chunks) == 0 or len(embeddings) == 0:
                self.status = "idle"
                self.stage_message = "Document contained no indexable text chunks"
                return

            try:
                import faiss
                self.dimension = embeddings.shape[1]
                self.index = faiss.IndexFlatIP(self.dimension)
                self.index.add(embeddings)
                self.chunks = list(chunks)
                self.status = "ready"
                self.stage_message = "Document Ready"
                self.last_index_time_ms = indexing_time_ms
                print(f"⚡ [FAISSVectorStore] Indexed {len(chunks)} chunks into FAISS in {indexing_time_ms:.2f}ms.")
            except Exception as e:
                print(f"⚠️ [FAISSVectorStore] FAISS native index creation warning: {e}. Using NumPy vector search.")
                self.index = "numpy_fallback"
                self.chunks = list(chunks)
                self.embeddings_matrix = embeddings
                self.status = "ready"
                self.stage_message = "Document Ready"
                self.last_index_time_ms = indexing_time_ms

    def search_relevant_chunks(self, query_embedding: np.ndarray, top_k: int = 3, min_similarity: float = 0.25) -> List[Tuple[str, float]]:
        with self._lock:
            if self.status != "ready" or not self.chunks:
                return []

            results: List[Tuple[str, float]] = []

            # NumPy Fallback search
            if self.index == "numpy_fallback":
                scores = np.dot(self.embeddings_matrix, query_embedding.T).flatten()
                top_indices = np.argsort(scores)[::-1][:top_k]
                for idx in top_indices:
                    score = float(scores[idx])
                    if score >= min_similarity:
                        results.append((self.chunks[idx], score))
                return results

            try:
                scores, indices = self.index.search(query_embedding, top_k)
                for score, idx in zip(scores[0], indices[0]):
                    if idx != -1 and idx < len(self.chunks):
                        sim_score = float(score)
                        if sim_score >= min_similarity:
                            results.append((self.chunks[idx], sim_score))
                return results
            except Exception as e:
                print(f"❌ [FAISSVectorStore] Search error: {e}")
                return []

    def clear_data(self):
        self.index = None
        self.chunks = []
        self.embeddings_matrix = None
        self.status = "idle"
        self.stage_message = "No document loaded"
        self.error_detail = None
        self.last_index_time_ms = 0.0

    def clear(self):
        with self._lock:
            self.clear_data()
            print("🧹 [FAISSVectorStore] Vector store cleared for new session.")

    def has_document(self) -> bool:
        with self._lock:
            return self.status == "ready" and len(self.chunks) > 0


# Export singleton
vector_store = FAISSVectorStore()
