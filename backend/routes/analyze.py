import os
import json
import re
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from utils.pdf_parser import extract_text_from_pdf, extract_text_from_docx
from utils.ats_scanner import (
    scan_ats,
    _extract_emails,
    _extract_phones,
    _detect_sections,
    _extract_skills,
    COMMON_SKILLS,
)
from utils.ai_prompts import ANALYSIS_PROMPT
from utils.web_search import search_ddg
from utils.models import AnalysisResponse, ScanAtsRequest
from utils.ai_client import call_ai, get_gemini_key, get_anthropic_key

router = APIRouter()



def _build_career_guidance(text: str, job_description: str, role_name: str = None) -> dict:
    text_lower = text.lower()
    
    if not role_name:
        # Detect role
        role_name = "Software Engineer"
        if any(k in text_lower for k in ["docker", "kubernetes", "k8s", "devops", "jenkins", "ci/cd", "terraform", "ansible", "aws", "gcp", "azure", "cloud engineer", "cloud architect"]):
            role_name = "DevOps Engineer"
        elif any(k in text_lower for k in ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit", "artificial intelligence", "data scientist", "nlp"]):
            role_name = "Data Scientist / ML Engineer"
        elif any(k in text_lower for k in ["data analyst", "pandas", "numpy", "power bi", "tableau", "analytics", "data analytics"]):
            role_name = "Data Analyst"
        elif any(k in text_lower for k in ["flutter", "react native", "swift", "kotlin", "android developer", "ios developer", "mobile developer"]):
            role_name = "Mobile App Developer"
        elif any(k in text_lower for k in ["cybersecurity", "security analyst", "penetration testing", "firewalls", "information security", "network security"]):
            role_name = "Cybersecurity Analyst"
        elif any(k in text_lower for k in ["selenium", "cypress", "qa engineer", "software tester", "automation testing", "test automation"]):
            role_name = "QA Automation Engineer"
        elif any(k in text_lower for k in ["product manager", "project manager", "scrum master", "agile", "product lifecycle", "roadmap"]):
            role_name = "Product Manager"
        elif (any(k in text_lower for k in ["react", "frontend", "html", "css", "vue", "angular"]) and 
              any(k in text_lower for k in ["django", "fastapi", "flask", "node", "sql", "postgres", "backend"])):
            role_name = "Full Stack Developer"
        elif any(k in text_lower for k in ["react", "javascript", "typescript", "frontend", "html", "css", "vite", "vue", "angular", "next.js"]):
            role_name = "Frontend Developer"
        elif any(k in text_lower for k in ["api", "backend", "server", "fastapi", "django", "flask", "node", "sql", "postgres", "mongodb"]):
            role_name = "Backend Developer"
        elif any(k in text_lower for k in ["marketing", "seo", "sem", "brand manager", "pr specialist", "content writer", "digital marketing"]):
            role_name = "Marketing Specialist"
        elif any(k in text_lower for k in ["sales", "account manager", "business development", "lead generation", "sales executive"]):
            role_name = "Sales / Business Development Executive"
        elif any(k in text_lower for k in ["human resources", "talent acquisition", "recruiting", "hr manager", "hr specialist", "onboarding"]):
            role_name = "HR Specialist / Recruiter"
        elif any(k in text_lower for k in ["finance", "accounting", "auditing", "taxation", "financial analyst", "bookkeeping"]):
            role_name = "Finance / Accounts Analyst"
        elif any(k in text_lower for k in ["graphic design", "photoshop", "illustrator", "creative design", "art director", "ui/ux"]):
            role_name = "Graphic / UI-UX Designer"
        elif any(k in text_lower for k in ["mechanical engineering", "solidworks", "cad design", "hvac", "thermodynamics"]):
            role_name = "Mechanical Engineer"
        elif any(k in text_lower for k in ["civil engineering", "structural analysis", "construction management", "revit"]):
            role_name = "Civil Engineer"

    guidance_map = {
        "DevOps Engineer": {
            "roles": ["DevOps Engineer", "Cloud Architect", "Platform Engineer"],
            "prep": ["AWS/GCP Certifications", "Kubernetes Administration (CKA)", "Terraform & Infrastructure as Code"],
            "private": ["Amazon Web Services", "HashiCorp", "Red Hat", "Datadog", "Google"],
            "reason": "High demand in cloud-native product companies and infrastructure scaling teams."
        },
        "Data Scientist / ML Engineer": {
            "roles": ["Data Scientist", "Machine Learning Engineer", "AI Researcher"],
            "prep": ["Deep Learning & PyTorch", "Model deployment & MLOps", "Advanced Statistics & Probability"],
            "private": ["Google", "Meta", "OpenAI", "Microsoft", "Nvidia"],
            "reason": "Crucial for companies implementing AI features, predictive modeling, and LLMs."
        },
        "Data Analyst": {
            "roles": ["Data Analyst", "Business Intelligence Analyst", "Analytics Engineer"],
            "prep": ["Advanced SQL & analytics", "Tableau/Power BI dashboards", "Data warehousing basics"],
            "private": ["Deloitte", "Accenture", "Fractal Analytics", "Amazon", "JPMorgan"],
            "reason": "Valuable for data-driven decisions, business reporting, and operational efficiency."
        },
        "Mobile App Developer": {
            "roles": ["Mobile Developer", "iOS/Android Engineer", "Flutter Specialist"],
            "prep": ["Cross-platform architecture", "App Store/Play Store deployment", "Mobile UI state management"],
            "private": ["Uber", "Spotify", "Airbnb", "Razorpay", "Swiggy"],
            "reason": "Key for consumer-facing mobile products and digital startups."
        },
        "Cybersecurity Analyst": {
            "roles": ["Security Analyst", "Penetration Tester", "SecOps Specialist"],
            "prep": ["CompTIA Security+ / CEH", "Network packet analysis", "Vulnerability management"],
            "private": ["Palo Alto Networks", "CrowdStrike", "Cloudflare", "IBM Security", "FireEye"],
            "reason": "Essential for security consulting firms, financial tech, and enterprise infrastructure."
        },
        "QA Automation Engineer": {
            "roles": ["QA Engineer", "SDET (Software Development Engineer in Test)", "Test Architect"],
            "prep": ["Cypress/Selenium automation", "CI/CD automated testing integration", "API testing with Postman"],
            "private": ["BrowserStack", "Infosys", "TCS", "Cognizant", "Salesforce"],
            "reason": "Needed across all software houses to ensure release quality and continuous deployment."
        },
        "Product Manager": {
            "roles": ["Product Manager", "Associate Product Manager", "Technical Product Manager"],
            "prep": ["Product lifecycle management", "User research & wireframing", "A/B testing & product analytics"],
            "private": ["Google", "Atlassian", "Slack", "Stripe", "Microsoft"],
            "reason": "Perfect for cross-functional leadership, feature roadmap design, and user growth strategy."
        },
        "Full Stack Developer": {
            "roles": ["Full Stack Engineer", "Software Engineer", "MERN Developer"],
            "prep": ["React & Node.js integration", "PostgreSQL database design", "System design & API security"],
            "private": ["Stripe", "Vercel", "Netflix", "Atlassian", "Razorpay"],
            "reason": "Highly sought after by startups and fast-moving teams for end-to-end product delivery."
        },
        "Frontend Developer": {
            "roles": ["Frontend Engineer", "React Developer", "UI Developer"],
            "prep": ["React 19 & Next.js App Router", "TypeScript type-safety", "Tailwind CSS & design systems"],
            "private": ["Vercel", "Shopify", "Meta", "Adobe", "Canva"],
            "reason": "Critical for building premium, responsive, and high-performance user interfaces."
        },
        "Backend Developer": {
            "roles": ["Backend Engineer", "API Developer", "Database Engineer"],
            "prep": ["FastAPI & Django architecture", "SQL performance tuning", "Redis caching & message queues"],
            "private": ["Amazon", "Uber", "Netflix", "Paypal", "Stripe"],
            "reason": "In demand for building highly scalable, secure, and robust server-side architectures."
        },
        "Marketing Specialist": {
            "roles": ["Digital Marketer", "SEO Specialist", "Brand Manager"],
            "prep": ["Google Analytics Certification", "Content Marketing Strategy", "Facebook & Google Ads Management"],
            "private": ["HubSpot", "Advisors", "Digital Marketing Agencies", "Unilever", "PepsiCo"],
            "reason": "Perfect for growing brands, running campaigns, and analytics-driven marketing teams."
        },
        "Sales / Business Development Executive": {
            "roles": ["Business Development Manager", "Account Executive", "Sales Lead"],
            "prep": ["Sales Negotiation", "Salesforce CRM proficiency", "Lead Generation Techniques"],
            "private": ["Salesforce", "Oracle", "Dealshare", "BYJU'S", "Any growing B2B startup"],
            "reason": "Crucial for revenue generation, client onboarding, and expanding market reach."
        },
        "HR Specialist / Recruiter": {
            "roles": ["HR Generalist", "Talent Acquisition Specialist", "HR Manager"],
            "prep": ["Labor Law Compliance", "ATS Systems management", "Talent Sourcing & Interviewing"],
            "private": ["Adecco", "Randstad", "Top Tech Corporates", "Consultancies"],
            "reason": "Essential for team building, scaling organizations, and maintaining employee relations."
        },
        "Finance / Accounts Analyst": {
            "roles": ["Financial Analyst", "Accountant", "Tax Consultant"],
            "prep": ["Advanced Excel & Financial Modeling", "CFA / CPA qualifications", "Tally & GST compliance"],
            "private": ["JPMorgan Chase", "Deloitte", "Goldman Sachs", "EY", "KPMG"],
            "reason": "Valuable for corporate budget planning, taxation, financial audits, and investment strategies."
        },
        "Graphic / UI-UX Designer": {
            "roles": ["UI/UX Designer", "Graphic Designer", "Creative Director"],
            "prep": ["Figma & Adobe Creative Suite", "UX Research & Wireframing", "Portfolio construction"],
            "private": ["Vercel", "Canva", "Figma", "Design Studios", "Tech Startups"],
            "reason": "In high demand for creating clean user experiences and engaging brand visuals."
        },
        "Mechanical Engineer": {
            "roles": ["Mechanical Engineer", "CAD Designer", "HVAC Engineer"],
            "prep": ["SolidWorks / AutoCAD proficiency", "Finite Element Analysis (FEA)", "Manufacturing workflows"],
            "private": ["L&T", "Tata Motors", "Mahindra", "Siemens", "General Electric"],
            "reason": "Important for automotive design, HVAC systems, industrial machinery, and production plants."
        },
        "Civil Engineer": {
            "roles": ["Civil Engineer", "Structural Engineer", "Site Supervisor"],
            "prep": ["Revit & AutoCAD structural design", "Project Management & Estimation", "GIS Mapping"],
            "private": ["L&T Construction", "DLF", "Tata Projects", "Government PWD departments"],
            "reason": "Crucial for infrastructure development, building design, and site project management."
        },
        "Software Engineer": {
            "roles": ["Software Engineer", "Associate Engineer", "Systems Engineer"],
            "prep": ["Data Structures & Algorithms", "System Design fundamentals", "Git & teamwork workflows"],
            "private": ["Infosys", "TCS", "Wipro", "HCL Tech", "Cognizant"],
            "reason": "Standard entry point for broad technical paths and enterprise software development."
        }
    }
    
    profile = guidance_map.get(role_name, guidance_map["Software Engineer"])
    
    # Calculate confidence based on profile matches
    confidence = 65
    if role_name != "Software Engineer":
        confidence = 88
        
    return {
        "targetField": role_name,
        "idealRoles": profile["roles"],
        "preparationAreas": profile["prep"],
        "companyMatches": [
            {
                "sector": "Private Sector",
                "companies": profile["private"],
                "fitReason": profile["reason"]
            },
            {
                "sector": "Government / PSU",
                "companies": ["NIC", "CDAC", "DRDO", "ISRO", "PSU IT Cells"],
                "fitReason": "Offers long-term stability and is great for candidates willing to undergo formal examinations and security clearances."
            }
        ],
        "confidence": confidence
    }


def _build_fallback_analysis(text: str, job_description: str, ats_report: dict = None) -> dict:
    if ats_report is None:
        try:
            ats_report = scan_ats(text, job_description)
        except Exception:
            ats_report = {}
            
    role_name = ats_report.get("roleName", "Software Engineer")
    missingKeywords = ats_report.get("missingKeywords", [])
    matchedKeywords = ats_report.get("matchedKeywords", [])
    sections = ats_report.get("sections", [])
    formatWarnings = ats_report.get("formatWarnings", [])
    overall_score = ats_report.get("atsScore", 65)
    
    # Dynamic Estimated Improvement
    estimated_improvement = min(98, overall_score + len(missingKeywords) * 2 + len(formatWarnings) * 3)
    if estimated_improvement <= overall_score:
        estimated_improvement = min(100, overall_score + 10)
        
    # Categories Scores
    section_score = ats_report.get("sectionScore", 70)
    keyword_score = ats_report.get("keywordScore", 50)
    formatting_score = ats_report.get("formattingScore", 80)
    
    text_lower = text.lower()
    verb_hits = sum(1 for verb in ["led", "managed", "spearheaded", "built", "designed", "optimized", "increased", "developed", "architected"] if verb in text_lower)
    experience_quality = max(30, min(100, 45 + verb_hits * 8 + (10 if "experience" in [s.lower() for s in sections] else 0)))
    
    education_certs = max(30, min(100, 50 + (15 if "education" in [s.lower() for s in sections] else 0) + (15 if "certifications" in [s.lower() for s in sections] or "cert" in text_lower else 0)))
    
    categories = {
        "formatStructure": section_score,
        "keywordsMatch": keyword_score,
        "experienceQuality": experience_quality,
        "educationCerts": education_certs,
        "readability": formatting_score
    }
    
    # Strengths
    strengths = []
    if matchedKeywords:
        strengths.append(f"Command of modern core skills: {', '.join(matchedKeywords[:4])}")
    else:
        strengths.append("Foundational technical skills are listed in the profile")
        
    if ats_report.get("contact", {}).get("contactPresent", False):
        strengths.append("Professional contact details (email/phone) are clearly present")
    else:
        strengths.append("Plain-text contact header layout")
        
    if len(sections) >= 4:
        strengths.append(f"Clear structural organization containing {len(sections)} standard sections")
    else:
        strengths.append("Clear visual section boundaries")
        
    # Weaknesses
    weaknesses = []
    if missingKeywords:
        weaknesses.append(f"Missing critical 2026 trending skills for {role_name}: {', '.join(missingKeywords[:4])}")
    else:
        weaknesses.append(f"Could benefit from stronger role-specific keyword density matching")
        
    if formatWarnings:
        weaknesses.append(f"Formatting warning: {formatWarnings[0]}")
    else:
        weaknesses.append("Lack of quantitative results (e.g. percentages, metrics) in experience descriptions")
        
    weaknesses.append("Bullets can be optimized with stronger leadership action verbs")
    
    # Roadmap
    phase1 = []
    if formatWarnings:
        phase1.extend([f"Fix format issue: {w}" for w in formatWarnings[:2]])
    if missingKeywords:
        phase1.append(f"Integrate key tools to your skills list: {', '.join(missingKeywords[:2])}")
    else:
        phase1.append(f"Add a target headline for {role_name} at the top")
    if len(phase1) < 3:
        phase1.append("Create a concise 3-sentence professional summary")
        
    phase2 = []
    if len(missingKeywords) > 2:
        phase2.append(f"Build a repository showcasing {', '.join(missingKeywords[2:4])}")
    else:
        phase2.append("Add a technical project using modern stacks")
    phase2.append("Refactor experience bullets to begin with action verbs and include metrics (e.g., % improvement)")
    phase2.append("Include links to your GitHub or LinkedIn profile in the contact details")
    
    phase3 = []
    if len(missingKeywords) > 4:
        phase3.append(f"Obtain a certification or complete a course in {missingKeywords[4]}")
    else:
        phase3.append("Obtain cloud or technology domain certifications")
    phase3.append(f"Prepare for {role_name} interview questions, focusing on system architecture and core tools")
    phase3.append("Create tailored resume variations matching individual target job postings")
    
    roadmap = {
        "phase1": phase1[:3],
        "phase2": phase2[:3],
        "phase3": phase3[:3]
    }
    
    career_guidance = _build_career_guidance(text, job_description, role_name)
    
    # Parsing for structuredResume
    emails = ats_report.get("contact", {}).get("emails", [])
    phones = ats_report.get("contact", {}).get("phones", [])
    skills_found = ats_report.get("skillsFound", [])
    
    name = "Resume Candidate"
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        for candidate_name in lines[:3]:
            if len(candidate_name) < 50 and "@" not in candidate_name and not any(d.isdigit() for d in candidate_name):
                name = candidate_name
                break
                
    experience_lines = []
    education_lines = []
    project_lines = []
    summary_lines = []
    
    current_section = None
    for line in lines:
        l_lower = line.lower()
        section_cleaned = re.sub(r'[^a-z ]', '', l_lower).strip()
        if section_cleaned in ["summary", "professional summary", "profile", "about me"]:
            current_section = "summary"
            continue
        elif any(alias in section_cleaned for alias in ["experience", "work history", "employment", "history", "career"]):
            current_section = "experience"
            continue
        elif any(alias in section_cleaned for alias in ["education", "academic", "studies"]):
            current_section = "education"
            continue
        elif any(alias in section_cleaned for alias in ["projects", "project experience", "personal projects", "key projects"]):
            current_section = "projects"
            continue
        elif any(alias in section_cleaned for alias in ["skills", "technical skills", "core skills", "technologies"]):
            current_section = "skills"
            continue
            
        if current_section == "summary":
            if len(summary_lines) < 3:
                summary_lines.append(line)
        elif current_section == "experience":
            if len(experience_lines) < 20:
                experience_lines.append(line)
        elif current_section == "education":
            if len(education_lines) < 10:
                education_lines.append(line)
        elif current_section == "projects":
            if len(project_lines) < 15:
                project_lines.append(line)

    prof_summary = " ".join(summary_lines) if summary_lines else f"Professional Software Engineer specializing in {role_name} technologies."
    
    jobs = []
    current_job = {"company": "", "title": "", "duration": "", "bullets": []}
    for eline in experience_lines:
        is_header = any(word in eline.lower() for word in [" at ", "inc", "co.", "corp", "ltd", "limited", "pvt"]) or re.search(r"\b(19|20)\d{2}\b", eline)
        if is_header:
            if current_job["bullets"] or current_job["company"]:
                jobs.append(current_job)
            comp = eline
            title = "Position"
            if " at " in eline:
                parts = eline.split(" at ", 1)
                title = parts[0].strip()
                comp = parts[1].strip()
            elif " - " in eline:
                parts = eline.split(" - ", 1)
                comp = parts[0].strip()
                title = parts[1].strip()
            current_job = {"company": comp, "title": title, "duration": "Duration", "bullets": []}
        else:
            if eline.strip().startswith(("-", "*", "•")):
                current_job["bullets"].append(eline.lstrip("•-* "))
            elif current_job["company"]:
                if not current_job["title"] or current_job["title"] == "Position":
                    current_job["title"] = eline
                else:
                    current_job["bullets"].append(eline)
            else:
                current_job["company"] = eline
                
    if current_job["bullets"] or current_job["company"]:
        if not current_job["bullets"]:
            current_job["bullets"] = ["Role responsibilities and achievements."]
        jobs.append(current_job)
    
    if not jobs:
        jobs = [{"company": "Company Name", "title": "Job Title", "duration": "Duration", "bullets": ["Describe achievements"]}]
        
    edus = []
    for eduline in education_lines:
        if len(eduline) > 8:
            deg = eduline
            inst = "Institution"
            if " at " in eduline:
                parts = eduline.split(" at ", 1)
                deg = parts[0].strip()
                inst = parts[1].strip()
            elif " from " in eduline:
                parts = eduline.split(" from ", 1)
                deg = parts[0].strip()
                inst = parts[1].strip()
            edus.append({"degree": deg, "institution": inst, "year": "Year", "cgpa": ""})
            
    if not edus:
        edus = [{"degree": "Degree", "institution": "University / Institution", "year": "Year", "cgpa": ""}]
        
    projs = []
    current_proj = {"name": "", "techStack": "", "description": ""}
    for pline in project_lines:
        if len(pline) < 40 and not pline.strip().startswith(("-", "*", "•")):
            if current_proj["name"] or current_proj["description"]:
                projs.append(current_proj)
            current_proj = {"name": pline, "techStack": "Technologies", "description": ""}
        else:
            current_proj["description"] = (current_proj["description"] + " " + pline.lstrip("•-* ")).strip()
            
    if current_proj["name"] or current_proj["description"]:
        if not current_proj["name"]:
            current_proj["name"] = "Project Name"
        if not current_proj["description"]:
            current_proj["description"] = "Project details."
        projs.append(current_proj)
        
    if not projs:
        projs = [{"name": "Project Name", "techStack": "Technologies used", "description": "Describe what you built and the impact it had."}]
        
    structured_resume = {
        "personalInfo": {
            "name": name,
            "email": emails[0] if emails else "",
            "phone": phones[0] if phones else "",
            "location": "",
            "linkedIn": "",
            "github": ""
        },
        "professionalSummary": prof_summary,
        "workExperience": jobs,
        "skills": skills_found if skills_found else ["Software Engineering"],
        "education": edus,
        "projects": projs,
        "certifications": []
    }
    
    summary_text = (
        f"We completed a live search-grounded ATS analysis for a {role_name} role. "
        f"Your resume shows a solid foundation in {', '.join(matchedKeywords[:3]) if matchedKeywords else 'some core areas'}, "
        f"but is currently missing key 2026 industry standards such as {', '.join(missingKeywords[:3]) if missingKeywords else 'trending technologies'}. "
        f"Addressing the formatting warnings and matching these keywords will significantly boost your visibility to hiring managers."
    )

    return {
        "overallScore": overall_score,
        "categories": categories,
        "roadmap": roadmap,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "estimatedImprovement": estimated_improvement,
        "careerGuidance": career_guidance,
        "structuredResume": structured_resume,
        "summary": summary_text,
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    jobDescription: str = Form(default=""),
    x_gemini_api_key: str = Header(default=None, alias="X-Gemini-API-Key"),
    x_github_token: str = Header(default=None, alias="X-GitHub-Token")
):
    """
    Analyze a resume file and return detailed scoring and improvement roadmap.
    
    Supports PDF and DOCX files.
    Returns overall score (0-100), category scores, strengths, weaknesses, and improvement roadmap.
    """
    
    # Read file content
    content = await resume.read()
    
    if not resume.filename:
        raise HTTPException(status_code=400, detail="File must have a name")
    
    # Extract text based on file type
    filename_lower = resume.filename.lower()
    if filename_lower.endswith(".pdf"):
        try:
            text = extract_text_from_pdf(content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif filename_lower.endswith(".docx"):
        try:
            text = extract_text_from_docx(content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported. Please upload a .pdf or .docx file."
        )
    
    # Validate extracted text
    if len(text.strip()) < 100:
        file_type = "PDF" if filename_lower.endswith(".pdf") else "Word document"
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract meaningful text from the {file_type}. Please ensure the file is not empty and contains selectable text (not scanned images)."
        )
    
    # Pre-calculate ATS report (scrapes trends from DuckDuckGo if no JD is provided)
    try:
        ats_report = scan_ats(text, jobDescription)
    except Exception as e:
        print(f"Local ATS scan error: {str(e)}")
        ats_report = {}

    # Perform a free live web search to ground the analysis in the latest 2026 hiring trends
    role_name = ats_report.get("roleName", "Software Engineer")
    search_query = f"trending {role_name} skills tools job requirements 2026"
    print(f"Executing free DDG search grounding for: {search_query}")
    web_results = search_ddg(search_query)

    # Prepare prompt with resume, job description, and live web search grounding results
    prompt = ANALYSIS_PROMPT.format(
        resume_text=text,
        job_description=jobDescription if jobDescription else "Not provided",
        web_search_results=web_results
    )
    
    # Call AI API
    use_fallback = False
    response_text = ""
    try:
        response_text = call_ai(prompt, max_tokens=2000, enable_search=False, api_key=x_gemini_api_key, github_token=x_github_token)
    except Exception as e:
        print(f"AI API failed, falling back to local analysis. Reason: {str(e)}")
        use_fallback = True
        
    if not use_fallback:
        # Parse response
        try:
            # Strip code block markers if any (Gemini sometimes returns JSON in markdown code blocks like ```json ... ```)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            result = json.loads(response_text.strip())
            
            if "careerGuidance" not in result or not result["careerGuidance"]:
                result["careerGuidance"] = _build_career_guidance(text, jobDescription, ats_report.get("roleName"))
            
            # Combine the local structural report with the AI's semantic scoring
            # This mimics real ATS systems that blend parsing heuristics (formatting/sections) with semantic matching (NLP).
            # Strict Alignment: 80% Parser Heuristics (Local rules) + 20% Semantic AI
            ai_score = result.get("overallScore", 0)
            ai_cats = result.get("categories", {}) or {}
            
            # Map categories with high parser compliance weight
            format_structure = round((ats_report.get("sectionScore", 50) * 0.8) + (ai_cats.get("formatStructure", 50) * 0.2)) if ai_score > 0 else ats_report.get("sectionScore", 0)
            keywords_match = round((ats_report.get("keywordScore", 50) * 0.8) + (ai_cats.get("keywordsMatch", 50) * 0.2)) if ai_score > 0 else ats_report.get("keywordScore", 0)
            experience_quality = round((ats_report.get("experienceScore", 50) * 0.8) + (ai_cats.get("experienceQuality", 50) * 0.2)) if ai_score > 0 else ats_report.get("experienceScore", 0)
            education_certs = round((ats_report.get("educationScore", 50) * 0.8) + (ai_cats.get("educationCerts", 50) * 0.2)) if ai_score > 0 else ats_report.get("educationScore", 0)
            readability = round((ats_report.get("formattingScore", 50) * 0.8) + (ai_cats.get("readability", 50) * 0.2)) if ai_score > 0 else ats_report.get("formattingScore", 0)

            result["categories"] = {
                "formatStructure": format_structure,
                "keywordsMatch": keywords_match,
                "experienceQuality": experience_quality,
                "educationCerts": education_certs,
                "readability": readability
            }

            # Recalculate overall score strictly using the weighted rubric:
            # Content (30%), Section (25%), ATS Essentials/Readability (20%), Tailoring (25%)
            overall = round(
                (experience_quality * 0.30)
                + (format_structure * 0.25)
                + (readability * 0.20)
                + (keywords_match * 0.25)
            )

            # Apply hard gating: cap score if contact info is missing
            contact_info = ats_report.get("contact", {})
            if not contact_info.get("contactPresent", False):
                overall = min(overall, 45)
            elif not contact_info.get("emails") or not contact_info.get("phones"):
                overall = min(overall, 65)

            result["overallScore"] = max(15, min(95, overall))
            result["parsedText"] = text
            result["atsReport"] = ats_report
            result["isFallback"] = False
            return AnalysisResponse(**result)
        except Exception as e:
            print(f"JSON Parsing failed: {str(e)}. Response: {response_text}")
            use_fallback = True
            
    if use_fallback:
        result = _build_fallback_analysis(text, jobDescription, ats_report)
        result["parsedText"] = text
        result["atsReport"] = ats_report
        result["isFallback"] = True
        return AnalysisResponse(**result)


@router.post("/scan-ats-direct")
async def scan_ats_direct(req: ScanAtsRequest):
    """
    Directly run the local ATS scanner on the provided resume text and job description.
    """
    try:
        report = scan_ats(req.resumeText, req.jobDescription)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

