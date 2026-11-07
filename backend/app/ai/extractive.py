import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words


class ExtractiveSummarizer:
    def __init__(self, language: str = "english"):
        self.language = language
        self._ensure_nltk_data()
        self.stemmer = Stemmer(self.language)
        self.text_rank = TextRankSummarizer(self.stemmer)
        self.text_rank.stop_words = get_stop_words(self.language)

    def _ensure_nltk_data(self):
        """Ensure NLTK punkt and stopwords data packages are downloaded."""
        for resource in ['punkt', 'stopwords', 'punkt_tab']:
            try:
                nltk.data.find(f'tokenizers/{resource}')
            except LookupError:
                try:
                    nltk.download(resource, quiet=True)
                except Exception as e:
                    print(f"⚠️ NLTK download '{resource}' warning: {e}")

    def extract_top_sentences(self, text: str, sentence_count: int = 3) -> list[str]:
        """
        Extracts top-ranked sentences using TextRank, maintaining sentence flow and removing duplicates.
        """
        if not text or len(text.strip()) == 0:
            return []

        try:
            parser = PlaintextParser.from_string(text, Tokenizer(self.language))
            raw_sentences = self.text_rank(parser.document, sentence_count)
            extracted = [str(s).strip() for s in raw_sentences if len(str(s).strip()) > 10]

            if not extracted:
                # Fallback to Luhn algorithm if TextRank returned empty
                luhn = LuhnSummarizer(self.stemmer)
                luhn.stop_words = get_stop_words(self.language)
                raw_sentences = luhn(parser.document, sentence_count)
                extracted = [str(s).strip() for s in raw_sentences if len(str(s).strip()) > 10]

            if not extracted:
                split_sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
                extracted = split_sentences[:sentence_count]

            # Deduplicate while preserving order
            unique_sentences = []
            seen = set()
            for s in extracted:
                s_lower = s.lower()
                if s_lower not in seen:
                    seen.add(s_lower)
                    unique_sentences.append(s)

            return unique_sentences
        except Exception as e:
            print(f"⚠️ TextRank extraction warning: {e}")
            split_sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
            return split_sentences[:sentence_count]

    def summarize(self, text: str, sentence_count: int = 3) -> str:
        """
        Generates an extractive summary using the TextRank graph-based sentence ranking algorithm.
        """
        sentences = self.extract_top_sentences(text, sentence_count=sentence_count)
        return " ".join(sentences)


# Export singleton
extractive_summarizer = ExtractiveSummarizer()
