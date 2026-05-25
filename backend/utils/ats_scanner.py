import re
from difflib import get_close_matches
from typing import Dict, List, Set, Tuple


STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "for", "of", "in", "on", "with", "at", "by",
    "from", "as", "is", "are", "be", "this", "that", "will", "can", "must", "should",
    "years", "year", "experience", "role", "job", "candidate", "required", "preferred",
    "looking", "seeking", "work", "strong", "good", "excellent", "ability", "knowledge",
}

SYNONYMS = {
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "node": ["nodejs", "node.js"],
    "react": ["reactjs", "react.js"],
    "postgres": ["postgresql", "psql"],
    "aws": ["amazon web services"],
    "ci/cd": ["cicd", "continuous integration", "continuous delivery"],
    "kubernetes": ["k8s"],
    "artificial intelligence": ["ai"],
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "natural language processing": ["nlp"],
    "google cloud": ["gcp"],
    "microsoft azure": ["azure"],
    "cascading style sheets": ["css"],
    "hypertext markup language": ["html"],
}


def _normalize(text: str) -> str:
    # Keep line breaks to improve section-heading checks.
    cleaned = text.replace("\r", "\n")
    cleaned = re.sub(r"\n+", "\n", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    return cleaned.strip().lower()


def _extract_emails(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)


def _extract_phones(text: str) -> List[str]:
    return re.findall(r"\+?\d[\d\s\-()]{6,}\d", text)


def _detect_sections(text: str) -> List[str]:
    sections = []
    heading_map = {
        "summary": ["summary", "professional summary", "profile"],
        "experience": ["experience", "work experience", "employment"],
        "projects": ["projects", "project experience"],
        "education": ["education", "academic"],
        "skills": ["skills", "technical skills", "core skills"],
        "certifications": ["certifications", "certificates"],
    }

    lines = [line.strip().lower() for line in text.split("\n") if line.strip()]
    for section, aliases in heading_map.items():
        found = False
        for line in lines:
            for alias in aliases:
                # Heading-style matching improves precision over raw substring checks.
                if re.fullmatch(rf"{re.escape(alias)}[:\-]?", line):
                    found = True
                    break
            if found:
                break
        if found:
            sections.append(section.capitalize())

    # Fallback to substring detection if OCR/noisy parsing removed line breaks.
    if not sections:
        lower = text.lower()
        for section, aliases in heading_map.items():
            if any(alias in lower for alias in aliases):
                sections.append(section.capitalize())
    return sections


def _extract_skills(text: str, skills_list: List[str]) -> List[str]:
    found = set()
    lower = text.lower()
    for s in skills_list:
        s_lower = s.lower()
        escaped = re.escape(s_lower)
        # Handle short keywords (c, r, go) or symbols (c++, c#, .net) with custom boundaries
        if len(s_lower) <= 2 or "++" in s_lower or "#" in s_lower or "." in s_lower:
            pattern = rf"(?:^|[^a-zA-Z0-9+#.-]){escaped}(?:$|[^a-zA-Z0-9+#.-])"
        else:
            pattern = rf"\b{escaped}\b"
            
        if re.search(pattern, lower):
            found.add(s)
    return sorted(found)


COMMON_SKILLS = [
    # Languages
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'C', 'Ruby', 'PHP', 'Go', 'Golang', 
    'Rust', 'Swift', 'Kotlin', 'Scala', 'HTML', 'CSS', 'SQL', 'R', 'MATLAB', 'Shell', 'Bash',
    # Frontend
    'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Tailwind', 'Bootstrap', 'jQuery', 'Redux', 'Webpack', 'Vite',
    # Backend / API
    'Node.js', 'Node', 'Express', 'FastAPI', 'Django', 'Flask', 'Rails', 'Spring', 'Spring Boot', 'ASP.NET', 'GraphQL', 'REST API', 'WebSockets',
    # Databases
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'Firebase', 'DynamoDB', 'Elasticsearch',
    # Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Unix', 'Nginx',
    # ML / AI / Data
    'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI', 'ML', 'NLP', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Excel', 'Spark', 'Hadoop',
    # Methodologies & Tools
    'Agile', 'Scrum', 'Jira', 'Postman', 'Figma', 'System Design', 'Data Structures', 'Algorithms', 'OOP',
    # Marketing
    'SEO', 'SEM', 'Google Analytics', 'Content Strategy', 'Email Marketing', 'Social Media', 'Copywriting', 'Digital Marketing',
    # Sales & BD
    'Sales', 'Business Development', 'Lead Generation', 'CRM', 'Salesforce', 'B2B Sales',
    # HR & Operations
    'Human Resources', 'Talent Acquisition', 'Onboarding', 'Recruiting', 'Employee Relations',
    # Finance & Accounting
    'Financial Analysis', 'Accounting', 'Budgeting', 'Financial Modeling', 'Auditing',
    # Design & Creative
    'Graphic Design', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Adobe Creative Suite',
    # Engineering
    'CAD', 'SolidWorks', 'AutoCAD', 'Revit', 'Thermodynamics', 'Construction Management'
]



def _tokenize(text: str) -> Set[str]:
    raw_tokens = re.findall(r"\b[a-z][a-z0-9+.#/-]{1,}\b", text.lower())
    return {t for t in raw_tokens if t not in STOPWORDS and len(t) > 1}


def _expand_keyword(keyword: str) -> List[str]:
    base = keyword.lower().strip()
    aliases = [base]
    if base in SYNONYMS:
        aliases.extend(SYNONYMS[base])
    return aliases


def _keyword_present(keyword: str, resume_text: str, resume_tokens: Set[str]) -> bool:
    aliases = _expand_keyword(keyword)
    for alias in aliases:
        if " " in alias:
            if alias in resume_text:
                return True
        elif alias in resume_tokens:
            return True
        elif f"{alias}s" in resume_tokens or f"{alias}es" in resume_tokens:
            return True
        elif len(alias) >= 3 and any(token.startswith(alias) for token in resume_tokens):
            return True
        else:
            close = get_close_matches(alias, list(resume_tokens), n=1, cutoff=0.9)
            if close:
                return True
    return False


def _extract_jd_keywords(job_description: str) -> List[str]:
    jd = _normalize(job_description)
    if not jd:
        return []

    tokens = list(_tokenize(jd))
    candidates = set(tokens)

    for skill in COMMON_SKILLS:
        skill_lower = skill.lower()
        aliases = _expand_keyword(skill_lower)
        if any(alias in jd for alias in aliases):
            candidates.add(skill_lower)

    weighted = sorted(candidates, key=len, reverse=True)
    return [kw for kw in weighted if len(kw) >= 3][:40]


def _keyword_weight(keyword: str) -> int:
    technical = {
        "python", "javascript", "typescript", "react", "node", "sql", "aws", "azure", "gcp",
        "docker", "kubernetes", "fastapi", "django", "mongodb", "postgres",
    }
    if keyword in technical:
        return 3
    if len(keyword) >= 8:
        return 2
    return 1


def _experience_quality_score(text: str, section_names: List[str]) -> int:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    bullet_lines = [line for line in lines if line.startswith(('-', '*', '•'))]
    lower = text.lower()

    action_verbs = [
        'led', 'managed', 'built', 'designed', 'developed', 'implemented',
        'optimized', 'reduced', 'increased', 'improved', 'created', 'delivered',
        'spearheaded', 'automated', 'architected', 'launched', 'scaled'
    ]

    verb_hits = sum(
        1 for line in bullet_lines
        if any(line.lower().lstrip('-*• ').startswith(verb) for verb in action_verbs)
    )
    metric_hits = len(re.findall(r'\b\d+(?:\.\d+)?%\b|\$\d[\d,]*|\b\d+[xX]\b|\b\d+\s+(?:months?|years?|people|users|clients|projects?)\b', text))

    if 'experience' not in section_names:
        return max(20, min(55, 30 + min(10, len(bullet_lines) * 2) + metric_hits * 2))

    score = 40
    score += min(25, len(bullet_lines) * 3)
    score += min(20, verb_hits * 4)
    score += min(15, metric_hits * 3)
    if 'project' in lower:
        score += 4
    return max(25, min(100, score))


def _education_quality_score(text: str, section_names: List[str]) -> int:
    lower = text.lower()
    score = 25

    if 'education' in section_names:
        score += 40
    if 'certifications' in section_names:
        score += 10

    if re.search(r'\b(bachelor|master|b\.sc|bsc|btech|b\.tech|m\.sc|msc|phd|mba|associate)\b', lower):
        score += 15
    if re.search(r'\b(\d\.\d{1,2}|\d{1,2}%|\d{1,2}\.\d{1,2})\b', lower):
        score += 5

    return max(20, min(100, score))


def _contact_quality_score(emails: List[str], phones: List[str]) -> int:
    if emails and phones:
        return 100
    if emails or phones:
        return 70
    return 35


def _formatting_warnings(raw_text: str, norm_text: str) -> Tuple[List[str], int]:
    warnings: List[str] = []
    penalty = 0

    if "|" in raw_text and raw_text.count("|") > 15:
        warnings.append("Resume appears table-heavy; some ATS parsers may fail to read columns correctly")
        penalty += 10
    if re.search(r"\b(text box|textbox|icon|infographic)\b", norm_text):
        warnings.append("Detected design-heavy elements (text boxes/icons); ATS parsing can miss content")
        penalty += 6
    if len(raw_text.splitlines()) <= 3:
        warnings.append("Low line-break structure detected; parser output may be compressed")
        penalty += 8

    return warnings, penalty


def _fetch_online_trends(role_name: str) -> list:
    # Deterministic role-based baseline skill lists.
    # The previous web lookup made scores inconsistent across runs and machines.
    fallback_trends = {
        "frontend": ["React", "TypeScript", "Next.js", "Vite", "Tailwind CSS", "Redux", "GraphQL", "HTML5", "CSS3"],
        "backend": ["Python", "FastAPI", "Node.js", "PostgreSQL", "Docker", "REST API", "Redis", "MongoDB", "AWS"],
        "fullstack": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST API", "Next.js", "AWS", "Git"],
        "devops": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "GitHub Actions", "Linux", "Nginx", "Ansible"],
        "data": ["Python", "SQL", "Pandas", "Power BI", "Tableau", "Machine Learning", "PyTorch", "Spark", "NumPy"],
        "mobile": ["Flutter", "React Native", "Swift", "Kotlin", "Dart", "Firebase", "iOS", "Android", "Git"],
        "security": ["Cybersecurity", "Network Security", "Penetration Testing", "Linux", "Wireshark", "Firewalls", "OWASP", "SIEM"],
        "qa": ["Selenium", "Cypress", "QA Automation", "JUnit", "Postman", "CI/CD", "Git", "Jest", "Playwright"],
        "pm": ["Agile", "Scrum", "Product Management", "Jira", "Roadmapping", "SQL", "Analytics", "System Design"],
        "marketing": ["SEO", "SEM", "Google Analytics", "Digital Marketing", "Social Media", "Copywriting", "Content Strategy", "Email Marketing"],
        "sales": ["Sales", "Business Development", "Lead Generation", "CRM", "B2B Sales", "Salesforce"],
        "hr": ["Human Resources", "Talent Acquisition", "Onboarding", "Recruiting", "Employee Relations"],
        "finance": ["Financial Analysis", "Accounting", "Excel", "Budgeting", "Financial Modeling", "Auditing"],
        "design": ["Graphic Design", "Photoshop", "Illustrator", "Figma", "UI/UX Design", "Adobe Creative Suite"],
        "mechanical": ["CAD", "SolidWorks", "AutoCAD", "Thermodynamics", "Materials Science", "FEA"],
        "civil": ["Civil Engineering", "AutoCAD", "Structural Analysis", "Construction Management", "Revit"],
        "general": ["Git", "SQL", "Python", "Data Structures", "Algorithms", "System Design", "REST API", "Docker", "Postman"]
    }
    
    role_lower = role_name.lower()
    category = "general"
    if any(k in role_lower for k in ["full stack", "fullstack"]):
        category = "fullstack"
    elif any(k in role_lower for k in ["front", "react", "angular", "vue", "web"]):
        category = "frontend"
    elif any(k in role_lower for k in ["back", "api", "node", "django", "server"]):
        category = "backend"
    elif any(k in role_lower for k in ["devops", "cloud", "aws", "kubernetes", "infra"]):
        category = "devops"
    elif any(k in role_lower for k in ["data", "analytics", "ml", "machine", "science"]):
        category = "data"
    elif any(k in role_lower for k in ["mobile", "flutter", "react native", "swift", "kotlin", "ios", "android"]):
        category = "mobile"
    elif any(k in role_lower for k in ["cyber", "security", "penetration"]):
        category = "security"
    elif any(k in role_lower for k in ["qa", "test", "selenium", "cypress"]):
        category = "qa"
    elif any(k in role_lower for k in ["product", "project", "scrum", "agile"]):
        category = "pm"
    elif "marketing" in role_lower:
        category = "marketing"
    elif any(k in role_lower for k in ["sales", "business development", "bd"]):
        category = "sales"
    elif any(k in role_lower for k in ["hr", "human resource", "recruit", "talent"]):
        category = "hr"
    elif any(k in role_lower for k in ["finance", "account", "tax", "audit"]):
        category = "finance"
    elif any(k in role_lower for k in ["design", "graphic", "creative", "illustrator"]):
        category = "design"
    elif "mechanical" in role_lower:
        category = "mechanical"
    elif "civil" in role_lower:
        category = "civil"
        
    return list(fallback_trends[category])


def scan_ats(resume_text: str, job_description: str = '') -> Dict:
    """Return a simple ATS-style report based on heuristics.

    This is not a real ATS but mimics common checks: contact info, section presence,
    keyword matching vs job description, skills extraction, and formatting notes.
    """
    report = {}
    text = resume_text or ''
    jd = job_description or ''
    norm_text = _normalize(text)
    resume_tokens = _tokenize(norm_text)

    # Automatically detect target role name
    role_name = "Software Engineer"
    
    # 1. DevOps / Cloud
    if any(k in norm_text for k in ["docker", "kubernetes", "k8s", "devops", "jenkins", "ci/cd", "terraform", "ansible", "aws", "gcp", "azure", "cloud engineer", "cloud architect"]):
        role_name = "DevOps Engineer"
    # 2. Data Scientist / ML / Data Analyst
    elif any(k in norm_text for k in ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit", "artificial intelligence", "data scientist", "nlp"]):
        role_name = "Data Scientist / ML Engineer"
    elif any(k in norm_text for k in ["data analyst", "pandas", "numpy", "power bi", "tableau", "analytics", "data analytics"]):
        role_name = "Data Analyst"
    # 3. Mobile
    elif any(k in norm_text for k in ["flutter", "react native", "swift", "kotlin", "android developer", "ios developer", "mobile developer"]):
        role_name = "Mobile App Developer"
    # 4. Cybersecurity
    elif any(k in norm_text for k in ["cybersecurity", "security analyst", "penetration testing", "firewalls", "information security", "network security"]):
        role_name = "Cybersecurity Analyst"
    # 5. QA / Test
    elif any(k in norm_text for k in ["selenium", "cypress", "qa engineer", "software tester", "automation testing", "test automation"]):
        role_name = "QA Automation Engineer"
    # 6. Product / Project Manager
    elif any(k in norm_text for k in ["product manager", "project manager", "scrum master", "agile", "product lifecycle", "roadmap"]):
        role_name = "Product Manager"
    # 7. Full Stack
    elif (any(k in norm_text for k in ["react", "frontend", "html", "css", "vue", "angular"]) and 
          any(k in norm_text for k in ["django", "fastapi", "flask", "node", "sql", "postgres", "backend"])):
        role_name = "Full Stack Developer"
    # 8. Frontend
    elif any(k in norm_text for k in ["react", "javascript", "typescript", "frontend", "html", "css", "vite", "vue", "angular", "next.js"]):
        role_name = "Frontend Developer"
    # 9. Backend
    elif any(k in norm_text for k in ["api", "backend", "server", "fastapi", "django", "flask", "node", "sql", "postgres", "mongodb"]):
        role_name = "Backend Developer"
    # 10. Marketing
    elif any(k in norm_text for k in ["marketing", "seo", "sem", "brand manager", "pr specialist", "content writer", "digital marketing"]):
        role_name = "Marketing Specialist"
    # 11. Sales / BD
    elif any(k in norm_text for k in ["sales", "account manager", "business development", "lead generation", "sales executive"]):
        role_name = "Sales / Business Development Executive"
    # 12. HR / Recruiting
    elif any(k in norm_text for k in ["human resources", "talent acquisition", "recruiting", "hr manager", "hr specialist", "onboarding"]):
        role_name = "HR Specialist / Recruiter"
    # 13. Finance / Accounting
    elif any(k in norm_text for k in ["finance", "accounting", "auditing", "taxation", "financial analyst", "bookkeeping"]):
        role_name = "Finance / Accounts Analyst"
    # 14. Graphic / Creative Design
    elif any(k in norm_text for k in ["graphic design", "photoshop", "illustrator", "creative design", "art director", "ui/ux"]):
        role_name = "Graphic / UI-UX Designer"
    # 15. Mechanical Engineering
    elif any(k in norm_text for k in ["mechanical engineering", "solidworks", "cad design", "hvac", "thermodynamics"]):
        role_name = "Mechanical Engineer"
    # 16. Civil Engineering
    elif any(k in norm_text for k in ["civil engineering", "structural analysis", "construction management", "revit"]):
        role_name = "Civil Engineer"

    emails = _extract_emails(text)
    phones = _extract_phones(text)
    sections = _detect_sections(text)
    skills_found = _extract_skills(norm_text, COMMON_SKILLS)

    # Keyword matching against job description
    jd_keywords = _extract_jd_keywords(jd)
    if jd_keywords:
        matched_keywords = []
        missing_keywords = []
        weighted_matched = 0
        weighted_total = 0

        for kw in jd_keywords:
            w = _keyword_weight(kw)
            weighted_total += w
            if _keyword_present(kw, norm_text, resume_tokens):
                matched_keywords.append(kw)
                weighted_matched += w
            else:
                missing_keywords.append(kw)

        keyword_match_ratio = round((weighted_matched / max(1, weighted_total)) * 100)
    else:
        # Fetch actual online trends in real-time
        trending_skills = _fetch_online_trends(role_name)
        
        matched_keywords = []
        missing_keywords = []
        for skill in trending_skills:
            skill_lower = skill.lower()
            if any(skill_lower == s.lower() for s in skills_found):
                matched_keywords.append(skill)
            else:
                # Handle boundaries for short skills
                escaped = re.escape(skill_lower)
                if len(skill_lower) <= 2 or "++" in skill_lower or "#" in skill_lower or "." in skill_lower:
                    pattern = rf"(?:^|[^a-zA-Z0-9+#.-]){escaped}(?:$|[^a-zA-Z0-9+#.-])"
                else:
                    pattern = rf"\b{escaped}\b"
                if re.search(pattern, norm_text):
                    matched_keywords.append(skill)
                else:
                    missing_keywords.append(skill)
                    
        keyword_match_ratio = round((len(matched_keywords) / max(1, len(trending_skills))) * 100)

    # Basic formatting heuristics
    warnings = []
    if not emails:
        warnings.append('Missing email address')
    if not phones:
        warnings.append('Missing phone number')
    section_names = [s.lower() for s in sections]
    if 'experience' not in section_names:
        warnings.append('Experience section not detected')
    if 'skills' not in section_names and not skills_found:
        warnings.append('Skills section missing or skills not detected')

    fmt_warnings, fmt_penalty = _formatting_warnings(text, norm_text)
    warnings.extend(fmt_warnings)

    experience_score = _experience_quality_score(text, section_names)
    education_score = _education_quality_score(text, section_names)
    contact_score = _contact_quality_score(emails, phones)

    # Score-like outputs
    required_sections = {"summary", "experience", "education", "skills"}
    section_score = round((len(required_sections.intersection(set(section_names))) / len(required_sections)) * 100)
    keyword_score = keyword_match_ratio
    formatting_score = max(0, 100 - (len(warnings) * 8) - fmt_penalty)

    if jd_keywords:
        ats_score = round(
            (keyword_score * 0.40)
            + (section_score * 0.20)
            + (formatting_score * 0.15)
            + (experience_score * 0.15)
            + (education_score * 0.05)
            + (contact_score * 0.05)
        )
    else:
        ats_score = round(
            (keyword_score * 0.25)
            + (section_score * 0.30)
            + (formatting_score * 0.20)
            + (experience_score * 0.15)
            + (education_score * 0.05)
            + (contact_score * 0.05)
        )

    # Mild penalties to keep the score stable and conservative.
    if not emails:
        ats_score -= 8
    if not phones:
        ats_score -= 8
    if "experience" not in section_names:
        ats_score -= 6
    if "skills" not in section_names and not skills_found:
        ats_score -= 5

    ats_score = max(15, min(96, ats_score))

    recommendations = []
    if jd_keywords and missing_keywords:
        recommendations.append(
            "Add these job-specific keywords naturally in projects/experience: " + ", ".join(missing_keywords[:8])
        )
    elif not jd_keywords and missing_keywords:
        recommendations.append(
            f"Add missing keywords matching current 2026 {role_name} trends: " + ", ".join(missing_keywords[:8])
        )
    if "experience" not in section_names:
        recommendations.append("Add a clear 'Experience' section heading with bullet points and measurable impact")
    if "skills" not in section_names:
        recommendations.append("Add a dedicated 'Skills' section grouped by tools/technologies")
    if not phones or not emails:
        recommendations.append("Keep contact details in plain text at top (name, email, phone, location)")
    if not jd_keywords:
        recommendations.append("For role-specific accuracy, paste the full target Job Description")

    report['contact'] = {
        'emails': emails,
        'phones': phones,
        'contactPresent': bool(emails or phones)
    }
    report['sections'] = sections
    report['skillsFound'] = skills_found
    report['keywordMatchPercent'] = keyword_match_ratio
    report['formatWarnings'] = warnings
    report['atsScore'] = ats_score
    report['matchedKeywords'] = sorted(list(set(matched_keywords)))
    report['missingKeywords'] = missing_keywords[:20]
    report['sectionScore'] = section_score
    report['keywordScore'] = keyword_score
    report['formattingScore'] = formatting_score
    report['experienceScore'] = experience_score
    report['educationScore'] = education_score
    report['contactScore'] = contact_score
    report['recommendations'] = recommendations[:5]
    report['jobDescriptionUsed'] = bool(jd_keywords)
    report['scanMode'] = 'jd_strict' if jd_keywords else 'generic_quality'
    report['roleName'] = role_name

    return report
