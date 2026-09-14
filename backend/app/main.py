import os
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db, get_db
from app.routes import resumes, screening, candidates
from app.services.resume_parser import parse_resume_bytes
from app.services.nlp_service import NLPService
from app.services.matcher import ResumeMatcher
from app.services.gemini_service import GeminiService

app = FastAPI(
    title="AI Resume Screening System API",
    description="REST API for parsing resumes with spaCy NLP, programmatic JD matching, PostgreSQL analytics, and optional Gemini rationale.",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(resumes.router)
app.include_router(screening.router)
app.include_router(candidates.router)

nlp_service = NLPService()
matcher = ResumeMatcher()
gemini_service = GeminiService()

@app.on_event("startup")
def on_startup():
    """Initialize database tables on app start."""
    init_db()

@app.get("/")
def root():
    return {
        "message": "AI Resume Screening API is active",
        "docs": "/docs",
        "version": "2.0.0"
    }

# Legacy endpoint for backwards compatibility
@app.post("/upload_resume/")
async def legacy_upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    """
    Backwards-compatible legacy endpoint. Parses file with NLP parser, screens against JD,
    and returns response matching original API contract format.
    """
    try:
        file_bytes = await file.read()
        extracted_text, file_type = parse_resume_bytes(file.filename, file_bytes)

        cand_profile = nlp_service.process_text(extracted_text)
        jd_profile = nlp_service.process_text(job_description)

        match_res = matcher.match_resume_to_jd(cand_profile, jd_profile)
        score = match_res["overall_score"]
        matched = match_res["matched_skills"]
        missing = match_res["missing_skills"]

        explanation = gemini_service.generate_explanation(
            candidate_name=cand_profile["name"],
            overall_score=score,
            matched_skills=matched,
            missing_skills=missing,
            recommendation="Screened",
            job_description=job_description
        )

        formatted_analysis = (
            f"**Candidate Name**: {cand_profile['name']}\n"
            f"**Overall Match Score**: {score}%\n\n"
            f"**Extracted Skills**: {', '.join(cand_profile['skills']) if cand_profile['skills'] else 'None'}\n"
            f"**Matched Skills**: {', '.join(matched) if matched else 'None'}\n"
            f"**Missing Required Skills**: {', '.join(missing) if missing else 'None'}\n\n"
            f"**AI Analysis & Rationale**:\n{explanation}"
        )

        return {"ai_analysis": formatted_analysis}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
