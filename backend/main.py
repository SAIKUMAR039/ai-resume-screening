from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
import os
import google.generativeai as genai
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# ✅ Configure CORS (Allow both local & deployed frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://airesume-screening.vercel.app",
        "*",
        "https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--eb2a6bdc.local-credentialless.webcontainer-api.io/"  # Deployed frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Configure Google Gemini AI
genai.configure(api_key="AIzaSyC3ihKC_ws8fjzqh5lJUXLHdW7pHEFzZhM")

# ✅ Resume Upload & AI Analysis Endpoint
@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        # 🟢 Debugging: Log received file
        print(f"Received file: {file.filename}")
        print(f"Job Description: {job_description}")

        # ✅ Extract text from PDF
        resume_text = ""
        with pdfplumber.open(io.BytesIO(await file.read())) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"

        # 🟢 Debugging: Log extracted text
        print(f"Extracted Resume Text:\n{resume_text}")

        # ✅ Handle empty or unreadable PDFs
        if not resume_text.strip():
            return {"error": "Unable to extract text from the PDF. Ensure it's not a scanned image."}

        # ✅ Prepare AI model prompt
        prompt = f"""
        Analyze this resume:
        {resume_text}

        And match it to this job description:
        {job_description}
        """

        # ✅ AI Processing (Correct Google Gemini API Call)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)

        # 🟢 Debugging: Log AI response
        ai_analysis = response.text if response and response.text else "AI analysis failed"
        print(f"AI Response:\n{ai_analysis}")

        return {"ai_analysis": ai_analysis}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}

# ✅ Deploy on Render (Port Configuration)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render provides a dynamic port
    uvicorn.run(app, host="0.0.0.0", port=port)
