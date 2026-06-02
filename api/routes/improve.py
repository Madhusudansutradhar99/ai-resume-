import json
from fastapi import APIRouter, HTTPException, Header
from utils.ai_prompts import IMPROVE_SECTION_PROMPT
from utils.models import ImproveSectionRequest, ImproveSectionResponse
from utils.ai_client import call_ai

router = APIRouter()


def _improve_section_locally(section: str, content: str, job_title: str) -> dict:
    section_lower = section.lower()
    job_lower = job_title.lower()
    
    # Select keywords based on role
    keywords = ["Git", "SQL", "Docker", "APIs"]
    if any(k in job_lower for k in ["front", "react", "web", "ui"]):
        keywords = ["React 19", "TypeScript", "Next.js", "Vite", "Tailwind CSS"]
    elif any(k in job_lower for k in ["back", "api", "node", "django", "server", "python"]):
        keywords = ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "REST APIs"]
    elif any(k in job_lower for k in ["devops", "cloud", "aws", "kubernetes"]):
        keywords = ["Kubernetes", "AWS Cloud", "CI/CD Pipelines", "Terraform", "GitHub Actions"]
    elif any(k in job_lower for k in ["data", "ml", "machine"]):
        keywords = ["Python", "Pandas", "PyTorch", "Machine Learning", "SQL Databases"]
    elif any(k in job_lower for k in ["mobile", "flutter", "swift"]):
        keywords = ["Flutter", "React Native", "Swift", "Kotlin", "Mobile UI"]
        
    if "summary" in section_lower or "profile" in section_lower:
        improved = (
            f"Result-oriented {job_title} with a proven track record of engineering high-performance systems. "
            f"Adept at leveraging {', '.join(keywords[:3])} to build scalable solutions, optimize performance, "
            f"and drive business efficiency. Collaborative professional focused on delivering clean, maintainable code "
            f"and robust system architectures."
        )
        explanation = "Enhanced summary to highlight target role title, core technical stacks, and professional delivery focus."
    else:
        # Process as lines/bullets
        lines = [line.strip().lstrip("•-* ").strip() for line in content.split("\n") if line.strip()]
        
        verbs = ["Spearheaded", "Optimized", "Architected", "Engineered", "Formulated", "Overhauled", "Designed", "Streamlined"]
        metrics = [
            "improving application responsiveness by 24%",
            "reducing server response times by 35%",
            "boosting team operational efficiency by 15%",
            "scaling platform infrastructure to handle over 15k active users",
            "cutting API deployment errors by 40%",
            "minimizing build bundle size by 30% using Vite"
        ]
        
        improved_bullets = []
        for i, line in enumerate(lines):
            bullet = line.strip()
            
            # Handle "responsible for" prefix
            if bullet.lower().startswith("responsible for "):
                bullet = bullet[len("responsible for "):].strip()
                
            # Convert gerunds to past tense
            words_list = bullet.split()
            if words_list:
                first_word = words_list[0].lower()
                gerund_map = {
                    "managing": "managed",
                    "setting": "set",
                    "developing": "developed",
                    "building": "built",
                    "creating": "created",
                    "optimizing": "optimized",
                    "designing": "designed",
                    "leading": "led",
                    "helping": "helped",
                    "testing": "tested",
                    "configuring": "configured",
                    "writing": "wrote",
                    "improving": "improved",
                    "maintaining": "maintained",
                    "implementing": "implemented"
                }
                if first_word in gerund_map:
                    words_list[0] = gerund_map[first_word]
                    bullet = " ".join(words_list)
                    if bullet:
                        bullet = bullet[0].upper() + bullet[1:]
            
            # Clean trailing periods to avoid double punctuation e.g. "servers., resulting in"
            if bullet.endswith("."):
                bullet = bullet[:-1].strip()
                
            # Check if line already has action verb
            has_verb = any(bullet.lower().startswith(v.lower()) for v in verbs + ["developed", "implemented", "managed", "built", "led", "assisted", "helped"])
            
            # Add action verb if missing
            if not has_verb:
                verb = verbs[i % len(verbs)]
                if bullet and bullet[0].isupper():
                    bullet = bullet[0].lower() + bullet[1:]
                bullet = f"{verb} {bullet}"
                
            # Add metric if no number is present
            has_number = any(char.isdigit() for char in bullet)
            if not has_number:
                metric = metrics[i % len(metrics)]
                bullet = f"{bullet}, resulting in {metric}"
                
            # Inject key technology if appropriate
            if not any(k.lower() in bullet.lower() for k in keywords):
                tech = keywords[i % len(keywords)]
                bullet = f"{bullet} utilizing {tech}"
                
            # Ensure ending period
            if not bullet.endswith("."):
                bullet = bullet + "."
                
            improved_bullets.append(f"• {bullet}")
            
        if not improved_bullets:
            improved = f"• Spearheaded deployment of core features, reducing latency by 20% utilizing {keywords[0]}."
        else:
            improved = "\n".join(improved_bullets)
            
        explanation = f"Reconstructed experience bullets with action-oriented leadership verbs, measurable metrics, and key {job_title} technologies."
        
    return {
        "improved": improved,
        "explanation": explanation
    }


@router.post("/improve-section", response_model=ImproveSectionResponse)
async def improve_section(
    req: ImproveSectionRequest,
    x_gemini_api_key: str = Header(default=None, alias="X-Gemini-API-Key"),
    x_github_token: str = Header(default=None, alias="X-GitHub-Token")
):
    """
    Improve a specific section of a resume using AI.
    
    Takes a section name, content, and optional job title.
    Returns improved content and explanation of changes.
    """
    
    if not req.content or len(req.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    # Prepare prompt
    prompt = IMPROVE_SECTION_PROMPT.format(
        job_title=req.jobTitle if req.jobTitle else "relevant",
        section=req.section,
        content=req.content
    )
    
    # Call AI API
    use_fallback = False
    response_text = ""
    try:
        response_text = call_ai(prompt, max_tokens=1000, api_key=x_gemini_api_key, github_token=x_github_token)
    except Exception as e:
        print(f"AI API failed inside improve_section, running local rewriter: {str(e)}")
        use_fallback = True
        
    if not use_fallback:
        # Parse response
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            result = json.loads(response_text.strip())
            return ImproveSectionResponse(**result)
        except Exception as e:
            print(f"JSON Parsing failed inside improve_section: {str(e)}")
            use_fallback = True
            
    if use_fallback:
        result = _improve_section_locally(req.section, req.content, req.jobTitle if req.jobTitle else "Software Engineer")
        return ImproveSectionResponse(**result)

