import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Inject custom Gemini API key if present in localStorage
api.interceptors.request.use((config) => {
  const customKey = localStorage.getItem('custom_gemini_api_key')
  if (customKey) {
    config.headers['X-Gemini-API-Key'] = customKey
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export const analyzeResume = async (file, jobDescription = '') => {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('jobDescription', jobDescription)

  const response = await api.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const improveSection = async (section, content, jobTitle = 'Software Engineer') => {
  const response = await api.post('/api/improve-section', {
    section,
    content,
    jobTitle,
  })
  return response.data
}

export const chatWithCoach = async (messages, resumeContext = '') => {
  const response = await api.post('/api/chat', {
    messages,
    resumeContext,
  }, {
    responseType: 'stream',
  })
  return response.data
}

export const scanAtsDirect = async (resumeText, jobDescription = '') => {
  const response = await api.post('/api/scan-ats-direct', {
    resumeText,
    jobDescription,
  })
  return response.data
}

export default api

