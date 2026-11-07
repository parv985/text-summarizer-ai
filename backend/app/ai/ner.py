import spacy
from typing import List, Dict, Any

ENTITY_EXPLANATIONS = {
    "PERSON": "People, including fictional characters",
    "ORG": "Companies, agencies, institutions, and organizations",
    "GPE": "Countries, cities, states, and geopolitical entities",
    "LOC": "Non-GPE locations, mountain ranges, bodies of water",
    "DATE": "Absolute or relative dates or periods",
    "TIME": "Times smaller than a day",
    "MONEY": "Monetary values, including units",
    "PERCENT": "Percentage values including '%'",
    "FAC": "Buildings, airports, highways, bridges",
    "PRODUCT": "Objects, vehicles, foods, etc. (not services)",
    "EVENT": "Named hurricanes, battles, wars, sports events",
    "WORK_OF_ART": "Titles of books, songs, paintings, movies",
    "LAW": "Named laws, acts, or legal documents",
    "LANGUAGE": "Any named language",
    "NORP": "Nationalities or religious or political groups",
    "CARDINAL": "Numerals that do not fall under another type",
    "ORDINAL": "First, second, third, etc.",
    "QUANTITY": "Measurements, such as weight or distance"
}


class EntityRecognizer:
    def __init__(self):
        self.nlp = None

    def load_model(self):
        """Loads spaCy en_core_web_sm model into memory."""
        if self.nlp is not None:
            return
        print("📦 Loading spaCy NER model 'en_core_web_sm'...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ spaCy NER model loaded successfully!")
        except Exception as e:
            print(f"⚠️ spaCy model 'en_core_web_sm' not installed ({e}). Downloading...")
            try:
                from spacy.cli import download
                download("en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
                print("✅ spaCy NER model downloaded and loaded!")
            except Exception as e_dl:
                print(f"❌ spaCy download failed: {e_dl}. Falling back to blank English tokenizer.")
                self.nlp = spacy.blank("en")

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract named entities from input text using spaCy.
        Returns detailed list of entity occurrences with category counts.
        """
        if not text or len(text.strip()) == 0:
            return {"entities": [], "entity_counts": {}}

        if self.nlp is None:
            self.load_model()

        doc = self.nlp(text)
        entities = []
        counts: Dict[str, int] = {}

        seen_spans = set()

        for ent in doc.ents:
            span_key = (ent.start_char, ent.end_char)
            if span_key in seen_spans:
                continue
            seen_spans.add(span_key)

            label = ent.label_
            counts[label] = counts.get(label, 0) + 1
            
            entities.append({
                "text": ent.text,
                "label": label,
                "explanation": ENTITY_EXPLANATIONS.get(label, "Named entity"),
                "start_char": ent.start_char,
                "end_char": ent.end_char
            })

        return {
            "entities": entities,
            "entity_counts": counts
        }
