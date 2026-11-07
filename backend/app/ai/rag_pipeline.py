import time
from typing import Dict, Any
from app.ai.document_loader import document_loader
from app.ai.embeddings import embedding_generator
from app.ai.vector_store import vector_store
from app.ai.chat import grounded_chat, FALLBACK_UNGROUNDED_MSG
from app.ai.job_state import rag_job_state
from app.services.nvidia_llama import MODEL_CONTACT_ERROR_MSG


class RAGPipelineManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGPipelineManager, cls).__new__(cls)
        return cls._instance

    def index_document(self, text: str, filename: str = "Document") -> int:
        """
        Executes background RAG pipeline while updating atomic job state:
        Stage 1 (30%): Chunking
        Stage 2 (60%): Embedding Generation (all-MiniLM-L6-v2)
        Stage 3 (85%): FAISS Vector Store Indexing
        Stage 4 (100%): Ready & Document Loaded = True
        """
        if not text or len(text.strip()) < 10:
            rag_job_state.set_idle()
            vector_store.clear()
            return 0

        t_start = time.perf_counter()
        print(f"\n🚀 [RAG Pipeline] Starting indexing for document '{filename}'...")
        rag_job_state.update(status="extracting", progress=15, stage=f"Extracting text from '{filename}'...")

        try:
            # Stage 1: Semantic Chunking
            t0 = time.perf_counter()
            rag_job_state.update(status="chunking", progress=30, stage="Splitting text into semantic chunks...")
            chunks = document_loader.create_chunks(text)
            t_chunk = (time.perf_counter() - t0) * 1000
            print(f"⏱️ [PERF] Stage 1 - Semantic Chunking: Created {len(chunks)} chunks in {t_chunk:.2f}ms.")

            if not chunks:
                rag_job_state.set_idle()
                vector_store.clear()
                return 0

            # Stage 2: Embedding Generation
            rag_job_state.update(status="embedding", progress=60, stage=f"Generating embeddings for {len(chunks)} chunks...", chunk_count=len(chunks))
            t0 = time.perf_counter()
            embeddings = embedding_generator.generate_embeddings(chunks)
            t_embed = (time.perf_counter() - t0) * 1000
            print(f"⏱️ [PERF] Stage 2 - Embedding Generation: Generated {embeddings.shape[0]} embeddings in {t_embed:.2f}ms.")

            # Stage 3: FAISS Vector Indexing
            rag_job_state.update(status="indexing", progress=85, stage="Building FAISS search index...", chunk_count=len(chunks))
            t0 = time.perf_counter()
            t_total_indexing = (time.perf_counter() - t_start) * 1000
            vector_store.create_index(chunks, embeddings, indexing_time_ms=t_total_indexing)
            t_faiss = (time.perf_counter() - t0) * 1000
            print(f"⏱️ [PERF] Stage 3 - FAISS Index Creation: Built index in {t_faiss:.2f}ms.")

            # Stage 4: Mark Ready & Document Loaded
            rag_job_state.set_ready(filename=filename, chunk_count=len(chunks))
            t_total = (time.perf_counter() - t_start) * 1000
            print(f"🎉 [PERF] RAG Indexing SUCCESS: Document '{filename}' is READY ({len(chunks)} chunks) in {t_total:.2f}ms.\n")
            return len(chunks)

        except Exception as e:
            error_msg = f"RAG indexing failed: {str(e)}"
            print(f"❌ [RAG Pipeline] Exception during indexing: {error_msg}")
            rag_job_state.set_error(message="Failed to build search index", detail=error_msg)
            return 0

    def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Executes grounded RAG question answering using Top 5 FAISS chunks and NVIDIA Llama-3.1-8B-Instruct.
        """
        job_info = rag_job_state.to_dict()
        if not job_info["ready"]:
            if job_info["status"] in ["extracting", "chunking", "embedding", "indexing"]:
                return {
                    "answer": f"Document index is building ({job_info['stage']}). Please wait...",
                    "grounded": False
                }
            return {
                "answer": "Please upload a document or paste text first.",
                "grounded": False
            }

        q_clean = question.strip()
        if not q_clean:
            return {
                "answer": "Please enter a valid question.",
                "grounded": False
            }

        # Embed question
        t0 = time.perf_counter()
        q_embedding = embedding_generator.generate_single_embedding(q_clean)
        
        # Retrieve top 5 relevant chunks (as requested for Llama context)
        retrieved_chunks = vector_store.search_relevant_chunks(q_embedding, top_k=5, min_similarity=0.20)
        t_search = (time.perf_counter() - t0) * 1000
        print(f"⏱️ [PERF] RAG Search for question '{q_clean[:30]}...' retrieved {len(retrieved_chunks)} chunks in {t_search:.2f}ms.")

        if not retrieved_chunks:
            return {
                "answer": FALLBACK_UNGROUNDED_MSG,
                "grounded": False
            }

        # Generate grounded response via NVIDIA Llama API
        answer = grounded_chat.generate_answer(q_clean, retrieved_chunks)

        is_grounded = answer not in (FALLBACK_UNGROUNDED_MSG, MODEL_CONTACT_ERROR_MSG)

        return {
            "answer": answer,
            "grounded": is_grounded
        }

    def reset_session(self):
        rag_job_state.set_idle()
        vector_store.clear()


rag_pipeline = RAGPipelineManager()
