import re
import spacy
from typing import Dict, Any, List, Optional
from app.services.skill_extractor import SkillExtractor

_nlp_model = None

def get_nlp_model():
    """Lazy initialization of spaCy NLP model to avoid cold-start import delays."""
    global _nlp_model
    if _nlp_model is None:
        try:
            _nlp_model = spacy.load("en_core_web_sm")
        except Exception:
            try:
                import en_core_web_sm
                _nlp_model = en_core_web_sm.load()
            except Exception:
                _nlp_model = spacy.blank("en")
    return _nlp_model

# Degree patterns
DEGREE_PATTERNS = [
    r"\b(B\.?E\.?|B\.?Tech\.?|Bachelor of Technology|Bachelor of Engineering|Bachelor of Science|B\.?S\.?|B\.?Sc\.?|B\.?C\.?A\.?)\b",
    r"\b(M\.?E\.?|M\.?Tech\.?|Master of Technology|Master of Engineering|Master of Science|M\.?S\.?|M\.?Sc\.?|M\.?C\.?A\.?|M\.?B\.?A\.?)\b",
    r"\b(Ph\.?D|Doctor of Philosophy|Diploma|Associate Degree)\b",
    r"\b(Bachelor|Master|Doctorate|Bachelors|Masters)\b"
]

class NLPService:
    def __init__(self, skills_filepath: str = None):
        self.skill_extractor = SkillExtractor(skills_filepath)

    def extract_email(self, text: str) -> Optional[str]:
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None

    def extract_phone(self, text: str) -> Optional[str]:
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
        match = re.search(phone_pattern, text)
        if match:
            phone = match.group(0).strip()
            if len(re.sub(r'\D', '', phone)) >= 10:
                return phone
        return None

    def extract_name(self, text: str, doc=None) -> str:
        """Extract candidate name using spaCy NER or first line heuristics."""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if not lines:
            return "Unknown Candidate"

        if doc:
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) in [2, 3]:
                    if not any(w in ent.text.lower() for w in ["resume", "curriculum", "page", "profile", "contact"]):
                        return ent.text.strip()

        first_line = lines[0]
        if len(first_line.split()) <= 4 and not re.search(r'[@\d:]', first_line):
            return first_line.title()

        return "Candidate Profile"

    def extract_education(self, text: str, doc=None) -> List[Dict[str, Any]]:
        education_list = []
        lines = text.split('\n')

        for i, line in enumerate(lines):
            line_str = line.strip()
            for pattern in DEGREE_PATTERNS:
                match = re.search(pattern, line_str, re.IGNORECASE)
                if match:
                    degree_name = match.group(0)
                    year_match = re.search(r'\b(19|20)\d{2}\b', line_str)
                    year = int(year_match.group(0)) if year_match else None

                    univ = None
                    if "university" in line_str.lower() or "institute" in line_str.lower() or "college" in line_str.lower():
                        univ = line_str
                    elif i > 0 and ("university" in lines[i-1].lower() or "college" in lines[i-1].lower()):
                        univ = lines[i-1].strip()

                    education_list.append({
                        "degree": degree_name,
                        "institution": univ or "Recognized Institution",
                        "year": year,
                        "full_text": line_str
                    })
                    break

        if not education_list:
            for pattern in DEGREE_PATTERNS:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for m in matches:
                    education_list.append({
                        "degree": m.group(0),
                        "institution": "Higher Education Institution",
                        "year": None,
                        "full_text": m.group(0)
                    })
                    break

        return education_list

    def extract_experience_years(self, text: str) -> float:
        """Extract estimated total years of experience from resume text."""
        exp_patterns = [
            r'(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)',
            r'(?:experience|exp)\s*:\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)'
        ]
        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    pass

        years = [int(y) for y in re.findall(r'\b(19\d{2}|20\d{2})\b', text)]
        if len(years) >= 2:
            min_yr, max_yr = min(years), max(years)
            if max_yr - min_yr <= 35:
                return float(max_yr - min_yr)

        return 1.0

    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Run full spaCy NLP pipeline over input text.
        Returns normalized JSON profile dictionary.
        """
        nlp_instance = get_nlp_model()
        doc = nlp_instance(text)

        entities = []
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_
            })

        skills = self.skill_extractor.extract_skills(text, doc)
        name = self.extract_name(text, doc)
        email = self.extract_email(text)
        phone = self.extract_phone(text)
        education = self.extract_education(text, doc)
        experience_years = self.extract_experience_years(text)

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "education": education,
            "experience_years": experience_years,
            "entities": entities,
            "raw_text": text
        }
