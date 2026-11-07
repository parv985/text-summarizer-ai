import re
from typing import List
from app.utils.text_cleaner import clean_text


class DocumentLoader:
    def __init__(self, min_chunk_words: int = 250, max_chunk_words: int = 450, overlap_words: int = 50):
        self.min_chunk_words = min_chunk_words
        self.max_chunk_words = max_chunk_words
        self.overlap_words = overlap_words

    def create_chunks(self, text: str) -> List[str]:
        """
        Cleans text and splits it into semantic chunks of ~300 to 500 words with 50-word overlap.
        Preserves paragraph and sentence integrity.
        """
        cleaned = clean_text(text)
        if not cleaned or len(cleaned.strip()) == 0:
            return []

        # Split into paragraphs first
        paragraphs = [p.strip() for p in cleaned.split('\n\n') if p.strip()]
        
        chunks: List[str] = []
        current_chunk_words: List[str] = []

        for paragraph in paragraphs:
            para_words = paragraph.split()
            
            # If a single paragraph is larger than max_chunk_words, split it by sentences
            if len(para_words) > self.max_chunk_words:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    sent_words = sentence.split()
                    if len(current_chunk_words) + len(sent_words) > self.max_chunk_words:
                        if current_chunk_words:
                            chunks.append(" ".join(current_chunk_words))
                            # Keep overlap
                            overlap = current_chunk_words[-self.overlap_words:] if len(current_chunk_words) > self.overlap_words else []
                            current_chunk_words = overlap + sent_words
                        else:
                            chunks.append(" ".join(sent_words))
                    else:
                        current_chunk_words.extend(sent_words)
            else:
                if len(current_chunk_words) + len(para_words) > self.max_chunk_words:
                    chunks.append(" ".join(current_chunk_words))
                    overlap = current_chunk_words[-self.overlap_words:] if len(current_chunk_words) > self.overlap_words else []
                    current_chunk_words = overlap + para_words
                else:
                    current_chunk_words.extend(para_words)

        if current_chunk_words:
            chunk_str = " ".join(current_chunk_words).strip()
            if chunk_str:
                chunks.append(chunk_str)

        return chunks


document_loader = DocumentLoader()
