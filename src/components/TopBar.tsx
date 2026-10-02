import { useState, useEffect } from 'react'
import { HealthStatus, ArgoMetadata } from '../services/api'
import { ViewMode } from '../types'

interface TopBarProps {
  health: HealthStatus | null
  healthError: boolean
  argoMeta: ArgoMetadata | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export default function TopBar({ health, argoMeta, viewMode, onViewModeChange }: TopBarProps) {
  const argoReady = health?.argo_ready
  const [utcTime, setUtcTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setUtcTime(now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC')
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  const views: { id: ViewMode; label: string; icon: JSX.Element }[] = [
    {
      id: 'landing',
      label: 'Home',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: 'ocean3d',
      label: '3D Digital Twin',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
    },
    {
      id: 'map2d',
      label: '2D Map',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      ),
    },
    {
      id: 'cube',
      label: 'Ocean Cube',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
  ]

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar__brand" onClick={() => onViewModeChange('landing')} style={{ cursor: 'pointer' }} title="Go to NeerDrishti Home">
        <div className="topbar__logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10C8 7 12 13 16 10C20 7 24 13 28 10" stroke="#06b6d4" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M4 16C8 13 12 19 16 16C20 13 24 19 28 16" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M4 22C8 19 12 25 16 22C20 19 24 25 28 22" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div className="topbar__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            NeerDrishti
            <span style={{ fontSize: 9, background: 'rgba(6,182,212,0.15)', color: '#06b6d4', padding: '1px 6px', borderRadius: 10, border: '1px solid rgba(6,182,212,0.3)', fontWeight: 600 }}>v2.0</span>
          </div>
          <div className="topbar__subtitle">Ocean Digital Twin · INCOIS</div>
        </div>
      </div>

      <div className="topbar__divider" />

      {/* View Mode Switcher */}
      <div className="view-switcher">
        {views.map(v => (
          <button
            key={v.id}
            className={`view-switcher__btn ${viewMode === v.id ? 'view-switcher__btn--active' : ''}`}
            onClick={() => onViewModeChange(v.id)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>

      <div className="topbar__divider" />

      {/* Data Source Status Pills */}
      <div className="topbar__pills">
        <StatusPill
          dot={argoReady ? 'ok' : 'warn'}
          label="Argo Floats"
          value={argoReady ? `${argoMeta?.total_profiles?.toLocaleString() ?? '—'} profiles` : 'Connecting'}
        />
        <StatusPill
          dot={health?.glider_ready ? 'ok' : 'warn'}
          label="Gliders"
          value={health?.glider_ready ? 'Bay of Bengal' : 'Standby'}
        />
      </div>

      <div className="topbar__spacer" />

      {/* Operational Clock & MoES Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {utcTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            {utcTime}
          </div>
        )}
        <div className="topbar__badge">
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 10 }}>MoES / INCOIS</div>
          <div style={{ color: '#64748b', fontSize: 9 }}>Ministry of Earth Sciences</div>
        </div>
      </div>
    </header>
  )
}

function StatusPill({ dot, label, value }: { dot: 'ok' | 'warn' | 'error'; label: string; value: string }) {
  const colors: Record<string, string> = { ok: '#10b981', warn: '#f59e0b', error: '#ef4444' }
  return (
    <div className="status-pill">
      <span className="status-pill__dot" style={{ background: colors[dot] }} />
      <span className="status-pill__label">{label}</span>
      <span className="status-pill__value">{value}</span>
    </div>
  )
}
