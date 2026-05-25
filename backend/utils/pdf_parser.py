from pypdf import PdfReader
from docx import Document
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from PDF file bytes using pypdf.
    
    Args:
        file_bytes: Raw bytes of the PDF file
        
    Returns:
        Extracted text from all pages
    """
    try:
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        page_texts = []
        for page in pdf_reader.pages:
            extracted = page.extract_text() or ""
            extracted = extracted.replace("\r", "\n")
            page_texts.append(extracted)

        # Preserve page and line boundaries to improve ATS section detection.
        text = "\n\n".join(page_texts)
        text = "\n".join(line.strip() for line in text.split("\n"))
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extract text from DOCX file bytes using python-docx.
    
    Args:
        file_bytes: Raw bytes of the DOCX file
        
    Returns:
        Extracted text from all paragraphs
    """
    try:
        doc = Document(io.BytesIO(file_bytes))
        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        return "\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
