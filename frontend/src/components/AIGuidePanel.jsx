import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react'

export const AIGuidePanel = ({ resumeContext }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const suggestedQuestions = [
    'How do I improve my summary?',
    'What keywords am I missing?',
    'Rewrite my latest job bullet point',
    'What skills should I add?',
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText = inputValue) => {
    const trimmedMessage = messageText.trim()
    if (!trimmedMessage) return

    const userMessage = { role: 'user', content: trimmedMessage }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            resumeContext,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            assistantMessage += data
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1].content = assistantMessage
              return updated
            })
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
    handleSendMessage(question)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-violet) 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
          zIndex: 1000,
        }}
        className="pulse-glow"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat panel drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1001,
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', damping: 26, stiffness: 170 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '420px',
                maxWidth: '100%',
                background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1002,
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16.5px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)' }}>
                      AI Resume Coach
                    </h2>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online • Ask anything to optimize</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(34, 211, 238, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        marginBottom: '16px',
                      }}
                    >
                      <Sparkles size={24} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
                      Hello! I'm your interactive resume guide. Select one of the quick optimization questions below to start scanning:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                      {suggestedQuestions.map((q, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02, borderColor: 'var(--accent-cyan)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickQuestion(q)}
                          className="capsule-pill capsule-pill-general"
                          style={{
                            padding: '12px 16px',
                            fontSize: '13.5px',
                            cursor: 'pointer',
                            justifyContent: 'flex-start',
                            width: '100%',
                            textAlign: 'left',
                            background: 'rgba(255, 255, 255, 0.01)',
                          }}
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          display: 'flex',
                          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            fontSize: '13.5px',
                            lineHeight: '1.5',
                            background:
                              msg.role === 'user'
                                ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-violet) 100%)'
                                : 'rgba(255, 255, 255, 0.02)',
                            color:
                              msg.role === 'user'
                                ? 'white'
                                : 'var(--text-primary)',
                            border:
                              msg.role === 'user'
                                ? 'none'
                                : '1px solid var(--border)',
                            boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none',
                          }}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', paddingLeft: '8px' }}>
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent-cyan)',
                            animation: 'pulse-glow 1s infinite',
                          }}
                        />
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent-cyan)',
                            animation: 'pulse-glow 1s infinite 0.2s',
                          }}
                        />
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent-cyan)',
                            animation: 'pulse-glow 1s infinite 0.4s',
                          }}
                        />
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Bar */}
              <div
                style={{
                  padding: '20px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.1)',
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask for resume optimization tips..."
                  disabled={isLoading}
                  className="input-cyber"
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    fontSize: '13.5px',
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  style={{
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'white',
                    padding: '0 16px',
                    borderRadius: '10px',
                    cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIGuidePanel
