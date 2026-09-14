import os
from typing import Optional, Dict, Any

try:
    import google.generativeai as genai
    HAS_GENAI = True
except Exception:
    HAS_GENAI = False

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.enabled = False

        if self.api_key and HAS_GENAI:
            try:
                genai.configure(api_key=self.api_key)
                self.enabled = True
            except Exception as e:
                print(f"[GeminiService Warning] Failed to configure Gemini API: {e}")

    def generate_explanation(
        self,
        candidate_name: str,
        overall_score: float,
        matched_skills: list,
        missing_skills: list,
        recommendation: str,
        job_description: str
    ) -> str:
        """
        Generate a human-readable recruiter summary using Gemini if available.
        Falls back gracefully to a deterministic local template if Gemini key is missing/fails.
        """
        fallback_summary = (
            f"Candidate '{candidate_name}' scored {overall_score}% ({recommendation}). "
            f"Matched skills ({len(matched_skills)}): {', '.join(matched_skills[:6]) if matched_skills else 'None'}. "
            f"Missing skills ({len(missing_skills)}): {', '.join(missing_skills[:6]) if missing_skills else 'None'}."
        )

        if not self.enabled:
            return fallback_summary

        try:
            prompt = f"""
            As an expert HR AI consultant, provide a concise 3-sentence recruiter summary for candidate screening results:

            Candidate Name: {candidate_name}
            Overall Match Score: {overall_score}%
            Recommendation: {recommendation}
            Matched Required Skills: {', '.join(matched_skills) if matched_skills else 'None'}
            Missing Key Skills: {', '.join(missing_skills) if missing_skills else 'None'}

            Job Description excerpt:
            {job_description[:500]}

            Provide a clear rationale explaining why the candidate was classified as {recommendation} and what key strengths/gaps stood out.
            """
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
            return fallback_summary
        except Exception as e:
            print(f"[GeminiService] API call failed: {e}. Utilizing fallback explanation.")
            return fallback_summary
