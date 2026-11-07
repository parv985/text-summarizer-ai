from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class SummarizeRequest(BaseModel):
    text: str = Field(..., description="Original text to be summarized", min_length=10)
    max_length: Optional[int] = Field(150, description="Maximum summary token length")
    min_length: Optional[int] = Field(30, description="Minimum summary token length")
    length_preset: Optional[str] = Field("medium", description="Length preset: short, medium, long")


class ExtractiveRequest(BaseModel):
    text: str = Field(..., description="Text for extractive summarization", min_length=10)
    sentence_count: Optional[int] = Field(3, description="Number of sentences to extract", ge=1, le=20)


class KeywordsRequest(BaseModel):
    text: str = Field(..., description="Text for keyword extraction", min_length=10)
    top_n: Optional[int] = Field(8, description="Number of keywords to extract", ge=1, le=30)


class EntitiesRequest(BaseModel):
    text: str = Field(..., description="Text for named entity recognition", min_length=5)


class EvaluateRequest(BaseModel):
    original_text: str = Field(..., description="Original text")
    summary_text: str = Field(..., description="Generated summary text")


class ChatRequest(BaseModel):
    question: str = Field(..., description="User question about the uploaded document/text", min_length=1)


class ChatResponse(BaseModel):
    answer: str
    grounded: Optional[bool] = True


class SummarizeResponse(BaseModel):
    summary: str
    original_word_count: int
    summary_word_count: int
    original_char_count: int
    summary_char_count: int
    reading_time_reduction: str
    compression_ratio: str
    model_used: str


class ExtractiveResponse(BaseModel):
    summary: str
    sentence_count: int
    original_word_count: int
    summary_word_count: int
    compression_ratio: str


class KeywordItem(BaseModel):
    keyword: str
    score: float


class KeywordsResponse(BaseModel):
    keywords: List[KeywordItem]


class EntityItem(BaseModel):
    text: str
    label: str
    explanation: str
    start_char: int
    end_char: int


class EntitiesResponse(BaseModel):
    entities: List[EntityItem]
    entity_counts: Dict[str, int]


class RougeScores(BaseModel):
    rouge1: float
    rouge2: float
    rougeL: float


class ReadingStats(BaseModel):
    original_word_count: int
    summary_word_count: int
    original_char_count: int
    summary_char_count: int
    original_sentence_count: int
    summary_sentence_count: int
    original_reading_time_min: float
    summary_reading_time_min: float
    reading_time_saved_percent: float
    compression_ratio_percent: float


class EvaluateResponse(BaseModel):
    rouge_scores: RougeScores
    statistics: ReadingStats


class PDFExtractResponse(BaseModel):
    filename: str
    page_count: int
    word_count: int
    extracted_text: str


class HistoryItem(BaseModel):
    id: str
    timestamp: str
    title: str
    original_text: str
    abstractive_summary: Optional[str] = None
    extractive_summary: Optional[str] = None
    keywords: Optional[List[Union[str, Dict[str, Any]]]] = Field(default_factory=list)
    word_count_original: int
    word_count_summary: int
    compression_ratio: str
