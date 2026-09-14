from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.services.resume_parser import parse_resume_bytes, ResumeParsingError
from app.services.nlp_service import NLPService
from app.services.matcher import ResumeMatcher
from app.services.ranking import get_recommendation
from app.services.gemini_service import GeminiService
from app.models.candidate import Candidate, Resume, JobDescription, ScreeningResult, Skill, CandidateSkill

router = APIRouter(prefix="/api", tags=["Screening"])

nlp_service = NLPService()
matcher = ResumeMatcher()
gemini_service = GeminiService()

@router.post("/screen")
async def screen_candidate(
    job_description: str = Form(...),
    candidate_id: Optional[int] = Form(None),
    job_title: Optional[str] = Form("Software Developer"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Screen a candidate against a job description.
    Accepts either an existing candidate_id OR a newly uploaded resume file.
    Executes spaCy NLP parsing, deterministic matching, ranking classification,
    and optional Gemini AI rationale generation.
    """
    if not job_description or not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    candidate = None
    resume_record = None

    if file:
        file_bytes = await file.read()
        extracted_text, file_type = parse_resume_bytes(file.filename, file_bytes)
        nlp_profile = nlp_service.process_text(extracted_text)

        candidate = Candidate(
            name=nlp_profile["name"],
            email=nlp_profile["email"],
            phone=nlp_profile["phone"]
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        resume_record = Resume(
            candidate_id=candidate.id,
            filename=file.filename,
            file_type=file_type,
            raw_text=extracted_text,
            parsed_skills=nlp_profile["skills"],
            parsed_education=nlp_profile["education"],
            parsed_experience=[{"years": nlp_profile["experience_years"]}]
        )
        db.add(resume_record)

        # Relate Skills
        for skill_name in nlp_profile["skills"]:
            skill_obj = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill_obj:
                skill_obj = Skill(name=skill_name, category="Technical")
                db.add(skill_obj)
                db.commit()
                db.refresh(skill_obj)
            link = CandidateSkill(candidate_id=candidate.id, skill_id=skill_obj.id)
            db.add(link)

        db.commit()

    elif candidate_id:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found.")
        resume_record = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.id.desc()).first()
        if not resume_record:
            raise HTTPException(status_code=404, detail=f"No resume record found for candidate ID {candidate_id}.")
        nlp_profile = {
            "name": candidate.name,
            "email": candidate.email,
            "skills": resume_record.parsed_skills or [],
            "education": resume_record.parsed_education or [],
            "experience_years": resume_record.parsed_experience[0]["years"] if resume_record.parsed_experience else 1.0,
            "raw_text": resume_record.raw_text
        }
    else:
        raise HTTPException(status_code=400, detail="Provide either a candidate_id or a resume file to screen.")

    # Process Job Description via spaCy NLP
    jd_nlp_profile = nlp_service.process_text(job_description)

    # Save Job Description in database
    jd_record = JobDescription(
        title=job_title or "Software Developer",
        description_text=job_description,
        required_skills=jd_nlp_profile["skills"],
        education_req=None,
        experience_req=jd_nlp_profile["experience_years"]
    )
    db.add(jd_record)
    db.commit()
    db.refresh(jd_record)

    # Run Programmatic Match Algorithm
    match_result = matcher.match_resume_to_jd(nlp_profile, jd_nlp_profile)

    overall_score = match_result["overall_score"]
    recommendation = get_recommendation(overall_score)

    # Generate optional Gemini AI rationale (safely falls back if key missing)
    ai_explanation = gemini_service.generate_explanation(
        candidate_name=candidate.name,
        overall_score=overall_score,
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        recommendation=recommendation,
        job_description=job_description
    )

    # Save ScreeningResult in database
    screening_record = ScreeningResult(
        candidate_id=candidate.id,
        job_id=jd_record.id,
        overall_score=overall_score,
        skills_match=match_result["skills_match"],
        experience_match=match_result["experience_match"],
        education_match=match_result["education_match"],
        keyword_match=match_result["keyword_match"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        recommendation=recommendation,
        ai_explanation=ai_explanation
    )
    db.add(screening_record)
    db.commit()
    db.refresh(screening_record)

    return {
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "job_id": jd_record.id,
        "score": overall_score,
        "skills_match": match_result["skills_match"],
        "experience_match": match_result["experience_match"],
        "education_match": match_result["education_match"],
        "keyword_match": match_result["keyword_match"],
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "recommendation": recommendation,
        "ai_explanation": ai_explanation
    }
