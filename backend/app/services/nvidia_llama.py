import os
import requests
from typing import List, Tuple
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

FALLBACK_UNGROUNDED_MSG = "The uploaded document does not contain enough information to answer this question."
MODEL_CONTACT_ERROR_MSG = "Unable to contact AI model. Please try again later."


class NvidiaLlamaService:
    def __init__(self):
        self.api_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        self.model_name = os.getenv("NVIDIA_MODEL_NAME", "meta/llama-3.1-8b-instruct")

    @property
    def api_key(self) -> str:
        return os.getenv("NVIDIA_API_KEY", "").strip()

    def generate_answer(self, question: str, retrieved_chunks: List[Tuple[str, float]]) -> str:
        """
        Sends retrieved top-K document chunks to NVIDIA Llama-3.1-8B-Instruct API.
        Enforces strict context grounding with zero hallucinations.
        """
        if not retrieved_chunks:
            return FALLBACK_UNGROUNDED_MSG

        api_key = self.api_key
        if not api_key:
            print("❌ [NvidiaLlamaService] Error: NVIDIA_API_KEY is missing or empty in .env")
            return MODEL_CONTACT_ERROR_MSG

        # Combine top-K chunks into context text
        context_snippets = [chunk_text for chunk_text, score in retrieved_chunks]
        combined_context = "\n\n".join(
            [f"[Snippet {i+1}]: {chunk}" for i, chunk in enumerate(context_snippets)]
        )

        system_prompt = (
            "You are an expert Document Question Answering assistant.\n"
            "You MUST answer the user's question using ONLY the provided document context snippets.\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. Rely ONLY on clear facts explicitly mentioned in the document snippets.\n"
            "2. Do NOT use outside knowledge, external memory, or invent information.\n"
            f"3. If the answer is NOT explicitly contained in the provided snippets, respond EXACTLY with:\n"
            f"\"{FALLBACK_UNGROUNDED_MSG}\"\n"
            "4. Be direct, factual, concise, and helpful."
        )

        user_content = (
            f"DOCUMENT CONTEXT:\n{combined_context}\n\n"
            f"QUESTION: {question}\n\n"
            f"ANSWER:"
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 512,
            "stream": False
        }

        try:
            print(f"🤖 [NvidiaLlamaService] Calling NVIDIA Llama API ('{self.model_name}') with {len(retrieved_chunks)} chunks...")
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)

            if response.status_code in (401, 403):
                print(f"❌ [NvidiaLlamaService] Auth Error HTTP {response.status_code}: Invalid or unauthorized NVIDIA API Key.")
                return MODEL_CONTACT_ERROR_MSG

            if response.status_code == 429:
                print(f"⚠️ [NvidiaLlamaService] Rate Limit Exceeded (HTTP 429).")
                return MODEL_CONTACT_ERROR_MSG

            if response.status_code != 200:
                print(f"❌ [NvidiaLlamaService] NVIDIA API HTTP {response.status_code} Error: {response.text}")
                return MODEL_CONTACT_ERROR_MSG

            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                return MODEL_CONTACT_ERROR_MSG

            raw_answer = choices[0].get("message", {}).get("content", "").strip()

            if not raw_answer or len(raw_answer) < 3:
                return FALLBACK_UNGROUNDED_MSG

            return raw_answer

        except requests.exceptions.Timeout:
            print("⚠️ [NvidiaLlamaService] Timeout connecting to NVIDIA API (30s limit).")
            return MODEL_CONTACT_ERROR_MSG
        except requests.exceptions.RequestException as req_err:
            print(f"❌ [NvidiaLlamaService] Network Request Error: {req_err}")
            return MODEL_CONTACT_ERROR_MSG
        except Exception as err:
            print(f"❌ [NvidiaLlamaService] Unexpected Error: {err}")
            return MODEL_CONTACT_ERROR_MSG


# Export global service singleton
nvidia_llama = NvidiaLlamaService()
