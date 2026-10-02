import React, { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import { SceneState } from '../types'

interface AIAssistantModalProps {
  scene: SceneState
  selectedFloat?: any
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ scene, selectedFloat }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 Hello! I am the **NeerDrishti AI Oceanographer Assistant** (powered by Google Gemini AI).\n\nI can analyze Indian Ocean SST, Mixed Layer Depths, Argo float profiles, salinity stratification, and numerical ocean model dynamics. Ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-1.5-flash',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    // Construct oceanographic context from current UI state
    let contextStr = `Current Variable: ${scene.variable}, Selected Depth: ${scene.depth_m ?? 0}m, Time Index: ${scene.time_index}.`
    if (selectedFloat) {
      contextStr += ` Selected Argo Float: #${selectedFloat.platform_number} (Cycle ${selectedFloat.cycle_number}) at Lat ${selectedFloat.latitude?.toFixed(2)}°N, Lon ${selectedFloat.longitude?.toFixed(2)}°E.`
    }

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'init-1')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await api.aiChat(historyPayload, contextStr)
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: res.model || 'gemini-1.5-flash',
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **API Note**: Could not reach Gemini AI service (${err?.message || 'Server offline'}).\n\n*Fallback Intelligence*: Indian Ocean SST averages 28.2°C with a thermocline depth of ~40-120m across the Arabian Sea and Bay of Bengal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-1.5-flash (fallback)',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    '⚡ Analyze Indian Ocean SST',
    '🌡️ What is the Thermocline Depth?',
    '💧 Explain Bay of Bengal Salinity',
    selectedFloat ? `📊 Analyze Float #${selectedFloat.platform_number}` : '🌊 Current Speed Dynamics',
  ]

  return (
    <>
      {/* ── Trigger Floating Button ──────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #0d9488 100%)',
          border: '1px solid rgba(56, 189, 248, 0.6)',
          borderRadius: 9999,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 4px 25px rgba(2, 132, 199, 0.45)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(56, 189, 248, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 25px rgba(2, 132, 199, 0.45)'
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span>
        <span>NeerDrishti AI Assistant</span>
        {isOpen && <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 10 }}>Active</span>}
      </button>

      {/* ── AI Assistant Chat Modal Window ─────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 76,
            right: 24,
            width: 390,
            maxHeight: 560,
            height: '75vh',
            zIndex: 998,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(5, 14, 28, 0.96)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 16,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(2, 132, 199, 0.2)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>NeerDrishti AI</div>
                <div style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600 }}>Gemini 1.5 Flash · INCOIS Twin</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: 16,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(15, 29, 48, 0.9)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#ffffff',
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 9.5, color: '#64748b' }}>
                  <span>{msg.timestamp}</span>
                  {msg.model && <span style={{ color: '#38bdf8' }}>• {msg.model}</span>}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(15, 29, 48, 0.6)', borderRadius: 10, width: 'fit-content' }}>
                <span style={{ fontSize: 12, animation: 'pulse 1s infinite' }}>🤖 Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div style={{ padding: '6px 12px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ padding: 12, borderTop: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', gap: 8, background: 'rgba(2, 8, 18, 0.95)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask NeerDrishti AI oceanographer..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(15, 29, 48, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#ffffff',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(56, 189, 248, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: input.trim() && !loading ? 'pointer' : 'default',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
