import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from app.database import get_db
from app.models.candidate import Candidate, Resume, ScreeningResult, Skill, CandidateSkill, JobDescription
from app.schemas.candidate import CandidateCreate, CandidateResponse, RankedCandidateResponse

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

@router.post("", response_model=CandidateResponse)
def create_candidate(candidate_data: CandidateCreate, db: Session = Depends(get_db)):
    """Manually create candidate profile."""
    candidate = Candidate(
        name=candidate_data.name,
        email=candidate_data.email,
        phone=candidate_data.phone,
        location=candidate_data.location
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

@router.get("", response_model=List[CandidateResponse])
def get_all_candidates(db: Session = Depends(get_db)):
    """Retrieve all candidates with skills and resume info."""
    candidates = db.query(Candidate).order_by(Candidate.id.desc()).all()
    result = []
    for c in candidates:
        skills_list = [cs.skill.name for cs in c.skills if cs.skill]
        c_dict = {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "location": c.location,
            "created_at": c.created_at,
            "skills": skills_list,
            "resumes": c.resumes
        }
        result.append(c_dict)
    return result

@router.get("/ranked", response_model=List[RankedCandidateResponse])
def get_ranked_candidates(
    job_id: Optional[int] = Query(None, description="Optional job description ID to rank candidates for"),
    db: Session = Depends(get_db)
):
    """
    Execute SQL query to generate ranked candidate report ordered by overall screening score.
    """
    if job_id:
        sql = text("""
            SELECT 
                c.id AS candidate_id,
                c.name AS candidate_name,
                c.email AS email,
                sr.overall_score,
                sr.skills_match,
                sr.experience_match,
                sr.education_match,
                sr.matched_skills,
                sr.missing_skills,
                sr.recommendation,
                sr.ai_explanation,
                sr.created_at
            FROM candidates c
            JOIN screening_results sr ON c.id = sr.candidate_id
            WHERE sr.job_id = :job_id
            ORDER BY sr.overall_score DESC, sr.created_at DESC
        """)
        rows = db.execute(sql, {"job_id": job_id}).mappings().all()
    else:
        sql = text("""
            SELECT 
                c.id AS candidate_id,
                c.name AS candidate_name,
                c.email AS email,
                sr.overall_score,
                sr.skills_match,
                sr.experience_match,
                sr.education_match,
                sr.matched_skills,
                sr.missing_skills,
                sr.recommendation,
                sr.ai_explanation,
                sr.created_at
            FROM candidates c
            JOIN screening_results sr ON c.id = sr.candidate_id
            ORDER BY sr.overall_score DESC, sr.created_at DESC
        """)
        all_rows = db.execute(sql).mappings().all()
        # Deduplicate candidates keeping highest overall_score
        seen = set()
        rows = []
        for r in all_rows:
            if r["candidate_id"] not in seen:
                seen.add(r["candidate_id"])
                rows.append(r)

    ranked_list = []
    for rank_idx, row in enumerate(rows, start=1):
        matched_sk = row["matched_skills"]
        if isinstance(matched_sk, str):
            try:
                matched_sk = json.loads(matched_sk)
            except Exception:
                matched_sk = []

        missing_sk = row["missing_skills"]
        if isinstance(missing_sk, str):
            try:
                missing_sk = json.loads(missing_sk)
            except Exception:
                missing_sk = []

        ranked_list.append({
            "rank": rank_idx,
            "candidate_id": row["candidate_id"],
            "candidate_name": row["candidate_name"],
            "email": row["email"],
            "score": row["overall_score"],
            "skills_match": row["skills_match"],
            "experience_match": row["experience_match"],
            "education_match": row["education_match"],
            "matched_skills": matched_sk or [],
            "missing_skills": missing_sk or [],
            "recommendation": row["recommendation"],
            "ai_explanation": row["ai_explanation"],
            "created_at": row["created_at"]
        })

    return ranked_list

@router.get("/filter")
def filter_candidates(
    skill: Optional[str] = Query(None, description="Skill term to filter by (e.g. Python)"),
    min_score: Optional[float] = Query(None, description="Minimum screening score threshold"),
    job_id: Optional[int] = Query(None, description="Job ID filter"),
    db: Session = Depends(get_db)
):
    """
    Execute SQL query for candidate filtering by skill, min_score, and job_id.
    """
    conditions = ["1=1"]
    params = {}

    if skill:
        conditions.append("""
            c.id IN (
                SELECT cs.candidate_id 
                FROM candidate_skills cs 
                JOIN skills s ON cs.skill_id = s.id 
                WHERE LOWER(s.name) = LOWER(:skill)
            )
        """)
        params["skill"] = skill

    if min_score is not None:
        conditions.append("sr.overall_score >= :min_score")
        params["min_score"] = min_score

    if job_id:
        conditions.append("sr.job_id = :job_id")
        params["job_id"] = job_id

    where_clause = " AND ".join(conditions)

    sql = text(f"""
        SELECT 
            c.id AS candidate_id,
            c.name AS candidate_name,
            c.email AS email,
            sr.overall_score,
            sr.skills_match,
            sr.recommendation,
            sr.matched_skills,
            sr.created_at
        FROM candidates c
        LEFT JOIN screening_results sr ON c.id = sr.candidate_id
        WHERE {where_clause}
        ORDER BY sr.overall_score DESC NULLS LAST
    """)

    rows = db.execute(sql, params).mappings().all()

    results = []
    for r in rows:
        msk = r["matched_skills"]
        if isinstance(msk, str):
            try:
                msk = json.loads(msk)
            except Exception:
                msk = []
        results.append({
            "candidate_id": r["candidate_id"],
            "candidate_name": r["candidate_name"],
            "email": r["email"],
            "score": r["overall_score"],
            "skills_match": r["skills_match"],
            "recommendation": r["recommendation"] or "Not Screened",
            "matched_skills": msk or []
        })

    return {"count": len(results), "candidates": results}

@router.get("/{candidate_id}")
def get_candidate_by_id(candidate_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed candidate profile by candidate_id."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found.")

    resumes = db.query(Resume).filter(Resume.candidate_id == candidate.id).all()
    skills = [cs.skill.name for cs in candidate.skills if cs.skill]
    screenings = db.query(ScreeningResult).filter(ScreeningResult.candidate_id == candidate.id).order_by(ScreeningResult.id.desc()).all()

    return {
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "location": candidate.location,
            "created_at": candidate.created_at,
            "skills": skills
        },
        "resumes": resumes,
        "screening_history": screenings
    }

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Delete candidate and cascading records."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found.")

    db.delete(candidate)
    db.commit()
    return {"message": f"Candidate ID {candidate_id} deleted successfully."}
