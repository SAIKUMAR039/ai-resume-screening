# AI Resume Screening System 🚀

An intelligent, full-stack **AI Resume Screening & Ranking System** built with **Python**, **FastAPI**, **spaCy NLP**, **PostgreSQL**, and **React.js**. 

The system automates candidate resume parsing, extracts structured technical profiles (Skills, Education, Experience, Contact Info), matches candidate skills programmatically against Job Descriptions using a 4-factor scoring algorithm, ranks candidates, and stores structured candidate analytics in PostgreSQL.

---

## 🌟 Architecture Overview

```
React.js Frontend (Vite + Tailwind + Framer Motion)
       │
       ▼  REST API (HTTP / JSON / Uploads)
FastAPI REST Layer (App & Routers)
       │
       ├─► Resume Parsing Service (PDF via PyMuPDF/pdfplumber, DOCX, TXT)
       │
       ├─► spaCy NLP Pipeline (Tokenization, PhraseMatcher, Entity Recognition)
       │
       ├─► Skill & Metadata Extraction (Canonical taxonomy & Phrase Matching)
       │
       ├─► Job Description Matching Engine (4-Factor Weighted Algorithm)
       │
       ├─► Candidate Scoring & Ranking Engine (Threshold Classification)
       │
       ├─► Database Layer (PostgreSQL via SQLAlchemy ORM & Raw SQL Queries)
       │
       └─► Gemini AI Service (Optional enhancement for match rationale generation)
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **NLP & Parsing**: spaCy (`en_core_web_sm`), PyMuPDF (fitz), pdfplumber, python-docx
- **Database**: PostgreSQL (via SQLAlchemy ORM + Raw SQL for analytics; SQLite fallback for offline dev)
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Optional AI Enhancement**: Google Gemini API (`gemini-2.0-flash`) for human-readable summaries

---

## 📊 Database Schema

Designed for relational data storage, data diagnostics, and ranked analytical reporting:

- `candidates`: Primary key `id`, `name`, `email`, `phone`, `location`, `created_at`.
- `resumes`: Primary key `id`, `candidate_id` (FK), `filename`, `file_type`, `raw_text`, `parsed_skills` (JSON), `parsed_education` (JSON), `parsed_experience` (JSON).
- `job_descriptions`: Primary key `id`, `title`, `description_text`, `required_skills` (JSON), `education_req`, `experience_req`.
- `skills`: Primary key `id`, `name` (Unique), `category`.
- `candidate_skills`: Junction table relating `candidate_id` and `skill_id`.
- `screening_results`: Primary key `id`, `candidate_id` (FK), `job_id` (FK), `overall_score`, `skills_match`, `experience_match`, `education_match`, `keyword_match`, `matched_skills` (JSON), `missing_skills` (JSON), `recommendation`, `ai_explanation`.

---

## 🧮 Programmatic Ranking Algorithm

Candidate suitability is evaluated deterministically without relying on generative LLM prompts for scoring:

$$\text{Final Score} = 0.60 \times S_{\text{Skills}} + 0.20 \times S_{\text{Exp}} + 0.10 \times S_{\text{Edu}} + 0.10 \times S_{\text{Kw}}$$

1. **Skill Match Score ($S_{\text{Skills}}$)** — $60\%$:
   $$\left( \frac{|\text{Matched Candidate Skills} \cap \text{Required JD Skills}|}{|\text{Required JD Skills}|} \right) \times 100$$
2. **Experience Match Score ($S_{\text{Exp}}$)** — $20\%$:
   Ratio of candidate's verified experience years vs. required years.
3. **Education Match Score ($S_{\text{Edu}}$)** — $10\%$:
   Degree and field of study alignment.
4. **Keyword Overlap Score ($S_{\text{Kw}}$)** — $10\%$:
   Jaccard similarity of key domain tokens.

### Candidate Recommendation Classifications
- **$\ge 90.0\%$**: `Strong Candidate` 🌟
- **$75.0\% - 89.9\%$**: `Good Candidate` ✅
- **$60.0\% - 74.9\%$**: `Potential Candidate` ⚡
- **$< 60.0\%$**: `Low Match` ⚠️

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (or Supabase URL; SQLite is automatically used if no DB URL is set)

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Configure environment variables (optional)
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🧪 Running Tests

Execute the automated backend test suite using `pytest`:

```bash
cd backend
..\backend\venv\Scripts\pytest
```

---

## 🔌 Major API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resumes/upload` | Upload resume file, run spaCy NLP profile extraction, and persist in DB |
| `POST` | `/api/screen` | Screen resume against Job Description with 4-factor scoring & ranking |
| `GET` | `/api/candidates` | List all candidates with skills & resume profiles |
| `GET` | `/api/candidates/ranked` | Ranked candidate report ordered by overall match score |
| `GET` | `/api/candidates/filter` | SQL query filtering by `skill`, `min_score`, and `job_id` |
| `GET` | `/api/candidates/{candidate_id}` | Retrieve detailed candidate profile, breakdown, & screening history |
| `DELETE` | `/api/candidates/{candidate_id}` | Delete candidate and cascading records |

---

## 🔮 Future Improvements

- **Vector Embeddings**: Sentence-BERT / OpenAI embeddings for semantic skill similarity.
- **Skill Ontology Graph**: Knowledge graph mapping related skills (e.g. PyTorch $\rightarrow$ Deep Learning $\rightarrow$ Python).
- **ML Ranking Models**: Learning-to-rank models trained on historical hiring feedback.
- **Recruiter Collaboration**: Multi-user authentication, notes, and interview pipeline stages.

---

## 📄 License
MIT License. Developed by **Sai Kumar**.
