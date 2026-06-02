from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
try:
    from api.routes import analyze, improve, chat
except ImportError:
    try:
        from .routes import analyze, improve, chat
    except ImportError:
        from routes import analyze, improve, chat
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Analyze resumes with AI, get improvement suggestions, and chat with your personal resume coach",
    version="1.0.0"
)

# Add CORS middleware
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    # Vite may pick 5174 if 5173 is in use
    "http://localhost:3000",
    "https://ai-resume-bice-five.vercel.app",
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api")
app.include_router(improve.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Resume Analyzer API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}


@app.get("/version")
async def version():
    """Version endpoint to verify deployments"""
    return {
        "version": "1.1.3",
        "commit": "security-and-ai-fallback-fixes",
        "deployed_at": "2026-06-01"
    }


@app.get("/api/list-models")
async def list_models(x_gemini_api_key: str = Header(default=None, alias="X-Gemini-API-Key")):
    import google.generativeai as genai
    try:
        from api.utils.ai_client import get_gemini_key
    except ImportError:
        try:
            from .utils.ai_client import get_gemini_key
        except ImportError:
            from utils.ai_client import get_gemini_key
    key = get_gemini_key(x_gemini_api_key)
    if not key:
        return {"error": "No API key found"}
    try:
        genai.configure(api_key=key)
        models = [m.name for m in genai.list_models()]
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

