/**
 * Minimap.tsx - Interactive SVG Indian Ocean Region Selector
 * Shows selected region highlight + city markers
 * Instant region jump buttons + interactive click selection
 */
import React, { useCallback } from "react"

interface BBox { lat_min: number; lat_max: number; lon_min: number; lon_max: number }
interface MinimapProps {
  region: BBox
  onRegionSelect?: (bbox: BBox) => void
}

// SVG canvas: 210 x 135 px
const W = 210, H = 135
const LON_MIN = 55, LON_MAX = 100
const LAT_MIN = 0,  LAT_MAX = 30

function toSVG(lat: number, lon: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
}

function bboxToSVG(b: BBox) {
  const [x1, y1] = toSVG(b.lat_max, b.lon_min)
  const [x2, y2] = toSVG(b.lat_min, b.lon_max)
  return { x: x1, y: y1, w: Math.max(8, x2 - x1), h: Math.max(8, y2 - y1) }
}

const INDIA_POLY: [number, number][] = [
  [23.5,68.5],[21,69.5],[20,73],[17,73.5],[15,74.5],[10,76.5],[8.1,77.6],
  [8.5,78.2],[11,80],[13.1,80.3],[16,81],[20,86.5],[22,88],[23,92],
  [26,92],[27,89],[28,85],[27,80],[26,74],[24,69],[23.5,68.5],
]

const SLANKA_POLY: [number, number][] = [
  [10,80],[9,81],[7,81.5],[6.5,80.5],[7,79.8],[9,79.5],[10,80],
]

const CITIES: Array<{ lat: number; lon: number; name: string; color: string }> = [
  { lat: 19.1, lon: 72.9, name: "Mumbai",    color: "#f59e0b" },
  { lat: 13.1, lon: 80.3, name: "Chennai",   color: "#10b981" },
  { lat: 22.6, lon: 88.4, name: "Kolkata",   color: "#34d399" },
  { lat: 6.9,  lon: 79.9, name: "Colombo",   color: "#a78bfa" },
  { lat: 11.7, lon: 92.7, name: "Port Blair",color: "#38bdf8" },
]

const REGION_PRESETS: Array<{ name: string; bbox: BBox }> = [
  { name: "Full Basin", bbox: { lat_min: 0, lat_max: 30, lon_min: 55, lon_max: 100 } },
  { name: "Arabian Sea", bbox: { lat_min: 8, lat_max: 25, lon_min: 55, lon_max: 76 } },
  { name: "Bay of Bengal", bbox: { lat_min: 5, lat_max: 22, lon_min: 78, lon_max: 95 } },
  { name: "India EEZ", bbox: { lat_min: 6, lat_max: 23, lon_min: 68, lon_max: 90 } },
]

export default function Minimap({ region, onRegionSelect }: MinimapProps) {
  const indiaPath = INDIA_POLY.map((p, i) => {
    const [x, y] = toSVG(p[0], p[1])
    return `${i === 0 ? "M" : "L"} ${x},${y}`
  }).join(" ") + " Z"

  const slankaPath = SLANKA_POLY.map((p, i) => {
    const [x, y] = toSVG(p[0], p[1])
    return `${i === 0 ? "M" : "L"} ${x},${y}`
  }).join(" ") + " Z"

  const box = bboxToSVG(region)

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!onRegionSelect) return
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const svgY = ((e.clientY - rect.top)  / rect.height) * H
    const lon = svgX / W * (LON_MAX - LON_MIN) + LON_MIN
    const lat = LAT_MAX - svgY / H * (LAT_MAX - LAT_MIN)
    const spanLat = 10, spanLon = 14
    onRegionSelect({
      lat_min: Math.max(LAT_MIN, Math.round(lat - spanLat / 2)),
      lat_max: Math.min(LAT_MAX, Math.round(lat + spanLat / 2)),
      lon_min: Math.max(LON_MIN, Math.round(lon - spanLon / 2)),
      lon_max: Math.min(LON_MAX, Math.round(lon + spanLon / 2)),
    })
  }, [onRegionSelect])

  return (
    <div style={{
      position: "absolute", bottom: 70, right: 14, zIndex: 25,
      background: "rgba(11, 22, 34, 0.94)",
      border: "1px solid rgba(16, 185, 129, 0.4)",
      borderRadius: 10, padding: 10,
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      width: 230,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: "#10b981", fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: 1 }}>
          📍 REGION MAP FOCUS
        </span>
        <span style={{ fontSize: 9, color: "#a7f3d0", background: "rgba(16,185,129,0.15)", padding: "1px 5px", borderRadius: 4 }}>
          {region.lat_min}°N - {region.lat_max}°N
        </span>
      </div>

      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        onClick={handleClick}
        style={{ cursor: "crosshair", display: "block", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}
      >
        {/* Ocean base */}
        <rect x={0} y={0} width={W} height={H} fill="#0b1b2b" />

        {/* Lat / Lon grid lines */}
        {[65, 75, 85, 95].map(lon => {
          const [x] = toSVG(0, lon)
          return <line key={lon} x1={x} y1={0} x2={x} y2={H} stroke="rgba(16,185,129,0.15)" strokeWidth={0.5} />
        })}
        {[10, 20].map(lat => {
          const [,y] = toSVG(lat, 0)
          return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke="rgba(16,185,129,0.15)" strokeWidth={0.5} />
        })}

        {/* India Landmass */}
        <path d={indiaPath} fill="#142c23" stroke="#22c55e" strokeWidth={0.9} fillOpacity={0.9} />

        {/* Sri Lanka */}
        <path d={slankaPath} fill="#142c23" stroke="#22c55e" strokeWidth={0.7} fillOpacity={0.9} />

        {/* Selected Region Bounding Box Highlight */}
        <rect
          x={box.x} y={box.y} width={box.w} height={box.h}
          fill="rgba(16, 185, 129, 0.2)"
          stroke="#10b981"
          strokeWidth={1.8}
          strokeDasharray="4,3"
          rx={2}
        />

        {/* City Markers */}
        {CITIES.map(c => {
          const [cx, cy] = toSVG(c.lat, c.lon)
          const isRight = cx < W * 0.65
          return (
            <g key={c.name}>
              <circle cx={cx} cy={cy} r={2.5} fill={c.color} />
              <text
                x={isRight ? cx + 5 : cx - 5}
                y={cy + 3}
                fill={c.color}
                fontSize={7.5}
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                textAnchor={isRight ? "start" : "end"}
              >
                {c.name}
              </text>
            </g>
          )
        })}

        {/* Lat/Lon Boundary Labels */}
        <text x={3} y={H - 4} fill="#80b0a0" fontSize={6.5} fontFamily="monospace">0°N 55°E</text>
        <text x={W - 3} y={H - 4} fill="#80b0a0" fontSize={6.5} fontFamily="monospace" textAnchor="end">100°E</text>
        <text x={3} y={9} fill="#80b0a0" fontSize={6.5} fontFamily="monospace">30°N</text>
      </svg>

      {/* Quick Region Presets Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
        {REGION_PRESETS.map((p) => {
          const isActive =
            region.lat_min === p.bbox.lat_min &&
            region.lat_max === p.bbox.lat_max &&
            region.lon_min === p.bbox.lon_min &&
            region.lon_max === p.bbox.lon_max

          return (
            <button
              key={p.name}
              onClick={() => onRegionSelect && onRegionSelect(p.bbox)}
              style={{
                padding: "3px 6px",
                fontSize: 9,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#04271d" : "#a7f3d0",
                background: isActive ? "#10b981" : "rgba(255,255,255,0.06)",
                border: `1px solid ${isActive ? "#10b981" : "rgba(16,185,129,0.2)"}`,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
