import time
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.schemas.requests import ChatRequest, ChatResponse
from app.services.chat_service import chat_service
from app.ai.job_state import rag_job_state

router = APIRouter(prefix="/api", tags=["Document QA RAG"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_document(payload: ChatRequest):
    """
    RAG Endpoint: Answers user questions strictly based on the active FAISS vector index of the uploaded document.
    """
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Offload vector search & inference to thread pool
    result = await run_in_threadpool(chat_service.process_question, payload.question)
    return ChatResponse(**result)


@router.get("/chat/status")
async def get_chat_status():
    """
    Fast Status Endpoint: Reads atomic job state in memory (< 5 ms).
    Never triggers background work, never acquires long-running locks, never waits for AI models.
    """
    t0 = time.perf_counter()
    status_info = rag_job_state.to_dict()
    elapsed_ms = (time.perf_counter() - t0) * 1000
    
    print(f"⚡ GET /api/chat/status | Elapsed: {elapsed_ms:.2f} ms | Status: '{status_info['status']}' | Stage: '{status_info['stage']}'")
    return status_info


@router.post("/chat/reset")
async def reset_chat_session():
    """
    Reset Endpoint: Clears active document, embeddings, FAISS index, metadata, and resets job status to idle.
    """
    t0 = time.perf_counter()
    chat_service.reset_session()
    elapsed_ms = (time.perf_counter() - t0) * 1000
    print(f"🧹 POST /api/chat/reset | Elapsed: {elapsed_ms:.2f} ms | Document Session Reset.")
    return {
        "status": "idle",
        "document_loaded": False,
        "filename": "",
        "chunk_count": 0,
        "stage": "No Document Loaded",
        "ready": False,
        "error_detail": None
    }
