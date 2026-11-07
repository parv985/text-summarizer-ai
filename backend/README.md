# Summora FastAPI Backend Service

Production-grade FastAPI backend for Abstractive & Extractive Summarization, PDF Parsing, spaCy NER, KeyBERT keyphrase extraction, and ROUGE evaluation.

## Features
- **Abstractive Model**: Hugging Face `facebook/bart-large-cnn` sequence-to-sequence model.
- **Extractive Engine**: Sumy TextRank graph-based sentence ranker.
- **PDF Processor**: Page-by-page text extraction via PyMuPDF (fitz).
- **spaCy NER**: Entity classification for Persons, Organizations, Geopolitical Entities, Dates, Money, Events.
- **KeyBERT Engine**: Keyphrase similarity extraction using BERT embeddings.
- **ROUGE Evaluation**: ROUGE-1, ROUGE-2, and ROUGE-L metric calculation with F1 scores.

## Installation & Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```env
   HOST=0.0.0.0
   PORT=8000
   BART_MODEL_NAME=facebook/bart-large-cnn
   FALLBACK_MODEL_NAME=sshleifer/distilbart-cnn-12-6
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Run Server**:
   ```bash
   python main.py
   # OR
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **API Documentation**:
   Access Swagger UI at `http://localhost:8000/docs