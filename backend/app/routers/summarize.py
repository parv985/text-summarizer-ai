from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from app.schemas.requests import SummarizeRequest, SummarizeResponse, ExtractiveRequest, ExtractiveResponse
from app.utils.text_cleaner import clean_text, calculate_reading_time
from app.models.history import history_store
from app.ai.pipeline import ai_pipeline
from app.services.chat_service import chat_service
from app.ai.job_state import rag_job_state

router = APIRouter(prefix="/api", tags=["Summarization Engine"])


@router.post("/summarize", response_model=SummarizeResponse)
async def generate_abstractive_summary(payload: SummarizeRequest, background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Generate an abstractive summary using BART Transformer model and enqueue background RAG FAISS vector store indexing.
    """
    cleaned = clean_text(payload.text)
    if not cleaned or len(cleaned.split()) < 5:
        raise HTTPException(
            status_code=400, 
            detail="Input text is too short. Please provide at least a few sentences (minimum 10 characters)."
        )

    # Start RAG Job State immediately
    filename_title = cleaned[:30].strip().replace('\n', ' ') + "..."
    rag_job_state.start_job(filename=filename_title)
    background_tasks.add_task(chat_service.index_document_text, cleaned, filename_title)

    summary_text, model_name = await run_in_threadpool(
        ai_pipeline.summarize_abstractive,
        cleaned,
        max_length=payload.max_length,
        min_length=payload.min_length,
        preset=payload.length_preset
    )

    words_orig = len(cleaned.split())
    words_summ = len(summary_text.split())
    chars_orig = len(cleaned)
    chars_summ = len(summary_text)

    orig_read_min = calculate_reading_time(words_orig)
    summ_read_min = calculate_reading_time(words_summ)
    reduction = f"{max(0.0, round(orig_read_min - summ_read_min, 1))} mins"

    comp_percent = max(0.0, round((1 - (words_summ / words_orig if words_orig > 0 else 0)) * 100, 1))
    comp_ratio = f"{comp_percent}% reduction"

    # Store in history
    history_store.add_item(
        original_text=cleaned,
        abstractive_summary=summary_text
    )

    return SummarizeResponse(
        summary=summary_text,
        original_word_count=words_orig,
        summary_word_count=words_summ,
        original_char_count=chars_orig,
        summary_char_count=chars_summ,
        reading_time_reduction=reduction,
        compression_ratio=comp_ratio,
        model_used=model_name
    )


@router.post("/extractive", response_model=ExtractiveResponse)
async def generate_extractive_summary(payload: ExtractiveRequest, background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Generate an extractive summary using TextRank algorithm and enqueue background RAG FAISS vector store indexing.
    """
    cleaned = clean_text(payload.text)
    if not cleaned or len(cleaned.split()) < 5:
        raise HTTPException(
            status_code=400, 
            detail="Input text is too short for extractive summarization."
        )

    # Start RAG Job State immediately
    filename_title = cleaned[:30].strip().replace('\n', ' ') + "..."
    rag_job_state.start_job(filename=filename_title)
    background_tasks.add_task(chat_service.index_document_text, cleaned, filename_title)

    summary_text = await run_in_threadpool(
        ai_pipeline.summarize_extractive,
        cleaned,
        sentence_count=payload.sentence_count
    )
    
    words_orig = len(cleaned.split())
    words_summ = len(summary_text.split())
    comp_percent = max(0.0, round((1 - (words_summ / words_orig if words_orig > 0 else 0)) * 100, 1))

    # Store in history
    history_store.add_item(
        original_text=cleaned,
        extractive_summary=summary_text
    )

    return ExtractiveResponse(
        summary=summary_text,
        sentence_count=payload.sentence_count,
        original_word_count=words_orig,
        summary_word_count=words_summ,
        compression_ratio=f"{comp_percent}% reduction"
    )
