from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.resume_parser import parse_resume_bytes, ResumeParsingError
from app.services.nlp_service import NLPService
from app.models.candidate import Candidate, Resume, Skill, CandidateSkill

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])
nlp_service = NLPService()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a resume file (PDF, DOCX, TXT), extract text via NLP pipeline,
    and persist Candidate + Resume + Skills into database.
    """
    try:
        file_bytes = await file.read()
        extracted_text, file_type = parse_resume_bytes(file.filename, file_bytes)

        # Process through spaCy NLP Pipeline
        nlp_profile = nlp_service.process_text(extracted_text)

        # Create or find Candidate
        candidate_name = nlp_profile["name"]
        candidate_email = nlp_profile["email"]
        candidate_phone = nlp_profile["phone"]

        candidate = None
        if candidate_email:
            candidate = db.query(Candidate).filter(Candidate.email == candidate_email).first()

        if not candidate:
            candidate = Candidate(
                name=candidate_name,
                email=candidate_email,
                phone=candidate_phone,
                location=None
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

        # Create Resume record
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

            existing_link = db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == candidate.id,
                CandidateSkill.skill_id == skill_obj.id
            ).first()

            if not existing_link:
                link = CandidateSkill(candidate_id=candidate.id, skill_id=skill_obj.id)
                db.add(link)

        db.commit()
        db.refresh(resume_record)

        return {
            "message": "Resume uploaded and parsed successfully",
            "candidate_id": candidate.id,
            "resume_id": resume_record.id,
            "filename": file.filename,
            "parsed_profile": nlp_profile
        }

    except ResumeParsingError as rpe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(rpe))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process resume: {str(e)}")
