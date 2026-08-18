import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function ChatbotWorkspace() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello. I am MedVision, your secure health assistant. I can help interpret your recent skin scan results or answer general health questions. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestedPrompts = [
    'What does my result mean?',
    'Should I see a doctor?',
    'How do I take a good photo?'
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = ''
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const response = await api.post('/chat/message', {
        message: message.trim(),
        history: messages
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response || 'I apologize, I could not process that request.',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="flex items-center justify-between px-md py-lg bg-surface z-10 border-b border-surface-variant">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-[48px] h-[48px] rounded-full text-primary active:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-headline-lg">arrow_back</span>
        </button>
        <h1 className="font-headline text-headline-lg text-on-surface">Ask MedVision</h1>
        <div className="w-[48px] h-[48px]"></div> {/* Spacer */}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-md py-md flex flex-col gap-lg pb-[180px]">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-sm py-xs rounded-full">
            Today
          </span>
        </div>

        {/* Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col gap-xs ${
              message.role === 'user' ? 'items-end self-end' : 'items-start'
            } max-w-[85%]`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-end gap-sm">
                <div className="w-[32px] h-[32px] rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">
                    visibility
                  </span>
                </div>
                <div className="bg-surface-container-lowest text-on-surface p-md rounded-2xl border border-surface-variant rounded-bl-none shadow-sm">
                  <p className="font-body-md text-body-md">{message.content}</p>
                </div>
              </div>
            )}
            {message.role === 'user' && (
              <div className="bg-primary-container text-on-primary p-md rounded-2xl rounded-br-none shadow-sm">
                <p className="font-body-md text-body-md">{message.content}</p>
              </div>
            )}
            <span
              className={`font-body-sm text-body-sm text-on-surface-variant ${
                message.role === 'assistant' ? 'pl-[44px]' : 'pr-xs'
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start gap-xs max-w-[85%]">
            <div className="flex items-end gap-sm">
              <div className="w-[32px] h-[32px] rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">
                  visibility
                </span>
              </div>
              <div className="bg-surface-container-lowest text-on-surface p-md rounded-2xl border border-surface-variant rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-variant px-md py-md pb-safe z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] max-w-[640px] mx-auto">
        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="flex gap-sm overflow-x-auto pb-md hide-scrollbar">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="flex items-center h-[44px] px-md rounded-full bg-surface border border-outline-variant text-on-surface font-label-md text-label-md whitespace-nowrap flex-shrink-0 active:bg-surface-variant transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-end gap-sm">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type your question here..."
              rows={1}
              className="w-full bg-surface text-on-surface font-body-md text-body-md rounded-xl border border-outline-variant p-sm min-h-[48px] max-h-[120px] resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all overflow-hidden"
              disabled={loading}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="w-[48px] h-[48px] rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 active:bg-[#004d47] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[24px]">send</span>
          </button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
