import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    screening_results = relationship("ScreeningResult", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    raw_text = Column(Text, nullable=False)
    parsed_skills = Column(JSON, default=list)
    parsed_education = Column(JSON, default=list)
    parsed_experience = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, default="Software Developer")
    description_text = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    education_req = Column(String(255), nullable=True)
    experience_req = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    screening_results = relationship("ScreeningResult", back_populates="job_description")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True, default="Technical")

    candidates = relationship("CandidateSkill", back_populates="skill")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)

    candidate = relationship("Candidate", back_populates="skills")
    skill = relationship("Skill", back_populates="candidates")


class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    overall_score = Column(Float, nullable=False, index=True)
    skills_match = Column(Float, nullable=False)
    experience_match = Column(Float, nullable=False)
    education_match = Column(Float, nullable=False)
    keyword_match = Column(Float, nullable=False)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    recommendation = Column(String(100), nullable=False)
    ai_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="screening_results")
    job_description = relationship("JobDescription", back_populates="screening_results")
