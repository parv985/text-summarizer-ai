from typing import List, Tuple
from app.services.nvidia_llama import nvidia_llama, FALLBACK_UNGROUNDED_MSG, MODEL_CONTACT_ERROR_MSG


class GroundedChatGenerator:
    """
    RAG Document Chat Generator backed by NVIDIA Llama-3.1-8B-Instruct API.
    BART summarization pipeline remains untouched for abstractive summarization.
    """
    def generate_answer(self, question: str, retrieved_chunks: List[Tuple[str, float]]) -> str:
        """
        Delegates question answering over retrieved top-K document chunks to NVIDIA Llama API.
        """
        if not retrieved_chunks:
            return FALLBACK_UNGROUNDED_MSG

        return nvidia_llama.generate_answer(question, retrieved_chunks)


# Export singleton
grounded_chat = GroundedChatGenerator()
