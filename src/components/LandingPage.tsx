import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ViewMode } from '../types'
import './LandingPage.css'

interface LandingPageProps {
  onExplore: (mode?: ViewMode) => void
}

export default function LandingPage({ onExplore }: LandingPageProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<string>('hero')

  // Three.js Interactive 3D Globe background
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // ── 1. Create Subtle Oceanic Depth Grid Background ─────────────────
    const particleCount = 700
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 40
      const y = (Math.random() - 0.5) * 40
      const z = (Math.random() - 0.5) * 35 - 5
      particlePositions[i * 3] = x
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = z

      // Subtle marine teal/azure tones (no harsh white/yellow stars)
      particleColors[i * 3] = 0.05 + Math.random() * 0.15 // R
      particleColors[i * 3 + 1] = 0.4 + Math.random() * 0.4 // G
      particleColors[i * 3 + 2] = 0.7 + Math.random() * 0.3 // B
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    })
    const particleField = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleField)

    // ── 2. Create Earth Globe Sphere ─────────────────────────────────
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Deep ocean navy base
      ctx.fillStyle = '#061329'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Bathymetric / Oceanic lat-lon grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 64) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 64) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw stylized continents (Asia, India, Africa, Australia)
      ctx.fillStyle = '#0f2038'
      const lonToX = (lon: number) => ((lon + 180) / 360) * canvas.width
      const latToY = (lat: number) => ((90 - lat) / 180) * canvas.height

      // India polygon
      ctx.beginPath()
      ctx.moveTo(lonToX(68), latToY(24))
      ctx.lineTo(lonToX(77), latToY(35))
      ctx.lineTo(lonToX(88), latToY(27))
      ctx.lineTo(lonToX(82), latToY(18))
      ctx.lineTo(lonToX(78), latToY(8))
      ctx.lineTo(lonToX(73), latToY(15))
      ctx.closePath()
      ctx.fill()

      // Arabia & East Africa
      ctx.beginPath()
      ctx.moveTo(lonToX(35), latToY(30))
      ctx.lineTo(lonToX(60), latToY(25))
      ctx.lineTo(lonToX(50), latToY(12))
      ctx.lineTo(lonToX(42), latToY(-10))
      ctx.lineTo(lonToX(30), latToY(-30))
      ctx.lineTo(lonToX(20), latToY(10))
      ctx.closePath()
      ctx.fill()

      // Southeast Asia / Sunda
      ctx.beginPath()
      ctx.moveTo(lonToX(95), latToY(22))
      ctx.lineTo(lonToX(108), latToY(12))
      ctx.lineTo(lonToX(104), latToY(1))
      ctx.lineTo(lonToX(115), latToY(-5))
      ctx.lineTo(lonToX(125), latToY(-8))
      ctx.lineTo(lonToX(100), latToY(-7))
      ctx.lineTo(lonToX(98), latToY(8))
      ctx.closePath()
      ctx.fill()

      // Calibrated Indian Ocean Thermal SST Layer (Deep Marine Teal & Azure Gradient)
      const gradient = ctx.createRadialGradient(
        lonToX(78), latToY(5), 10,
        lonToX(78), latToY(5), 350
      )
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.75)') // Cyan core
      gradient.addColorStop(0.35, 'rgba(14, 165, 233, 0.55)') // Sky Azure
      gradient.addColorStop(0.7, 'rgba(37, 99, 235, 0.4)') // Deep Royal Blue
      gradient.addColorStop(1, 'rgba(6, 19, 41, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(lonToX(78), latToY(5), 350, 0, Math.PI * 2)
      ctx.fill()

      // Monsoonal Current Flow Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 10])

      for (let i = 0; i < 12; i++) {
        ctx.beginPath()
        const cy = latToY(15 - i * 2)
        ctx.moveTo(lonToX(45), cy + Math.sin(i) * 25)
        ctx.bezierCurveTo(
          lonToX(60), cy - 35,
          lonToX(75), cy + 35,
          lonToX(95), cy - 15
        )
        ctx.stroke()
      }
    }

    const globeTexture = new THREE.CanvasTexture(canvas)
    globeTexture.wrapS = THREE.RepeatWrapping
    globeTexture.wrapT = THREE.ClampToEdgeWrapping

    // Sphere Mesh
    const globeRadius = 2.2
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64)
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: globeTexture,
      shininess: 25,
      specular: new THREE.Color('#06b6d4'),
    })
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)

    // Position globe shifted right
    globe.position.set(1.6, -0.05, 0)
    globe.rotation.y = -Math.PI * 0.42
    globe.rotation.x = 0.38
    scene.add(globe)

    // ── 3. Atmosphere Outer Glow Rim ─────────────────────────────────
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.06, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.02, 0.71, 0.83, 1.0) * intensity * 1.4;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    atmosphere.position.copy(globe.position)
    scene.add(atmosphere)

    // ── 4. Lights ───────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight('#091322', 1.4)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight('#ffffff', 3.0)
    dirLight.position.set(-3, 4, 3)
    scene.add(dirLight)

    const cyanLight = new THREE.PointLight('#06b6d4', 2.0, 10)
    cyanLight.position.set(1, 2, 3)
    scene.add(cyanLight)

    // ── 5. Mouse Interactivity & Animation Loop ─────────────────────
    let targetRotationX = 0.38
    let targetRotationY = -Math.PI * 0.42
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
      targetRotationY = -Math.PI * 0.42 + mouseX * 0.2
      targetRotationX = 0.38 + mouseY * 0.12
    }
    window.addEventListener('mousemove', handleMouseMove)

    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.04 + 0.0006
      globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.04
      particleField.rotation.y -= 0.00015

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="landing-page">
      {/* Three.js Interactive 3D Globe Background Container */}
      <div className="landing-page__bg" ref={mountRef} />

      {/* Atmospheric Marine Overlay */}
      <div className="landing-page__overlay" />

      {/* ── Top Navigation Header ───────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header__brand">
          <div className="landing-header__logo-wrapper">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10C8 7 12 13 16 10C20 7 24 13 28 10" stroke="#06b6d4" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M4 16C8 13 12 19 16 16C20 13 24 19 28 16" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M4 22C8 19 12 25 16 22C20 19 24 25 28 22" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="landing-header__title-group">
            <h1 className="landing-header__title">NeerDrishti</h1>
            <span className="landing-header__subtitle">Ocean Digital Twin · INCOIS</span>
          </div>
        </div>

        <nav className="landing-header__nav">
          <button className={`nav-link ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>Overview</button>
          <button className="nav-link" onClick={() => onExplore('ocean3d')}>3D Digital Twin</button>
          <button className="nav-link" onClick={() => onExplore('cube')}>Ocean Cube</button>
          <button className="nav-link" onClick={() => onExplore('map2d')}>2D Map</button>
          <button className="nav-link" onClick={() => onExplore('cesium')}>Globe View</button>
          <button className="landing-header__btn" onClick={() => onExplore('ocean3d')}>
            <span>Launch Digital Twin</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </nav>
      </header>

      {/* ── Main Hero Content ────────────────────────────────────────── */}
      <main className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__tagline">
            OPERATIONAL OCEAN DIGITAL TWIN · INCOIS | MoES
          </div>

          <h1 className="landing-hero__headline">
            NeerDrishti <br />
            <span className="gradient-text">Indian Ocean Twin</span>
          </h1>

          <p className="landing-hero__description">
            An operational 3D oceanographic visualization and intelligence portal integrating numerical models (HYCOM & INCOIS IGORA) with real-time Argo float profiles & autonomous gliders for Indian Ocean monitoring.
          </p>

          {/* Operational Metrics KPI Bar */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 28, padding: '12px 18px', background: 'rgba(11, 26, 38, 0.7)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 10, backdropFilter: 'blur(10px)' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>13,148+</div>
              <div style={{ fontSize: 10, color: '#80b0a0', fontWeight: 500 }}>Argo Float Profiles</div>
            </div>
            <div style={{ width: 1, background: 'rgba(16, 185, 129, 0.2)' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>14 Layers</div>
              <div style={{ fontSize: 10, color: '#80b0a0', fontWeight: 500 }}>0–2,000m Depth Slices</div>
            </div>
            <div style={{ width: 1, background: 'rgba(16, 185, 129, 0.2)' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>HYCOM/IGORA</div>
              <div style={{ fontSize: 10, color: '#80b0a0', fontWeight: 500 }}>Model Assimilation</div>
            </div>
          </div>

          <div className="landing-hero__actions">
            <button className="cta-button cta-button--primary" onClick={() => onExplore('ocean3d')}>
              <span>Launch 3D Explorer</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <button className="cta-button cta-button--secondary" onClick={() => onExplore('cube')}>
              <span>Explore Ocean Cube</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* ── Bottom Feature Cards (4 Cards Grid) ── */}
      <footer className="landing-footer">
        <div className="feature-grid">

          {/* Feature 1 */}
          <div className="feature-card" onClick={() => onExplore('ocean3d')}>
            <div className="feature-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="feature-card__info">
              <h3 className="feature-card__title">3D Depth Profiling</h3>
              <p className="feature-card__desc">Thermocline & deep water layers down to 2,000m</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-card" onClick={() => onExplore('cube')}>
            <div className="feature-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="feature-card__info">
              <h3 className="feature-card__title">Model + Argo Assimilation</h3>
              <p className="feature-card__desc">13,000+ INCOIS ERDDAP float profiles</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-card" onClick={() => onExplore('map2d')}>
            <div className="feature-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="feature-card__info">
              <h3 className="feature-card__title">Hydrodynamic Fields</h3>
              <p className="feature-card__desc">Temperature, Salinity, Current Vectors & SSH</p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
