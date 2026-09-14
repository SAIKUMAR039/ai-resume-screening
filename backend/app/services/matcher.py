import re
from typing import Dict, Any, List, Set

DEFAULT_WEIGHTS = {
    "skills": 0.60,
    "experience": 0.20,
    "education": 0.10,
    "keywords": 0.10
}

class ResumeMatcher:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def calculate_skill_match(self, candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        """
        Calculate skill match percentage, matched skills list, and missing skills list.
        """
        if not required_skills:
            return {
                "score": 100.0,
                "matched": candidate_skills,
                "missing": []
            }

        cand_set = {s.lower() for s in candidate_skills}
        req_set = {s.lower() for s in required_skills}

        matched_lower = cand_set.intersection(req_set)
        missing_lower = req_set - cand_set

        # Map back to original case where possible
        matched = [s for s in candidate_skills if s.lower() in matched_lower]
        # For required skills not found, keep required name
        missing = [s for s in required_skills if s.lower() in missing_lower]

        score = (len(matched_lower) / len(req_set)) * 100.0 if req_set else 100.0
        return {
            "score": round(min(score, 100.0), 2),
            "matched": matched,
            "missing": missing
        }

    def calculate_experience_match(self, cand_years: float, req_years: float = 0.0) -> float:
        """
        Calculate experience match percentage based on required vs candidate experience.
        """
        if req_years <= 0:
            return 100.0

        if cand_years >= req_years:
            return 100.0

        ratio = (cand_years / req_years) * 100.0
        return round(max(ratio, 20.0), 2)

    def calculate_education_match(self, candidate_education: List[Dict[str, Any]], required_degree: str = None) -> float:
        """
        Calculate education match score.
        """
        if not required_degree:
            # Baseline score if no specific degree required but education present
            return 100.0 if candidate_education else 70.0

        if not candidate_education:
            return 50.0

        req_deg_lower = required_degree.lower()
        for edu in candidate_education:
            deg = str(edu.get("degree", "")).lower()
            if req_deg_lower in deg or any(w in deg for w in ["bachelor", "master", "phd", "b.tech", "m.tech", "degree"]):
                return 100.0

        return 60.0

    def calculate_keyword_match(self, resume_text: str, jd_text: str) -> float:
        """
        Calculate Jaccard overlap of non-stopword tokens between resume and job description.
        """
        stopwords = {"and", "the", "to", "of", "a", "in", "for", "is", "on", "that", "by", "this", "with", "i", "you", "it", "not", "or", "be", "are", "from", "at", "as", "your", "all", "have", "new", "more", "an", "was", "we", "will", "home", "can", "us", "about", "if", "page", "my", "has", "search", "free", "but", "our", "one", "other", "do", "no", "information", "time", "they", "site", "he", "up", "may", "what", "which", "their", "news", "out", "use", "any", "there", "see", "only", "so", "his", "when", "contact", "here", "business", "who", "web", "also", "now", "help", "get", "pm", "view", "online", "c", "e", "first", "am", "been", "would", "how", "were", "me", "s", "services", "some", "these", "click", "its", "like", "service", "x", "than", "find", "price", "date", "back", "top", "people", "had", "list", "name", "just", "over", "state", "year", "day", "into", "email", "two", "health", "n", "world", "re", "next", "used", "go", "work", "last", "most", "products", "music", "buy", "data", "make", "them", "should", "product", "system", "post", "her", "city", "t", "add", "policy", "number", "such", "please", "available", "copyright", "support", "message", "after", "best", "software", "then", "jan", "good", "well", "where", "info", "rights", "public", "books", "high", "school", "through", "m", "each", "links", "she", "very", "war", "your", "under"}

        words_resume = set(re.findall(r'\b[a-zA-Z]{3,}\b', resume_text.lower())) - stopwords
        words_jd = set(re.findall(r'\b[a-zA-Z]{3,}\b', jd_text.lower())) - stopwords

        if not words_jd:
            return 100.0

        intersection = words_resume.intersection(words_jd)
        score = (len(intersection) / len(words_jd)) * 100.0
        return round(min(score, 100.0), 2)

    def match_resume_to_jd(
        self,
        candidate_profile: Dict[str, Any],
        jd_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute weighted 4-factor scoring matching algorithm.
        Returns complete score breakdown.
        """
        cand_skills = candidate_profile.get("skills", [])
        req_skills = jd_profile.get("skills", [])

        # 1. Skill Match (60%)
        skill_res = self.calculate_skill_match(cand_skills, req_skills)
        skill_score = skill_res["score"]

        # 2. Experience Match (20%)
        cand_exp = candidate_profile.get("experience_years", 1.0)
        req_exp = jd_profile.get("experience_years", 0.0)
        exp_score = self.calculate_experience_match(cand_exp, req_exp)

        # 3. Education Match (10%)
        cand_edu = candidate_profile.get("education", [])
        req_edu = jd_profile.get("education_requirement", None)
        edu_score = self.calculate_education_match(cand_edu, req_edu)

        # 4. Keyword Match (10%)
        raw_resume = candidate_profile.get("raw_text", "")
        raw_jd = jd_profile.get("raw_text", "")
        kw_score = self.calculate_keyword_match(raw_resume, raw_jd)

        # Calculate weighted final score
        final_score = (
            (skill_score * self.weights["skills"]) +
            (exp_score * self.weights["experience"]) +
            (edu_score * self.weights["education"]) +
            (kw_score * self.weights["keywords"])
        )
        final_score = round(min(max(final_score, 0.0), 100.0), 2)

        return {
            "overall_score": final_score,
            "skills_match": skill_score,
            "experience_match": exp_score,
            "education_match": edu_score,
            "keyword_match": kw_score,
            "matched_skills": skill_res["matched"],
            "missing_skills": skill_res["missing"]
        }
