import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../components/DashboardHeader'
import { logout } from '../services/api'

const SAMPLE = [
  { id:1, ts:'2024-03-05 14:23', prediction:'Diabetic Foot Ulcer Detected', confidence:94.2, riskLevel:'High Risk',   severity:'Critical', location:'Left Plantar', suggestion:'Immediate wound care specialist consultation within 24 hours. Grade 3 ulcer with signs of infection.' },
  { id:2, ts:'2024-03-05 11:15', prediction:'Early Stage Ulceration',        confidence:87.5, riskLevel:'Moderate Risk',severity:'Moderate', location:'Right Heel',   suggestion:'Monitor closely. Early tissue breakdown. Recommend offloading and glycemic control.' },
  { id:3, ts:'2024-03-04 16:47', prediction:'No Abnormalities Detected',     confidence:96.8, riskLevel:'Low Risk',    severity:'Normal',   location:'Bilateral Feet',suggestion:'Healthy tissue. Continue routine preventive care.' },
  { id:4, ts:'2024-03-04 09:32', prediction:'Chronic Wound with Infection',  confidence:91.3, riskLevel:'High Risk',   severity:'Critical', location:'Left Toe',     suggestion:'Active infection detected. Bacterial culture recommended. Consider antibiotic therapy.' },
  { id:5, ts:'2024-03-03 13:58', prediction:'Pre-Ulcerative Changes',        confidence:83.7, riskLevel:'Moderate Risk',severity:'Moderate', location:'Right Ball',   suggestion:'Implement specialised footwear and regular inspection.' },
  { id:6, ts:'2024-03-02 10:21', prediction:'Healthy Tissue',                confidence:98.1, riskLevel:'Low Risk',    severity:'Normal',   location:'Both Feet',    suggestion:'No pathological findings. Maintain current preventive care routine.' },
]

const RISK_CONFIG = {
  'High Risk':     { bg:'bg-red-100',    text:'text-red-700',    border:'border-red-200',    dot:'bg-red-500' },
  'Moderate Risk': { bg:'bg-yellow-100', text:'text-yellow-700', border:'border-yellow-200', dot:'bg-yellow-500' },
  'Low Risk':      { bg:'bg-green-100',  text:'text-green-700',  border:'border-green-200',  dot:'bg-green-500' },
}

const SEV_COLORS = { Critical:'text-red-600', Moderate:'text-yellow-600', Normal:'text-green-600' }

function RiskBadge({ level }) {
  const c = RISK_CONFIG[level] || RISK_CONFIG['Low Risk']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  )
}

export default function History({ onLogout }) {
  const navigate   = useNavigate()
  const [selected, setSelected] = useState(null)
  const [risk,     setRisk]     = useState('all')
  const [query,    setQuery]    = useState('')
  const [view,     setView]     = useState('grid')

  const filtered = SAMPLE.filter(e => {
    const rOk = risk === 'all' || e.riskLevel === risk
    const qOk = !query || e.prediction.toLowerCase().includes(query.toLowerCase())
    return rOk && qOk
  })

  // Close modal on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader title="Scan History" onLogout={onLogout} />

      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-6 pb-28 lg:pb-10">

        {/* Page heading */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Analysis History</h1>
            <p className="text-sm text-slate-500 mt-1">All past AI scan results and recommendations</p>
          </div>
          <button
            onClick={() => navigate('/foot-scan-analysis')}
            className="flex items-center gap-2 rounded-xl bg-[#308ce8] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#308ce8]/25 transition-all hover:-translate-y-px active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            New Scan
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Risk filter chips */}
            <div className="flex flex-wrap gap-2">
              {['all','High Risk','Moderate Risk','Low Risk'].map(r => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    risk === r
                      ? r === 'High Risk'     ? 'bg-red-600 text-white shadow-sm'
                      : r === 'Moderate Risk' ? 'bg-yellow-500 text-white shadow-sm'
                      : r === 'Low Risk'      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-[#308ce8] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'all' ? 'All Results' : r}
                </button>
              ))}
            </div>

            {/* Search + view toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-56">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Search diagnosis..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#308ce8] focus:ring-2 focus:ring-[#308ce8]/20 focus:bg-white"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {['grid','list'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      view === v ? 'bg-white text-[#308ce8] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{v === 'grid' ? 'grid_view' : 'view_list'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result count */}
          <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
            Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-700">{SAMPLE.length}</span> results
          </p>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
            <div>
              <p className="font-bold text-slate-700">No results found</p>
              <p className="text-sm text-slate-500 mt-1">Adjust your filters or search term</p>
            </div>
            <button onClick={() => { setRisk('all'); setQuery('') }}
              className="text-sm font-bold text-[#308ce8] hover:underline">Clear filters</button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(e => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="group text-left rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-lg hover:border-[#308ce8]/20 transition-all hover:-translate-y-0.5"
              >
                {/* Image placeholder with severity indicator */}
                <div className={`h-2 w-full ${
                  e.severity === 'Critical' ? 'bg-red-500' :
                  e.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="relative bg-slate-100 h-32 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:scale-110 transition-transform">image</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{e.location}</span>
                    <span className={`text-xs font-bold ${
                      e.severity === 'Critical' ? 'text-red-300' :
                      e.severity === 'Moderate' ? 'text-yellow-300' : 'text-green-300'
                    }`}>{e.severity}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-[10px] text-slate-400">{e.ts}</p>
                    <RiskBadge level={e.riskLevel} />
                  </div>
                  <h3 className={`font-bold text-sm leading-snug mb-2 ${SEV_COLORS[e.severity]}`}>{e.prediction}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{e.suggestion}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Confidence</p>
                      <p className="text-lg font-extrabold text-slate-900">{e.confidence}%</p>
                    </div>
                    <span className="text-xs font-bold text-[#308ce8] group-hover:underline">View details →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="group w-full text-left rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-lg hover:border-[#308ce8]/20 transition-all"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                    <span className="material-symbols-outlined text-3xl text-slate-300 absolute inset-0 flex items-center justify-center">image</span>
                    <div className={`absolute bottom-0 inset-x-0 h-1 ${
                      e.severity === 'Critical' ? 'bg-red-500' :
                      e.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm ${SEV_COLORS[e.severity]}`}>{e.prediction}</h3>
                      <RiskBadge level={e.riskLevel} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{e.ts} · {e.location}</p>
                    <p className="text-xs text-slate-600 line-clamp-1">{e.suggestion}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <p className="text-xl font-extrabold text-slate-900">{e.confidence}%</p>
                    <span className="text-xs font-bold text-[#308ce8] group-hover:underline">Details →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* Handle bar (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 z-10">
              <div>
                <h3 className="font-bold text-slate-900">Analysis Details</h3>
                <p className="text-xs text-slate-500">{selected.ts}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image placeholders */}
              <div className="grid grid-cols-2 gap-3">
                {['Original Scan','AI Heatmap'].map(l => (
                  <div key={l} className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="bg-slate-100 h-32 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                    </div>
                    <div className="border-t bg-slate-50 py-2 text-center text-xs font-semibold text-slate-600">{l}</div>
                  </div>
                ))}
              </div>

              {/* Results */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-4">
                {[
                  { label:'Diagnosis',   val: selected.prediction, cls: SEV_COLORS[selected.severity] },
                  { label:'Risk Level',  val: null, badge: true },
                  { label:'Confidence',  val: `${selected.confidence}%`, cls: 'text-slate-900' },
                  { label:'Location',    val: selected.location,   cls: 'text-slate-900' },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-xs text-slate-500 mb-1">{r.label}</p>
                    {r.badge
                      ? <RiskBadge level={selected.riskLevel} />
                      : <p className={`font-bold text-sm ${r.cls}`}>{r.val}</p>
                    }
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="rounded-xl border border-[#308ce8]/20 bg-[#308ce8]/5 p-4">
                <p className="font-bold text-sm text-slate-900 mb-1.5">AI Recommendation</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selected.suggestion}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#308ce8] py-3 text-sm font-bold text-white hover:bg-[#308ce8]/90 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Report
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { icon:'home',    label:'Home',   path:'/dashboard' },
            { icon:'camera',  label:'Scan',   path:'/foot-scan-analysis' },
            { icon:'history', label:'History',path:'/history', active:true },
            { icon:'person',  label:'Profile',path:'/account-settings' },
          ].map(n => (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${n.active ? 'text-[#308ce8]' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-[22px]">{n.icon}</span>
              <span className="text-[10px] font-bold">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
