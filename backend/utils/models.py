from pydantic import BaseModel, Field
from typing import List, Optional


class CompanyMatch(BaseModel):
    sector: str
    companies: List[str]
    fitReason: str


class CareerGuidance(BaseModel):
    targetField: str = ""
    idealRoles: List[str] = Field(default_factory=list)
    preparationAreas: List[str] = Field(default_factory=list)
    companyMatches: List[CompanyMatch] = Field(default_factory=list)
    confidence: int = 0


class ATSContact(BaseModel):
    emails: List[str] = Field(default_factory=list)
    phones: List[str] = Field(default_factory=list)
    contactPresent: bool = False


class ATSReport(BaseModel):
    contact: ATSContact = Field(default_factory=ATSContact)
    sections: List[str] = Field(default_factory=list)
    skillsFound: List[str] = Field(default_factory=list)
    keywordMatchPercent: int = 0
    formatWarnings: List[str] = Field(default_factory=list)
    atsScore: int = 0
    matchedKeywords: List[str] = Field(default_factory=list)
    missingKeywords: List[str] = Field(default_factory=list)
    sectionScore: int = 0
    keywordScore: int = 0
    formattingScore: int = 0
    recommendations: List[str] = Field(default_factory=list)
    jobDescriptionUsed: bool = False
    scanMode: str = "generic_estimate"


class CategoryScores(BaseModel):
    formatStructure: int
    keywordsMatch: int
    experienceQuality: int
    educationCerts: int
    readability: int


class Roadmap(BaseModel):
    phase1: List[str]
    phase2: List[str]
    phase3: List[str]


class ResumePersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedIn: str = ""
    github: str = ""


class WorkExperienceItem(BaseModel):
    company: str = ""
    title: str = ""
    duration: str = ""
    bullets: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""
    cgpa: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    techStack: str = ""
    description: str = ""


class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""


class ParsedResumeStructure(BaseModel):
    personalInfo: ResumePersonalInfo = Field(default_factory=ResumePersonalInfo)
    professionalSummary: str = ""
    workExperience: List[WorkExperienceItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    overallScore: int
    categories: CategoryScores
    roadmap: Roadmap
    strengths: List[str]
    weaknesses: List[str]
    estimatedImprovement: int
    careerGuidance: CareerGuidance = Field(default_factory=CareerGuidance)
    atsReport: ATSReport = Field(default_factory=ATSReport)
    structuredResume: ParsedResumeStructure = Field(default_factory=ParsedResumeStructure)
    summary: str
    parsedText: str



class ImproveSectionRequest(BaseModel):
    section: str
    content: str
    jobTitle: Optional[str] = "Software Engineer"


class ImproveSectionResponse(BaseModel):
    improved: str
    explanation: str


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    resumeContext: Optional[str] = ""


class ScanAtsRequest(BaseModel):
    resumeText: str
    jobDescription: Optional[str] = ""

