import fitz  # PyMuPDF
from fastapi import HTTPException
from app.utils.text_cleaner import clean_text

MAX_PDF_PAGES = 50
MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit


def extract_text_from_pdf(file_bytes: bytes, filename: str) -> dict:
    """
    Extract text content from PDF bytes safely.
    Includes file size checks, max page count bounds, and clean resource destruction.
    """
    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed limit of 15MB. Your file is {round(len(file_bytes)/(1024*1024), 2)}MB."
        )

    doc = None
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        if doc.page_count == 0:
            raise HTTPException(status_code=400, detail="The uploaded PDF file contains zero readable pages.")
            
        if doc.page_count > MAX_PDF_PAGES:
            print(f"⚠️ PDF '{filename}' has {doc.page_count} pages. Processing first {MAX_PDF_PAGES} pages.")

        pages_to_process = min(doc.page_count, MAX_PDF_PAGES)
        full_text_pages = []

        for page_num in range(pages_to_process):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text and text.strip():
                full_text_pages.append(text.strip())
                
        extracted = "\n\n".join(full_text_pages)
        cleaned = clean_text(extracted)
        
        if not cleaned or len(cleaned.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract readable text from the PDF. The file may be an image-only/scanned PDF without OCR text layers."
            )
            
        words = len(cleaned.split())
        
        return {
            "filename": filename,
            "page_count": pages_to_process,
            "word_count": words,
            "extracted_text": cleaned
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to process PDF document '{filename}': {str(e)}"
        )
    finally:
        if doc:
            try:
                doc.close()
            except Exception:
                pass
