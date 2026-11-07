import re
from typing import List


def clean_text(text: str) -> str:
    """
    Enhanced text cleaning for PDF extraction and NLP summarization:
    - Removes non-printable characters.
    - Rejoins hyphenated broken words across line breaks (e.g. "summa-\nrization" -> "summarization").
    - Removes standalone page numbers, headers, and footers.
    - Eliminates duplicate consecutive lines.
    - Normalizes inline whitespace while preserving paragraph structure (\n\n).
    """
    if not text:
        return ""

    # Remove non-printable control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

    # Fix broken hyphenated words at line breaks (e.g. "inform-\nation" -> "information")
    text = re.sub(r'(\b[A-Za-z]+)-\s*\n\s*([A-Za-z]+\b)', r'\1\2', text)

    # Split lines to clean page numbers, headers, footers, and duplicate consecutive lines
    lines = text.split('\n')
    cleaned_lines = []
    prev_line = ""

    page_num_patterns = [
        r'^(?:page\s+\d+(?:\s+of\s+\d+)?|\d+\s*/\s*\d+|-?\s*\d+\s*-?|\[page\s+\d+\])$',
    ]

    for line in lines:
        stripped = line.strip()

        # Skip standalone page numbers or footer artifacts
        if any(re.match(p, stripped, flags=re.IGNORECASE) for p in page_num_patterns):
            continue

        # Skip duplicate consecutive lines
        if stripped and stripped.lower() == prev_line.lower():
            continue

        cleaned_lines.append(line)
        if stripped:
            prev_line = stripped

    reconstructed = "\n".join(cleaned_lines)

    # Normalize inline multiple spaces while preserving newlines
    lines_normalized = []
    for l in reconstructed.split('\n'):
        lines_normalized.append(re.sub(r'[ \t]+', ' ', l).strip())

    result = "\n".join(lines_normalized)
    
    # Preserve paragraph breaks (double newlines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def split_into_sentences(text: str) -> List[str]:
    """
    Split text into clean, complete sentences using regex boundary matching.
    """
    if not text:
        return []
    raw_sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 5]
    return sentences if sentences else [text.strip()]


def create_sentence_chunks(text: str, max_chunk_words: int = 400, overlap_sentences: int = 1) -> List[str]:
    """
    Builds chunks composed strictly of complete sentences.
    Never truncates sentences in the middle.
    """
    sentences = split_into_sentences(text)
    if not sentences:
        return []

    chunks = []
    current_chunk = []
    current_words = 0

    for sent in sentences:
        sent_words = len(sent.split())
        if current_words + sent_words > max_chunk_words and current_chunk:
            chunks.append(" ".join(current_chunk))
            overlap = current_chunk[-overlap_sentences:] if len(current_chunk) >= overlap_sentences else []
            current_chunk = overlap + [sent]
            current_words = sum(len(s.split()) for s in current_chunk)
        else:
            current_chunk.append(sent)
            current_words += sent_words

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def calculate_reading_time(word_count: int, words_per_minute: int = 200) -> float:
    """
    Calculate estimated reading time in minutes based on average 200 WPM reading speed.
    """
    if word_count <= 0:
        return 0.0
    return round(word_count / words_per_minute, 2)
