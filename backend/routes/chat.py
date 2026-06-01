import os
import urllib.request
import json
import google.generativeai as genai
from fastapi import APIRouter, Header
from fastapi.responses import StreamingResponse
from anthropic import Anthropic
from utils.models import ChatRequest
from utils.ai_client import get_gemini_key, get_anthropic_key

router = APIRouter()


def _get_local_coach_response(user_message: str, resume_context: str) -> str:
    msg = user_message.lower()
    ctx = (resume_context or "").lower()
    
    # Detect role from resume context
    role = "Software Engineer"
    if any(k in ctx for k in ["docker", "kubernetes", "k8s", "devops", "jenkins", "ci/cd", "terraform", "ansible", "aws", "gcp", "azure"]):
        role = "DevOps Engineer"
    elif any(k in ctx for k in ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit", "artificial intelligence", "data scientist"]):
        role = "Data Scientist / ML Engineer"
    elif any(k in ctx for k in ["data analyst", "pandas", "numpy", "power bi", "tableau", "analytics"]):
        role = "Data Analyst"
    elif any(k in ctx for k in ["flutter", "react native", "swift", "kotlin", "mobile developer"]):
        role = "Mobile App Developer"
    elif any(k in ctx for k in ["cybersecurity", "security analyst", "penetration testing", "firewalls"]):
        role = "Cybersecurity Analyst"
    elif any(k in ctx for k in ["selenium", "cypress", "qa engineer", "software tester"]):
        role = "QA Automation Engineer"
    elif any(k in ctx for k in ["product manager", "project manager", "scrum", "agile"]):
        role = "Product Manager"
    elif any(k in ctx for k in ["react", "frontend", "html", "css", "vite", "javascript", "typescript"]):
        role = "Frontend Developer"
    elif any(k in ctx for k in ["api", "backend", "server", "fastapi", "django", "flask", "node", "sql"]):
        role = "Backend Developer"

    # Define response content
    if any(k in msg for k in ["score", "ats", "points", "calculate"]):
        return (
            "### 📊 How Your ATS Score is Calculated\n\n"
            "Your overall score is calculated based on four key pillars of ATS compatibility:\n\n"
            "1. **Keyword Match (40-55% weight)**: Compares your resume against modern 2026 role requirements (or the provided job description). It checks for technical skills, languages, and tools.\n"
            "2. **Structure & Sections (25-35% weight)**: Checks if standard sections like *Experience*, *Education*, *Skills*, and *Summary* are detected with proper headings.\n"
            "3. **Formatting & Readability (20-25% weight)**: Flags problematic layouts like complex tables, icons, graphics, text boxes, or files with poor line-break extraction.\n"
            "4. **Contact Essentials (Hard Gate)**: Missing emails or phone numbers will automatically cap your score at a maximum of **72/100**, as recruiters cannot contact you.\n\n"
            "**Action Item**: Add missing keywords from the scan and ensure your contact details are in plain text near the header."
        )
    elif any(k in msg for k in ["project", "portfolio", "showcase", "build"]):
        project_ideas = {
            "DevOps Engineer": (
                "**1. Multi-Stage GitOps CI/CD Pipeline**\n"
                "- *Tech Stack*: GitHub Actions, ArgoCD, Kubernetes (EKS), Terraform, Helm.\n"
                "- *Details*: Deploy a microservices app with automated staging promotion, vulnerability scanning (Trivy), and Prometheus monitoring."
            ),
            "Data Scientist / ML Engineer": (
                "**1. Real-Time MLOps Inference Service**\n"
                "- *Tech Stack*: FastAPI, PyTorch, Docker, MLflow, AWS EC2.\n"
                "- *Details*: Containerize a BERT or ResNet inference API, set up structured request logging, and build a dashboard tracking latency and model drift."
            ),
            "Data Analyst": (
                "**1. Interactive Executive Performance Dashboard**\n"
                "- *Tech Stack*: SQL (PostgreSQL), Python (Pandas), Tableau/Power BI.\n"
                "- *Details*: Clean a messy retail or finance dataset, construct relational tables, write optimized views, and design a dashboard visualizing revenue trends and user retention."
            ),
            "Mobile App Developer": (
                "**1. Cross-Platform Offline-First E-Commerce App**\n"
                "- *Tech Stack*: Flutter or React Native, Supabase/Firebase, SQLite (Hive).\n"
                "- *Details*: Features offline cart synchronization, push notifications, and integrated mock payment gateways."
            ),
            "Cybersecurity Analyst": (
                "**1. Automated Vulnerability Auditing Tool**\n"
                "- *Tech Stack*: Python, Linux, Nmap API, Docker.\n"
                "- *Details*: Write a script that scans specific IP ranges, checks against CVE databases, and generates HTML risk reports."
            ),
            "QA Automation Engineer": (
                "**1. End-to-End Testing Suite with CI Integration**\n"
                "- *Tech Stack*: Cypress or Playwright, TypeScript, GitHub Actions.\n"
                "- *Details*: Write automated tests for complex user flows (authentication, forms, checkout) and configure it to block pull requests on failure."
            ),
            "Product Manager": (
                "**1. PRD & High-Fidelity Interactive Wireframes**\n"
                "- *Tech Stack*: Figma, Jira, Whimsical.\n"
                "- *Details*: Build a comprehensive Product Requirement Document for a SaaS tool, mapping user personas, epic details, and interactive layout flows."
            ),
            "Full Stack Developer": (
                "**1. Collaborative Workspace Hub (SaaS App)**\n"
                "- *Tech Stack*: React 19, Node.js, WebSockets, PostgreSQL, Tailwind.\n"
                "- *Details*: Implement real-time document editing, workspace invitations, role-based access, and Stripe subscription mock-ups."
            ),
            "Frontend Developer": (
                "**1. High-Performance Dashboard App**\n"
                "- *Tech Stack*: Next.js (App Router), TypeScript, Tailwind CSS, Recharts.\n"
                "- *Details*: Create an analytics panel optimized for accessibility (WCAG), featuring responsive sidebars, theme swaps, and instant mock charts."
            ),
            "Backend Developer": (
                "**1. Scalable Task Queue & API Gateway**\n"
                "- *Tech Stack*: FastAPI, Celery, Redis, PostgreSQL.\n"
                "- *Details*: Build rate-limiting endpoints, user auth (JWT), and background email workers using Redis queues."
            ),
            "Software Engineer": (
                "**1. Relational Database API Service**\n"
                "- *Tech Stack*: Python, SQLite, Flask, Git.\n"
                "- *Details*: Implement structured REST endpoints with complete validation, unit test coverage, and Docker deployment configurations."
            )
        }
        
        idea = project_ideas.get(role, project_ideas["Software Engineer"])
        return (
            f"### 🚀 Recommended Project for a {role} Role\n\n"
            f"To boost your resume's impact, I recommend building the following project and adding it to your projects section:\n\n"
            f"{idea}\n\n"
            f"**ATS Tip**: List this project on your resume under a dedicated section, clearly specifying the technology stack in the header and using action-packed bullets to describe what you engineered."
        )
    elif any(k in msg for k in ["skill", "keyword", "missing", "trend"]):
        return (
            f"### 🌐 2026 Skills and Keyword Recommendations for {role}\n\n"
            f"According to current 2026 hiring trends, here are key skills you should ensure are highlighted on your resume:\n\n"
            f"1. **Core Language Proficiency**: Deep knowledge in main stacks (e.g. TypeScript/Python).\n"
            f"2. **Frameworks & Orchestration**: Shift from traditional tools to high-performance engines (e.g. Next.js, FastAPI, Docker).\n"
            f"3. **Version Control & Collaboration**: Git branching workflows, CI/CD integration, and testing framework coverage.\n\n"
            f"**Reviewing your scan**: Look at the **Missing Keywords** list in the ATS Report tab. Adding those specific terms naturally inside your experience and project descriptions will immediately increase your keyword score!"
        )
    elif any(k in msg for k in ["experience", "verb", "metric", "bullet", "rewrite", "write"]):
        return (
            "### ✍️ Writing ATS-Optimized Bullet Points\n\n"
            "ATS systems and hiring managers look for **measurable achievements**, not just job responsibilities. Use the **XYZ formula** (Accomplished [X] as measured by [Y], by doing [Z]).\n\n"
            "Here are three examples of how to rewrite generic lines:\n\n"
            "*   **Before**: *Responsible for maintaining the backend API.*\n"
            "    **After**: **Engineered** critical backend FastAPI services, **reducing database query latency by 32%** through optimized indexing and caching.\n"
            "*   **Before**: *Worked on frontend bugs and updated UI components.*\n"
            "    **After**: **Refactored** React components to TypeScript, **reducing component build size by 28%** and improving accessibility compliance.\n"
            "*   **Before**: *Helped team with deployment issues.*\n"
            "    **After**: **Spearheaded** automated GitHub Actions CI/CD pipelines, **cutting deployment errors by 40%** and reducing shipping time.\n\n"
            "**Action**: Open the **Live Resume Optimizer** tab, select your experience section, and click **Improve with AI** to get customized rewrites!"
        )
    elif any(k in msg for k in ["interview", "question", "prep", "ask"]):
        return (
            f"### 🎯 Interview Preparation Guide for a {role} Role\n\n"
            f"When preparing for interviews, focus on these three core areas:\n\n"
            f"1. **Technical Deep Dive**: Be ready to explain the inner workings of tools on your resume (e.g. state management in React, index types in Postgres, or container routing in Docker).\n"
            f"2. **System Architecture**: Study standard patterns—API gateways, caching strategies, horizontal scaling, and microservices integration.\n"
            f"3. **Behavioral Questions**: Practice the **STAR method** (Situation, Task, Action, Result) to describe how you solved technical debt or resolved team conflicts.\n\n"
            f"**Common Question**: *'Explain a technical challenge you faced in your last project and how you went about resolving it.'* (Highlight your design choices and quantitative outcomes!)"
        )
    else:
        return (
            f"### 🤖 Live Career Coach (Local Mode)\n\n"
            f"Welcome! I have analyzed your resume context and detected your target field as **{role}**.\n\n"
            f"How can I help you take your career to the next level? Here are a few topics we can discuss:\n"
            f"- 📊 *'Explain how my ATS score is calculated.'*\n"
            f"- 🚀 *'Suggest a portfolio project to add to my resume.'*\n"
            f"- 🌐 *'What are the key technology trends for my role in 2026?'*\n"
            f"- ✍️ *'Show me examples of how to rewrite my experience bullets.'*\n"
            f"- 🎯 *'Give me interview preparation tips and questions.'*\n\n"
            f"Feel free to ask me any of these questions, or let me know what specific questions you have about your resume!"
        )


@router.post("/chat")
async def chat(
    req: ChatRequest,
    x_gemini_api_key: str = Header(default=None, alias="X-Gemini-API-Key"),
    x_github_token: str = Header(default=None, alias="X-GitHub-Token")
):
    """
    Stream chat responses for resume coaching.
    
    Uses Server-Sent Events (SSE) to stream response text word by word.
    Includes resume context in system prompt for better guidance.
    """
    
    system_prompt = f"""You are an expert resume coach and career advisor with experience at top tech companies.
You are helping the user improve their resume and career prospects.
Be specific, actionable, encouraging, and professional.
Provide concrete suggestions with examples when possible.
 
USER'S RESUME CONTEXT (for reference):
{req.resumeContext[:3000] if req.resumeContext else "No resume provided yet"}"""

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    def generate():
        """Generator function for streaming response"""
        gemini_key = x_gemini_api_key or get_gemini_key()
        if gemini_key:
            try:
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel(
                    model_name="gemini-flash-latest",
                    system_instruction=system_prompt
                )
                
                # Format messages for Gemini
                contents = []
                for m in messages:
                    role = "user" if m["role"] == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": m["content"]}]})
                
                response = model.generate_content(contents, stream=True)
                for chunk in response:
                    try:
                        text = chunk.text
                        if text:
                            yield f"data: {text}\n\n"
                    except Exception:
                        pass
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                print(f"Gemini chat streaming failed: {str(e)}")

        anthropic_key = get_anthropic_key()
        if anthropic_key:
            try:
                claude_client = Anthropic(api_key=anthropic_key)
                with claude_client.messages.stream(
                    model="claude-3-5-sonnet-latest",
                    max_tokens=1000,
                    system=system_prompt,
                    messages=messages
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {text}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"
                yield "data: [DONE]\n\n"
                return

        # Fallback to GitHub Models (free tier using local GitHub credentials)
        try:
            from utils.ai_client import get_github_token
            github_token = get_github_token(x_github_token)
            if github_token:
                print("Attempting chatbot streaming via GitHub Models...")
                url = "https://models.inference.ai.azure.com/chat/completions"
                
                chat_messages = []
                chat_messages.append({"role": "system", "content": system_prompt})
                for m in messages:
                    chat_messages.append({"role": m["role"], "content": m["content"]})
                    
                data = {
                    "messages": chat_messages,
                    "model": "gpt-4o-mini",
                    "max_tokens": 1000,
                    "stream": True
                }
                
                req_obj = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {github_token}"
                    },
                    method="POST"
                )
                
                with urllib.request.urlopen(req_obj, timeout=15) as response:
                    buffer = ""
                    for chunk in response:
                        buffer += chunk.decode("utf-8")
                        while "\n" in buffer:
                            line, buffer = buffer.split("\n", 1)
                            line = line.strip()
                            if not line:
                                continue
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_str)
                                    text = data_json["choices"][0]["delta"].get("content", "")
                                    if text:
                                        yield f"data: {text}\n\n"
                                except Exception:
                                    pass
                yield "data: [DONE]\n\n"
                return
        except Exception as e:
            print(f"GitHub Models streaming failed: {str(e)}")

        # Local coach response fallback
        import time
        local_response = _get_local_coach_response(messages[-1]["content"] if messages else "", req.resumeContext)
        words = local_response.split(" ")
        for i in range(0, len(words), 2):
            chunk = " ".join(words[i:i+2]) + " "
            yield f"data: {chunk}\n\n"
            time.sleep(0.02)
        yield "data: [DONE]\n\n"
        return

    return StreamingResponse(generate(), media_type="text/event-stream")

