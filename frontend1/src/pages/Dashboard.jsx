import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/layout/PageLayout'
import api from '../services/api'

// ── Skeleton primitives ────────────────────────────────────────────────────
function Sk({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full gap-4 animate-fadeIn">
      {/* Welcome */}
      <div className="flex items-center justify-between mt-2">
        <Sk className="h-7 w-48" />
        <Sk className="h-10 w-10 rounded-full" />
      </div>
      {/* Status card */}
      <Sk className="h-28 w-full rounded-xl" />
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
      </div>
      {/* Chart */}
      <Sk className="h-52 w-full rounded-xl" />
      {/* Recent scans */}
      <Sk className="h-5 w-32" />
      <Sk className="h-20 w-full rounded-xl" />
      <Sk className="h-20 w-full rounded-xl" />
    </div>
  )
}

// ── Risk level helpers ─────────────────────────────────────────────────────
const riskY = { low: 150, moderate: 100, medium: 100, high: 55, 'very high': 20 }
const riskColor = { low: '#0f766e', moderate: '#d97706', medium: '#d97706', high: '#dc2626', 'very high': '#7c0000' }
const dotColor  = (r) => riskColor[r?.toLowerCase()] || '#0f766e'

function getRiskBand(r) {
  switch (r?.toLowerCase()) {
    case 'high':
    case 'very high': return { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-700', icon: 'warning', label: 'High Risk' }
    case 'moderate':
    case 'medium':    return { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', icon: 'warning', label: 'Moderate Risk' }
    default:          return { bg: 'bg-teal-50',  border: 'border-teal-200',  title: 'text-primary',  icon: 'check_circle', label: 'Low Risk' }
  }
}

// ── Mini SVG risk chart built from real scan history ──────────────────────
function RiskChart({ scans }) {
  if (!scans.length) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-on-surface-variant text-[13px]">
        No scan data yet
      </div>
    )
  }

  // Use last 6 scans max, oldest→newest left→right
  const data = [...scans].reverse().slice(-6)
  const W = 340; const H = 160; const PAD = { l: 36, r: 12, t: 12, b: 28 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const points = data.map((s, i) => {
    const x = PAD.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = PAD.t + (riskY[s.risk_level?.toLowerCase()] || 150) / 160 * innerH
    return { x, y, ...s }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
      {/* Grid lines */}
      {[{ label: 'High', y: PAD.t + 20 }, { label: 'Med', y: PAD.t + 65 }, { label: 'Low', y: PAD.t + 110 }].map(g => (
        <g key={g.label}>
          <line x1={PAD.l} x2={W - PAD.r} y1={g.y} y2={g.y}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PAD.l - 4} y={g.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{g.label}</text>
        </g>
      ))}

      {/* Gradient fill under line */}
      <defs>
        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {points.length > 1 && (
        <polygon
          points={`${points[0].x},${PAD.t + innerH} ${polyline} ${points[points.length-1].x},${PAD.t + innerH}`}
          fill="url(#riskGrad)"
        />
      )}

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#0f766e" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + date labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={dotColor(p.risk_level)} stroke="#fff" strokeWidth="2" />
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const [scans,   setScans]   = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/predictions/history', { params: { limit: 6 } })
      const predictions = res.data?.predictions || []
      const mapped = predictions.map(p => ({
        id:         p.id,
        risk_level: p.risk_level,
        timestamp:  p.created_at,
        image_url:  p.image_url,
        confidence: p.confidence,
      }))
      setScans(mapped)
      if (mapped.length) {
        const total    = res.data?.total || mapped.length
        const lastDate = new Date(mapped[0].timestamp)
        const daysSince = Math.max(0, Math.floor((Date.now() - lastDate) / 86400000))
        setStats({ total, daysSince, latest: mapped[0] })
      } else {
        setStats({ total: 0, daysSince: 0, latest: null })
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e)
      setStats({ total: 0, daysSince: 0, latest: null })
    } finally {
      setLoading(false)
    }
  }

  const displayName = user?.displayName?.split(' ')[0] || 'there'
  const latestRisk  = stats?.latest?.risk_level
  const band        = getRiskBand(latestRisk)
  const recentThree = scans.slice(0, 3)

  return (
    <PageLayout title="Home" activeNav="home">
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col w-full gap-4 animate-fadeIn">

          {/* Welcome */}
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-[20px] font-semibold text-on-surface">
              Welcome back, {displayName}
            </h1>
            <button
              aria-label="Notifications"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant">notifications</span>
            </button>
          </div>

          {/* Current Status */}
          {stats?.latest ? (
            <div className={`${band.bg} border ${band.border} rounded-xl p-4 flex flex-col gap-2`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${band.title} text-[22px]`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {band.icon}
                </span>
                <span className={`font-semibold text-[16px] ${band.title}`}>{band.label}</span>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Last scan on{' '}
                <strong>{new Date(stats.latest.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                {' '}· {Math.round((stats.latest.confidence || 0) * 100)}% confidence
              </p>
              <button
                onClick={() => navigate(`/scan-results?id=${stats.latest.id}`)}
                className="text-[13px] text-primary font-medium hover:underline w-fit"
              >
                View last result →
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2">
              <p className="text-[14px] font-medium text-on-surface">No scans yet</p>
              <p className="text-[13px] text-on-surface-variant">Do your first scan to see your health status here.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-[28px] font-bold text-primary">{stats?.total ?? 0}</span>
              <span className="text-[12px] text-on-surface-variant mt-1">Total Scans</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-[28px] font-bold text-primary">
                {stats?.latest ? stats.daysSince : '—'}
              </span>
              <span className="text-[12px] text-on-surface-variant mt-1">Days Since Last Scan</span>
            </div>
          </div>

          {/* Risk History Chart */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
            <h3 className="text-[14px] font-semibold text-on-surface mb-3">Your Risk History</h3>
            <RiskChart scans={scans} />
            {!scans.length && (
              <p className="text-center text-[12px] text-on-surface-variant mt-2">
                Complete a scan to see your risk trend
              </p>
            )}
          </div>

          {/* Recent Scans */}
          <div className="flex flex-col gap-3 mb-20">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-on-surface">Recent Scans</h3>
              {scans.length > 0 && (
                <button
                  onClick={() => navigate('/history')}
                  className="text-[13px] text-primary hover:underline"
                >
                  View All
                </button>
              )}
            </div>

            {recentThree.length > 0 ? (
              recentThree.map((scan, i) => {
                const rb = getRiskBand(scan.risk_level)
                return (
                  <button
                    key={scan.id || i}
                    onClick={() => navigate(`/scan-results?id=${scan.id}`)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center h-[80px] overflow-hidden hover:bg-surface-container-low transition-colors text-left w-full"
                  >
                    {/* Color strip */}
                    <div className={`w-1 h-full flex-shrink-0 ${
                      scan.risk_level?.toLowerCase().includes('high') ? 'bg-red-500'
                      : scan.risk_level?.toLowerCase().includes('medium') || scan.risk_level?.toLowerCase().includes('moderate') ? 'bg-amber-500'
                      : 'bg-primary'
                    }`} />
                    {/* Thumbnail */}
                    <div className="w-14 h-14 mx-3 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                      {scan.image_url ? (
                        <img src={scan.image_url} alt="Scan" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">image</span>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-on-surface truncate">
                        {new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[11px] mt-1 px-2 py-0.5 rounded-full ${rb.bg} ${rb.title}`}>
                        <span className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          {rb.icon}
                        </span>
                        {rb.label}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-3">chevron_right</span>
                  </button>
                )
              })
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[40px] mb-2">history</span>
                <p className="text-[13px] text-on-surface-variant">No scans yet. Start monitoring today.</p>
              </div>
            )}
          </div>

          {/* FAB */}
          <button
            onClick={() => navigate('/foot-scan-analysis')}
            className="fixed bottom-24 right-4 bg-primary text-on-primary h-14 pl-4 pr-5 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all z-40"
          >
            <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            <span className="text-[14px] font-semibold">New Scan</span>
          </button>
        </div>
      )}
    </PageLayout>
  )
}
