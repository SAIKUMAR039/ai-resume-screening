import pytest
from app.services.nlp_service import NLPService
from app.services.skill_extractor import SkillExtractor

def test_skill_extraction():
    extractor = SkillExtractor()
    sample_text = "Experienced developer proficient in Python, FastAPI, React, Docker, and PostgreSQL."
    skills = extractor.extract_skills(sample_text)

    assert "Python" in skills
    assert "FastAPI" in skills
    assert "React" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills

def test_nlp_service_profile_extraction():
    nlp_service = NLPService()
    sample_resume = """
    Sai Kumar
    Email: saikumar@example.com
    Phone: +1-555-019-2831
    Bachelor of Technology in Computer Science (2024)
    5 years of experience in Python, AWS, and Machine Learning.
    """
    profile = nlp_service.process_text(sample_resume)

    assert profile["email"] == "saikumar@example.com"
    assert "Python" in profile["skills"]
    assert "AWS" in profile["skills"]
    assert profile["experience_years"] >= 4.0
