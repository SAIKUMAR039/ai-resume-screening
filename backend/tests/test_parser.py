import pytest
from app.services.resume_parser import parse_resume_bytes, ResumeParsingError, extract_text_from_txt

def test_extract_txt_success():
    content = b"John Doe\nSoftware Engineer\nSkills: Python, FastAPI, PostgreSQL"
    text, file_type = parse_resume_bytes("resume.txt", content)
    assert file_type == "TXT"
    assert "John Doe" in text
    assert "FastAPI" in text

def test_empty_file_error():
    with pytest.raises(ResumeParsingError):
        parse_resume_bytes("empty.pdf", b"")

def test_unsupported_format_error():
    with pytest.raises(ResumeParsingError):
        parse_resume_bytes("test.exe", b"binary content")
