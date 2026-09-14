import os
import re
from typing import List, Set, Dict

# Comprehensive Technical Skill Taxonomy
DEFAULT_SKILL_TAXONOMY = {
    "Languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang", "ruby", "php", "swift",
        "kotlin", "rust", "scala", "r", "html", "css", "sql", "bash", "shell"
    ],
    "Frameworks & Libraries": [
        "react", "react.js", "reactjs", "angular", "vue", "vue.js", "next.js", "express", "node.js", "nodejs",
        "fastapi", "django", "flask", "spring", "spring boot", "asp.net", "rails", "laravel", "tailwind",
        "bootstrap", "jquery", "redux", "graphql", "rest api", "restful api", "spacy", "nltk", "scikit-learn",
        "pandas", "numpy", "tensorflow", "pytorch", "keras", "opencv"
    ],
    "Databases & Storage": [
        "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "dynamodb", "oracle", "sql server",
        "mssql", "elasticsearch", "cassandra", "firebase", "supabase", "neo4j"
    ],
    "Cloud & DevOps": [
        "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
        "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "linux", "unix", "nginx", "apache"
    ],
    "Data Science & AI": [
        "machine learning", "deep learning", "nlp", "natural language processing", "computer vision",
        "generative ai", "genai", "llm", "large language models", "data science", "data engineering",
        "data analysis", "neural networks", "bert", "gpt", "rag"
    ],
    "Tools & Concepts": [
        "git", "github", "gitlab", "jira", "confluence", "agile", "scrum", "ci/cd", "microservices",
        "system design", "oop", "object oriented programming", "unit testing", "pytest", "postman"
    ]
}

# Standardized Canonical Name Mapping
CANONICAL_SKILL_MAP = {
    "python": "Python", "java": "Java", "javascript": "JavaScript", "js": "JavaScript",
    "typescript": "TypeScript", "ts": "TypeScript", "c++": "C++", "c#": "C#",
    "go": "Go", "golang": "Go", "react": "React", "react.js": "React", "reactjs": "React",
    "node.js": "Node.js", "nodejs": "Node.js", "fastapi": "FastAPI", "django": "Django",
    "flask": "Flask", "sql": "SQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mongodb": "MongoDB", "aws": "AWS", "amazon web services": "AWS", "azure": "Azure",
    "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes", "git": "Git",
    "linux": "Linux", "machine learning": "Machine Learning", "nlp": "NLP",
    "rest api": "REST API", "restful api": "REST API", "deep learning": "Deep Learning",
    "data science": "Data Science", "tensorflow": "TensorFlow", "pytorch": "PyTorch",
    "pandas": "Pandas", "numpy": "NumPy", "spacy": "spaCy", "html": "HTML", "css": "CSS",
    "tailwind": "Tailwind CSS", "bootstrap": "Bootstrap", "redis": "Redis", "sqlite": "SQLite",
    "gcp": "GCP", "google cloud": "GCP", "ci/cd": "CI/CD", "agile": "Agile", "microservices": "Microservices"
}

def load_skills_list(skills_filepath: str = None) -> List[str]:
    """Load flat list of skill terms from file or default taxonomy."""
    skills = set()
    for category, skill_terms in DEFAULT_SKILL_TAXONOMY.items():
        for s in skill_terms:
            skills.add(s.lower())

    if skills_filepath and os.path.exists(skills_filepath):
        try:
            with open(skills_filepath, "r", encoding="utf-8") as f:
                for line in f:
                    term = line.strip().lower()
                    if term:
                        skills.add(term)
        except Exception as e:
            print(f"[SkillExtractor] Failed to read {skills_filepath}: {e}")

    return sorted(list(skills))

class SkillExtractor:
    def __init__(self, skills_filepath: str = None):
        self.skills_set = set(load_skills_list(skills_filepath))
        # Compile regex patterns for multi-word and single-word skills
        self.sorted_skills = sorted(list(self.skills_set), key=len, reverse=True)

    def extract_skills(self, text: str, doc=None) -> List[str]:
        """
        Extract unique skills from text using spaCy doc or regex phrase matching.
        Returns canonical capitalized skill names.
        """
        if not text:
            return []

        text_lower = text.lower()
        found_skills = set()

        # Step 1: Match against canonical map & sorted skill list
        for skill in self.sorted_skills:
            # Word boundary check
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                canonical = CANONICAL_SKILL_MAP.get(skill, skill.title())
                found_skills.add(canonical)

        # Step 2: Use spaCy tokens if doc is provided
        if doc:
            for token in doc:
                t_lower = token.text.lower()
                if t_lower in self.skills_set:
                    canonical = CANONICAL_SKILL_MAP.get(t_lower, t_lower.title())
                    found_skills.add(canonical)

        return sorted(list(found_skills))
