import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import summarize, pdf, nlp, history, chat
from app.ai.pipeline import ai_pipeline
from app.ai.embeddings import embedding_generator


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan: Pre-warm models once during startup.
    Reuses model instances across all requests without reloading.
    """
    print("🚀 Starting Summora FastAPI Server...")
    print("🤖 Pre-warming NLP models (BART, spaCy, KeyBERT, Sumy, SentenceTransformers)...")
    try:
        ai_pipeline.preload_models()
        embedding_generator.load_model()
        print("✅ All AI models and RAG Embedding engines loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning during model preload: {e}")
    yield
    print("🛑 Shutting down Summora FastAPI Server...")


app = FastAPI(
    title="Summora AI Text Summarizer & RAG Document QA API",
    description="Production-grade FastAPI backend for Abstractive & Extractive Summarization, PyMuPDF Document Reader, spaCy NER, KeyBERT, ROUGE evaluation, and FAISS Document QA.",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ Internal Server Error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )


# Health Check Endpoint
@app.get("/api/health", tags=["System Status"])
async def health_check():
    return {
        "status": "healthy",
        "app_name": "Summora AI API",
        "version": "1.1.0",
        "models_loaded": ai_pipeline.is_loaded()
    }


# Include Routers
app.include_router(summarize.router)
app.include_router(pdf.router)
app.include_router(nlp.router)
app.include_router(history.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
