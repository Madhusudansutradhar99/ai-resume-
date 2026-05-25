# 🚀 AI Resume Analyzer — Production-Ready Application

A complete, full-stack web application that analyzes resumes using AI, provides detailed scoring, and offers personalized improvement suggestions with streaming chat coaching.

## ✨ Features

- **📄 AI-Powered Resume Analysis**: Analyzes your resume against ATS (Applicant Tracking System) standards
- **🎯 Detailed Scoring**: Get comprehensive scoring across 5 categories:
  - Format & ATS Structure
  - Keywords & Skills Match
  - Work Experience Quality
  - Education & Certifications
  - Overall Readability
- **🛣️ Improvement Roadmap**: Get a 3-phase actionable roadmap to improve your resume
- **✏️ Resume Editor**: Edit and refine your resume with AI improvement suggestions
- **💬 AI Coach Panel**: Chat with an AI resume coach for personalized guidance (streaming responses)
- **📥 Download Resume**: Export your edited resume as a plain text file
- **💾 Local Storage**: Automatically saves your last analysis
- **🎨 Dark-Themed UI**: Beautiful glassmorphism design with Framer Motion animations
- **📱 Responsive**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **React Dropzone** — File upload
- **Axios** — HTTP client
- **Lucide React** — Icons
- **Google Fonts** — Syne, DM Sans, JetBrains Mono

### Backend
- **Python 3.11+** — Language
- **FastAPI** — Web framework
- **Uvicorn** — ASGI server
- **Anthropic SDK** — Claude AI integration
- **PyMuPDF (fitz)** — PDF extraction
- **python-docx** — DOCX extraction
- **Pydantic v2** — Data validation
- **python-multipart** — File upload handling

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- Anthropic API Key (get from https://console.anthropic.com)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Anthropic API Key
# Edit .env and add: ANTHROPIC_API_KEY=your_key_here

# Start server
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

API documentation at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🚀 Usage

1. **Upload Resume**: Navigate to http://localhost:5173 and upload a PDF or DOCX file
2. **(Optional) Add Job Description**: Paste a job description for more targeted analysis
3. **View Analysis**: Get your score, category breakdown, strengths, and weaknesses
4. **Review Roadmap**: See a 3-phase improvement plan
5. **Edit Resume**: Switch to edit mode to refine your resume
6. **Get AI Coaching**: Click the "Ask AI ✨" button for personalized guidance
7. **Download**: Export your improved resume as a text file

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── analyze.py           # Resume analysis endpoint
│   │   ├── improve.py           # Section improvement endpoint
│   │   └── chat.py              # Streaming chat endpoint
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── models.py            # Pydantic data models
│   │   ├── pdf_parser.py        # PDF/DOCX extraction
│   │   └── ai_prompts.py        # Claude prompt templates
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Main app component
│   │   ├── api.js               # API client
│   │   ├── index.css            # Global styles
│   │   └── components/
│   │       ├── UploadZone.jsx       # File upload interface
│   │       ├── Loader.jsx           # Loading animation
│   │       ├── ScoreCard.jsx        # Score display
│   │       ├── ImprovementRoadmap.jsx # Roadmap timeline
│   │       ├── ResumeEditor.jsx     # Resume editor
│   │       ├── AIGuidePanel.jsx     # Chat panel
│   │       └── Toast.jsx            # Notifications
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔌 API Endpoints

### POST `/api/analyze`
Analyze a resume file.

**Request:**
```
Content-Type: multipart/form-data
- resume: File (PDF or DOCX, max 5MB)
- jobDescription: string (optional)
```

**Response:**
```json
{
  "overallScore": 78,
  "categories": {
    "formatStructure": 85,
    "keywordsMatch": 72,
    "experienceQuality": 80,
    "educationCerts": 75,
    "readability": 77
  },
  "roadmap": {
    "phase1": ["Quick win 1", "Quick win 2"],
    "phase2": ["Medium effort 1"],
    "phase3": ["Long term 1"]
  },
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "estimatedImprovement": 12,
  "summary": "Your resume...",
  "parsedText": "Full resume text..."
}
```

### POST `/api/improve-section`
Improve a specific resume section.

**Request:**
```json
{
  "section": "professionalSummary",
  "content": "Original content...",
  "jobTitle": "Software Engineer"
}
```

**Response:**
```json
{
  "improved": "Improved content...",
  "explanation": "What changed and why..."
}
```

### POST `/api/chat` (Server-Sent Events)
Stream chat responses for resume coaching.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "How do I improve?"}
  ],
  "resumeContext": "Your resume text..."
}
```

**Response:** Streaming text via Server-Sent Events (SSE)

## 🎨 UI/UX Design System

### Colors
- **Primary Background**: `#050508`
- **Secondary Background**: `#0d0d14`
- **Accent (Indigo)**: `#6366f1`
- **Accent (Cyan)**: `#22d3ee`
- **Accent (Violet)**: `#a78bfa`
- **Text Primary**: `#f1f5f9`
- **Text Muted**: `#64748b`

### Fonts
- **Headings**: Syne (bold, futuristic)
- **Body**: DM Sans
- **Code**: JetBrains Mono

### Visual Effects
- Animated gradient blob backgrounds
- Glassmorphism cards with blur and transparency
- Glowing borders on hover
- Smooth Framer Motion animations
- Dot-grid pattern overlay

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

## 📊 AI Model Configuration

- **Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Max Tokens**: 2000 (analysis), 1000 (improvements/chat)
- **Context Window**: 200K tokens

## 🧪 Testing Checklist

- [ ] Backend starts: `uvicorn main:app --reload`
- [ ] Frontend starts: `npm run dev`
- [ ] PDF upload works and extracts text
- [ ] DOCX upload works and extracts text
- [ ] File size validation (5MB limit) works
- [ ] Score ring animates correctly
- [ ] All 5 category bars animate
- [ ] Roadmap phases render with staggered animations
- [ ] AI Improve button shows diff view modal
- [ ] Chat panel opens and streams responses
- [ ] Download button generates and downloads resume
- [ ] LocalStorage saves and loads analysis
- [ ] Mobile responsive at 375px width
- [ ] No console errors or warnings

## 🚨 Common Issues & Solutions

### Backend Connection Error
**Issue**: `Failed to fetch` or `Connection refused`
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in `main.py`

### PDF Extraction Fails
**Issue**: "Could not extract text from PDF"
- Ensure PDF is text-based, not scanned image
- Check file is not corrupted
- Max file size is 5MB

### AI API Error
**Issue**: "Error: 401 Unauthorized"
- Verify `ANTHROPIC_API_KEY` is set in backend `.env`
- Check key has correct permissions at https://console.anthropic.com

### Out of Memory
**Issue**: Large PDFs cause errors
- Limit file upload to 5MB
- Consider streaming large documents

## 📈 Performance Optimization

- Lazy load components with React.lazy()
- Memoize expensive computations
- Optimize bundle size: `npm run build`
- Use production API URL in deployment
- Enable gzip compression on server

## 🔒 Security Considerations

- CORS configured for localhost only
- File upload limited to 5MB
- Sanitize user input in chat
- API key stored in backend .env only
- Rate limiting recommended in production

## 📝 File Upload Specifications

**Supported Formats:**
- PDF (.pdf)
- Word Documents (.docx)

**Limits:**
- Max file size: 5MB
- Minimum text content: 100 characters
- Maximum resume length: ~50KB

## 🚀 Deployment

### Deploy Backend (Python)
```bash
# Using Heroku
heroku create your-app-name
git push heroku main

# Using Railway
railway up

# Using Replit
Upload to Replit and set environment variables
```

### Deploy Frontend (React)
```bash
# Using Vercel
npm install -g vercel
vercel

# Using Netlify
npm run build
netlify deploy --prod --dir=dist
```

## 📞 Support & Troubleshooting

1. Check backend logs: Terminal where `uvicorn` is running
2. Check frontend logs: Browser DevTools Console
3. Verify API endpoints: http://localhost:8000/docs
4. Clear browser cache: Ctrl+Shift+Delete
5. Clear localStorage: Browser DevTools > Application > Local Storage

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- [ ] Multi-language support
- [ ] LinkedIn profile import
- [ ] Real-time collaboration
- [ ] Resume template library
- [ ] Job matching algorithm
- [ ] Interview preparation mode
- [ ] PDF export with formatting
- [ ] Analytics dashboard
- [ ] Email integration
- [ ] Mobile app (React Native)

---

**Built with ❤️ using FastAPI, React, and Claude AI**

Enjoy improving your resume! 🚀
