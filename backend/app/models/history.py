import uuid
import threading
from datetime import datetime
from typing import List, Optional, Dict, Any, Union


class HistoryStore:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(HistoryStore, cls).__new__(cls)
                cls._instance.history_items: List[Dict[str, Any]] = []
        return cls._instance

    def add_item(self, original_text: str, abstractive_summary: Optional[str] = None, 
                 extractive_summary: Optional[str] = None, keywords: Optional[List[Union[str, Dict[str, Any]]]] = None) -> Dict[str, Any]:
        
        words_orig = len(original_text.split())
        summary_text = abstractive_summary or extractive_summary or ""
        words_summ = len(summary_text.split())
        
        # Division by zero protection
        ratio_val = round((1 - (words_summ / words_orig if words_orig > 0 else 0)) * 100, 1)
        ratio_str = f"{max(0.0, ratio_val)}%"
        
        title_clean = original_text.replace('\n', ' ').strip()
        title = title_clean[:50].strip() + ("..." if len(title_clean) > 50 else "")

        # Normalize keywords to string list or keep clean dict list
        sanitized_keywords = []
        if keywords:
            for kw in keywords:
                if isinstance(kw, dict) and "keyword" in kw:
                    sanitized_keywords.append(str(kw["keyword"]))
                elif isinstance(kw, str):
                    sanitized_keywords.append(kw)

        item = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "title": title,
            "original_text": original_text,
            "abstractive_summary": abstractive_summary,
            "extractive_summary": extractive_summary,
            "keywords": sanitized_keywords,
            "word_count_original": words_orig,
            "word_count_summary": words_summ,
            "compression_ratio": ratio_str
        }
        
        with self._lock:
            self.history_items.insert(0, item)
            if len(self.history_items) > 50:
                self.history_items = self.history_items[:50]
            
        return item

    def get_all(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self.history_items)

    def delete_by_id(self, item_id: str) -> bool:
        with self._lock:
            initial_length = len(self.history_items)
            self.history_items = [item for item in self.history_items if item["id"] != item_id]
            return len(self.history_items) < initial_length

    def clear(self):
        with self._lock:
            self.history_items = []


# Export thread-safe singleton
history_store = HistoryStore()
