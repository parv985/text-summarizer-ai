from typing import Dict, Any, List, Optional
from app.ai.abstractive import AbstractiveSummarizer
from app.ai.extractive import ExtractiveSummarizer
from app.ai.keywords import KeywordExtractor
from app.ai.ner import EntityRecognizer
from app.ai.metrics import MetricsEvaluator


class AIPipelineManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIPipelineManager, cls).__new__(cls)
            cls._instance.abstractive = AbstractiveSummarizer()
            cls._instance.extractive = ExtractiveSummarizer()
            cls._instance.keywords = KeywordExtractor()
            cls._instance.ner = EntityRecognizer()
            cls._instance.metrics = MetricsEvaluator()
            cls._instance.loaded = False
        return cls._instance

    def preload_models(self):
        """
        Pre-warms and loads models into memory once at application startup.
        Ensures fast inference on user requests.
        """
        if self.loaded:
            return

        print("⚡ [AIPipelineManager] Pre-loading all AI models...")
        # Load spaCy NER
        self.ner.load_model()
        # Load Abstractive Transformer
        self.abstractive.load_model()
        # Load KeyBERT
        self.keywords.load_model()
        self.loaded = True
        print("🎉 [AIPipelineManager] All AI engines ready!")

    def is_loaded(self) -> bool:
        return self.loaded

    def summarize_abstractive(self, text: str, max_length: Optional[int] = 150, min_length: Optional[int] = 30, preset: str = "medium") -> tuple[str, str]:
        return self.abstractive.summarize(text, max_length=max_length, min_length=min_length, preset=preset)

    def summarize_extractive(self, text: str, sentence_count: int = 3) -> str:
        return self.extractive.summarize(text, sentence_count=sentence_count)

    def extract_keywords(self, text: str, top_n: int = 8) -> List[Dict[str, Any]]:
        return self.keywords.extract_keywords(text, top_n=top_n)

    def extract_entities(self, text: str) -> Dict[str, Any]:
        return self.ner.extract_entities(text)

    def evaluate_summary(self, original_text: str, summary_text: str) -> Dict[str, Any]:
        return self.metrics.evaluate(original_text, summary_text)


# Export singleton
ai_pipeline = AIPipelineManager()
