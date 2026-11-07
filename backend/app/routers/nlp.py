from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.schemas.requests import (
    KeywordsRequest, KeywordsResponse,
    EntitiesRequest, EntitiesResponse,
    EvaluateRequest, EvaluateResponse
)
from app.utils.text_cleaner import clean_text
from app.ai.pipeline import ai_pipeline

router = APIRouter(prefix="/api", tags=["NLP & Evaluation Analytics"])


@router.post("/keywords", response_model=KeywordsResponse)
async def extract_keywords(payload: KeywordsRequest):
    """
    Extract key phrases and keywords using KeyBERT transformer models.
    """
    cleaned = clean_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    keywords = await run_in_threadpool(ai_pipeline.extract_keywords, cleaned, top_n=payload.top_n)
    return KeywordsResponse(keywords=keywords)


@router.post("/entities", response_model=EntitiesResponse)
async def detect_entities(payload: EntitiesRequest):
    """
    Perform Named Entity Recognition (NER) using spaCy.
    """
    cleaned = clean_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    result = await run_in_threadpool(ai_pipeline.extract_entities, cleaned)
    return EntitiesResponse(**result)


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_summary(payload: EvaluateRequest):
    """
    Compute ROUGE-1, ROUGE-2, ROUGE-L metrics and comparative reading statistics.
    """
    orig_cleaned = clean_text(payload.original_text)
    summ_cleaned = clean_text(payload.summary_text)

    if not orig_cleaned or not summ_cleaned:
        raise HTTPException(status_code=400, detail="Both original text and summary text must be provided.")

    evaluation = await run_in_threadpool(ai_pipeline.evaluate_summary, orig_cleaned, summ_cleaned)
    return EvaluateResponse(**evaluation)
