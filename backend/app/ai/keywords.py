import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer


class KeywordExtractor:
    def __init__(self):
        self.keybert_model = None

    def load_model(self):
        """Lazy load KeyBERT model."""
        if self.keybert_model is not None:
            return
        try:
            from keybert import KeyBERT
            print("📦 Loading KeyBERT model...")
            self.keybert_model = KeyBERT(model="all-MiniLM-L6-v2")
            print("✅ KeyBERT model loaded successfully!")
        except Exception as e:
            print(f"⚠️ KeyBERT load warning: {e}. Will use TF-IDF keyword extraction fallback.")
            self.keybert_model = False

    def extract_keywords(self, text: str, top_n: int = 8) -> List[Dict[str, Any]]:
        """
        Extract key phrases and keywords using KeyBERT BERT embeddings,
        or TF-IDF frequency similarity fallback.
        """
        if not text or len(text.strip()) == 0:
            return []

        if self.keybert_model is None:
            self.load_model()

        if self.keybert_model:
            try:
                keywords = self.keybert_model.extract_keywords(
                    text,
                    keyphrase_ngram_range=(1, 2),
                    stop_words='english',
                    use_maxsum=True,
                    nr_candidates=20,
                    top_n=top_n
                )
                return [{"keyword": kw[0], "score": round(float(kw[1]), 3)} for kw in keywords]
            except Exception as e:
                print(f"⚠️ KeyBERT extraction failed ({e}), using TF-IDF fallback...")

        # TF-IDF Fallback
        try:
            vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=top_n * 2
            )
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            scores = tfidf_matrix.toarray()[0]

            word_score_tuples = list(zip(feature_names, scores))
            word_score_tuples.sort(key=lambda x: x[1], reverse=True)

            results = []
            for word, score in word_score_tuples[:top_n]:
                if len(word) > 2 and not word.isdigit():
                    results.append({"keyword": word, "score": round(float(score), 3)})
            return results
        except Exception as err:
            print(f"⚠️ Keyword extraction fallback failed: {err}")
            # Basic frequency count fallback
            words = re.findall(r'\b[A-Za-z]{3,}\b', text.lower())
            from collections import Counter
            common = Counter(words).most_common(top_n)
            max_c = common[0][1] if common else 1
            return [{"keyword": w, "score": round(c / max_c, 3)} for w, c in common]
