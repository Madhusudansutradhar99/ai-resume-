from pypdf import PdfReader
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table
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
    Extract text from DOCX file bytes using python-docx, preserving document order
    for both paragraphs and tables.
    
    Args:
        file_bytes: Raw bytes of the DOCX file
        
    Returns:
        Extracted text in order
    """
    try:
        doc = Document(io.BytesIO(file_bytes))
        text_parts = []
        for child in doc.element.body.iterchildren():
            if child.tag.endswith('p'):
                para = Paragraph(child, doc)
                if para.text.strip():
                    text_parts.append(para.text)
            elif child.tag.endswith('tbl'):
                table = Table(child, doc)
                for row in table.rows:
                    row_text = []
                    for cell in row.cells:
                        cell_text = " ".join(p.text.strip() for p in cell.paragraphs if p.text.strip())
                        if cell_text:
                            row_text.append(cell_text)
                    if row_text:
                        text_parts.append(" | ".join(row_text))
        return "\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
