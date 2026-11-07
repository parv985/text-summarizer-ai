import time
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.schemas.requests import PDFExtractResponse
from app.utils.pdf_parser import extract_text_from_pdf
from app.services.chat_service import chat_service
from app.ai.job_state import rag_job_state

router = APIRouter(prefix="/api", tags=["PDF Processing"])


@router.post("/upload-pdf", response_model=PDFExtractResponse)
async def upload_pdf(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Upload a PDF document, parse pages using PyMuPDF, and trigger async background RAG vector indexing.
    Returns extracted text immediately in < 150ms without blocking HTTP request.
    """
    t0 = time.perf_counter()
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload a valid PDF document (.pdf)."
        )
        
    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty or corrupted.")
        
    # Start RAG Job State immediately with filename
    rag_job_state.start_job(filename=file.filename)

    # Extract text cleanly
    result = extract_text_from_pdf(content, file.filename)
    t_pdf = (time.perf_counter() - t0) * 1000
    print(f"⏱️ [PERF] PDF Text Extraction for '{file.filename}' ({result['page_count']} pages, {result['word_count']} words) completed in {t_pdf:.2f}ms.")
    
    # Enqueue background task for RAG FAISS vector indexing (Non-blocking response)
    if result.get("extracted_text"):
        background_tasks.add_task(chat_service.index_document_text, result["extracted_text"], file.filename)

    return result
