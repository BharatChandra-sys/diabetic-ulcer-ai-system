import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import api from '../services/api'

export default function History() {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [filteredScans, setFilteredScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [scans, searchQuery, activeFilter])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/predictions/history')
      const predictions = response.data?.predictions || []
      // Map backend fields to frontend format
      const mappedScans = predictions.map(p => ({
        id: p.id,
        risk_level: p.risk_level,
        timestamp: p.created_at,
        image_url: p.image_url,
        notes: p.prediction
      }))
      setScans(mappedScans)
      setFilteredScans(mappedScans)
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setScans([])
      setFilteredScans([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...scans]

    // Apply risk filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(
        (scan) => scan.risk_level?.toLowerCase() === activeFilter.toLowerCase()
      )
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (scan) =>
          scan.risk_level?.toLowerCase().includes(query) ||
          new Date(scan.timestamp).toLocaleDateString().toLowerCase().includes(query) ||
          scan.notes?.toLowerCase().includes(query)
      )
    }

    setFilteredScans(filtered)
  }

  const getRiskConfig = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-primary-container',
          text: 'text-on-primary-container',
          icon: 'check_circle',
          label: 'Low Risk',
          border: 'bg-primary'
        }
      case 'medium':
        return {
          bg: 'bg-tertiary-container',
          text: 'text-on-tertiary-container',
          icon: 'warning',
          label: 'Moderate Risk',
          border: 'bg-tertiary'
        }
      case 'high':
        return {
          bg: 'bg-error-container',
          text: 'text-on-error-container',
          icon: 'emergency',
          label: 'High Risk',
          border: 'bg-error'
        }
      default:
        return {
          bg: 'bg-primary-container',
          text: 'text-on-primary-container',
          icon: 'check_circle',
          label: 'Low Risk',
          border: 'bg-primary'
        }
    }
  }

  return (
    <PageLayout title="History" activeNav="history">
      <div className="flex flex-col w-full gap-md">
        {/* Search Bar */}
        <div className="relative w-full mt-sm">
          <label className="sr-only" htmlFor="search-history">
            Search your scan history
          </label>
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full h-[56px] pl-xl pr-sm rounded-xl bg-surface-container text-body-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-high transition-colors"
            id="search-history"
            placeholder="Search by date or status..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto gap-sm pb-xs -mx-md px-md hide-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`h-[48px] px-md rounded-full font-label-md text-label-md flex items-center justify-center flex-shrink-0 transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Scans
          </button>
          <button
            onClick={() => setActiveFilter('low')}
            className={`h-[48px] px-md rounded-full font-label-md text-label-md flex items-center gap-xs flex-shrink-0 transition-colors ${
              activeFilter === 'low'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
            Low
          </button>
          <button
            onClick={() => setActiveFilter('medium')}
            className={`h-[48px] px-md rounded-full font-label-md text-label-md flex items-center gap-xs flex-shrink-0 transition-colors ${
              activeFilter === 'medium'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">warning</span>
            Moderate
          </button>
          <button
            onClick={() => setActiveFilter('high')}
            className={`h-[48px] px-md rounded-full font-label-md text-label-md flex items-center gap-xs flex-shrink-0 transition-colors ${
              activeFilter === 'high'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-error">emergency</span>
            High
          </button>
        </div>

        {/* Scan List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredScans.length > 0 ? (
          <div className="flex flex-col w-full gap-sm">
            {filteredScans.map((scan, index) => {
              const config = getRiskConfig(scan.risk_level)
              return (
                <button
                  key={scan.id || index}
                  onClick={() => navigate(`/scan-results?id=${scan.id}`)}
                  className="relative w-full bg-surface-container-lowest rounded-xl shadow-sm flex items-center h-[96px] overflow-hidden text-left hover:bg-surface-container-low transition-colors"
                >
                  {/* Color Strip */}
                  <div className={`w-1.5 h-full ${config.border} flex-shrink-0`}></div>

                  {/* Content */}
                  <div className="flex-1 flex items-center px-sm gap-md">
                    {/* Thumbnail */}
                    <div className="w-[64px] h-[64px] rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                      {scan.image_url ? (
                        <img
                          src={scan.image_url}
                          alt="Scan thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <span className="font-headline text-headline-md text-on-surface truncate">
                        {new Date(scan.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-xs mt-xs">
                        <div
                          className={`${config.bg} ${config.text} px-xs py-[2px] rounded inline-flex items-center gap-xs`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {config.icon}
                          </span>
                          <span className="font-label-md text-[12px] leading-[16px] tracking-wide">
                            {config.label}
                          </span>
                        </div>
                        {scan.notes && (
                          <span className="font-body-md text-[14px] text-on-surface-variant truncate ml-xs">
                            {scan.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px] pr-xs">
                      chevron_right
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center text-center py-xl px-md mt-lg bg-surface-container-lowest rounded-xl shadow-sm">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-[40px] text-on-primary-container">
                podiatry
              </span>
            </div>
            <h2 className="font-headline text-headline-lg text-on-surface mb-xs">No Scans Yet</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-[280px]">
              You haven't done a scan yet. Start monitoring your foot health today.
            </p>
            <button
              onClick={() => navigate('/foot-scan-analysis')}
              className="w-full max-w-[280px] h-[56px] rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-sm hover:bg-primary/90 transition-colors active:bg-primary-container"
            >
              <span className="material-symbols-outlined">qr_code_scanner</span>
              Start Your First Scan
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
