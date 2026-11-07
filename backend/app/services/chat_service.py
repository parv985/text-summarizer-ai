from typing import Dict, Any
from app.ai.rag_pipeline import rag_pipeline


class ChatService:
    def process_question(self, question: str) -> Dict[str, Any]:
        return rag_pipeline.answer_question(question)

    def index_document_text(self, text: str, filename: str = "Document") -> int:
        return rag_pipeline.index_document(text, filename=filename)

    def reset_session(self):
        rag_pipeline.reset_session()


chat_service = ChatService()
