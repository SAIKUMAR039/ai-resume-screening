from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
from google import genai

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if frontend URL changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Set up Gemini API
client = genai.Client(api_key="AIzaSyC3ihKC_ws8fjzqh5lJUXLHdW7pHEFzZhM")

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        # ✅ Debugging: Print received file and job description
        print(f"Received file: {file.filename}")
        print(f"Job Description: {job_description}")

        # ✅ Read and extract text from PDF
        resume_text = ""
        with pdfplumber.open(io.BytesIO(await file.read())) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"

        # ✅ Debugging: Print extracted text
        print(f"Extracted Resume Text:\n{resume_text}")

        # ✅ Check if text extraction failed
        if not resume_text.strip():
            return {"error": "Unable to extract readable text from the PDF. Try using a text-based PDF instead of a scanned image."}

        # ✅ Send Resume & Job Description to AI Model
        prompt = f"Analyze this resume:\n\n{resume_text} \n\nAnd match it to this job description:\n\n{job_description}"
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )

        # ✅ Debugging: Print AI response
        print(f"AI Response:\n{response.text}")

        return {"ai_analysis": response.text}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}
