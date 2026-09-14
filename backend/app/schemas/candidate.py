from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    parsed_skills: List[str] = []
    parsed_education: List[Dict[str, Any]] = []
    parsed_experience: List[Dict[str, Any]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    skills: List[str] = []
    resumes: List[ResumeResponse] = []

    model_config = ConfigDict(from_attributes=True)

class JobDescriptionCreate(BaseModel):
    title: Optional[str] = "Software Developer"
    description_text: str

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description_text: str
    required_skills: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScreeningRequest(BaseModel):
    job_description: str
    candidate_id: Optional[int] = None
    job_title: Optional[str] = "Software Developer"

class ScreeningResponse(BaseModel):
    candidate_id: int
    candidate_name: str
    score: float
    skills_match: float
    experience_match: float
    education_match: float
    keyword_match: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommendation: str
    ai_explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RankedCandidateResponse(BaseModel):
    rank: int
    candidate_id: int
    candidate_name: str
    email: Optional[str] = None
    score: float
    skills_match: float
    experience_match: float
    education_match: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommendation: str
    ai_explanation: Optional[str] = None
    created_at: datetime

class CandidateFilterParams(BaseModel):
    skill: Optional[str] = None
    min_score: Optional[float] = None
    job_id: Optional[int] = None
