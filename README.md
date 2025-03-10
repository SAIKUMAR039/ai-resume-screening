# AI Resume Screening

This project is an AI-powered resume screening tool that analyzes resumes and matches them to job descriptions. It consists of a backend built with FastAPI and a frontend built with React and Vite.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Upload resumes in PDF format
- Extract text from resumes using `pdfplumber`
- Analyze resumes and match them to job descriptions using the Gemini AI model
- Display analysis results on the frontend
- Developer information and featured projects

## Installation

### Backend

1. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install the required dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Create a `.env` file and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

5. Run the FastAPI server:
    ```sh
    uvicorn main:app --reload
    ```

### Frontend

1. Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```

2. Install the required dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Upload a resume in PDF format and enter a job description.
3. Click the "Analyze Resume" button to get the AI analysis results.

## Project Structure
