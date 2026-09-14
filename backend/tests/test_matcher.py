import pytest
from app.services.matcher import ResumeMatcher
from app.services.ranking import rank_candidates, get_recommendation

def test_resume_matching_formula():
    matcher = ResumeMatcher()

    cand_profile = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "React"],
        "experience_years": 4.0,
        "education": [{"degree": "Bachelor of Technology"}],
        "raw_text": "Experienced Python and FastAPI backend engineer with React and PostgreSQL skills."
    }

    jd_profile = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "experience_years": 3.0,
        "education_requirement": "Bachelor",
        "raw_text": "Looking for Python FastAPI developer with PostgreSQL and Docker experience."
    }

    res = matcher.match_resume_to_jd(cand_profile, jd_profile)

    assert "Python" in res["matched_skills"]
    assert "FastAPI" in res["matched_skills"]
    assert "PostgreSQL" in res["matched_skills"]
    assert "Docker" in res["missing_skills"]

    assert res["skills_match"] == 75.0  # 3 matched out of 4 required
    assert res["experience_match"] == 100.0  # 4 >= 3 years
    assert res["overall_score"] > 70.0

def test_ranking_and_recommendation():
    candidates = [
        {"candidate_name": "Alice", "score": 92.0},
        {"candidate_name": "Bob", "score": 78.0},
        {"candidate_name": "Charlie", "score": 64.0},
        {"candidate_name": "Dave", "score": 45.0}
    ]

    ranked = rank_candidates(candidates)

    assert ranked[0]["candidate_name"] == "Alice"
    assert ranked[0]["rank"] == 1
    assert ranked[0]["recommendation"] == "Strong Candidate"

    assert ranked[1]["recommendation"] == "Good Candidate"
    assert ranked[2]["recommendation"] == "Potential Candidate"
    assert ranked[3]["recommendation"] == "Low Match"
