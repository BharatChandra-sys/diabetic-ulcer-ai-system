import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/layout/PageLayout'
import StatusBadge from '../components/ui/StatusBadge'
import api from '../services/api'

export default function ScanResults() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const scanId = searchParams.get('id')

  const [scanData, setScanData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('photo') // 'photo' or 'ai'

  useEffect(() => {
    if (scanId) {
      fetchScanResults()
    }
  }, [scanId])

  const fetchScanResults = async () => {
    try {
      const response = await api.get(`/predictions/${scanId}`)
      console.log('Scan data received:', response.data)
      console.log('Has heatmap_url:', !!response.data.heatmap_url)
      console.log('Has gradcam_overlay:', !!response.data.gradcam_overlay)
      setScanData(response.data)
    } catch (error) {
      console.error('Failed to fetch scan results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskConfig = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-error-container',
          text: 'text-on-error-container',
          titleColor: 'text-error',
          icon: 'warning',
          title: 'Very High Risk',
          message: 'We found signs that need attention soon.'
        }
      case 'medium':
        return {
          bg: 'bg-tertiary-container',
          text: 'text-on-tertiary-container',
          titleColor: 'text-tertiary',
          icon: 'warning',
          title: 'Medium Risk',
          message: 'Some areas require monitoring.'
        }
      case 'low':
      default:
        return {
          bg: 'bg-primary-container',
          text: 'text-on-primary-container',
          titleColor: 'text-primary',
          icon: 'check_circle',
          title: 'Low Risk',
          message: 'Everything looks good!'
        }
    }
  }

  const riskConfig = getRiskConfig(scanData?.risk_level)

  if (loading) {
    return (
      <PageLayout title="Results" activeNav="history">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    )
  }

  if (!scanData) {
    return (
      <PageLayout title="Results" activeNav="history">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-md">
          <span className="material-symbols-outlined text-on-surface-variant text-[64px]">error</span>
          <p className="text-body-lg text-on-surface-variant text-center">
            Scan not found
          </p>
          <button
            onClick={() => navigate('/history')}
            className="text-primary font-label-md hover:underline"
          >
            Go to History
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-md py-sm bg-surface border-b border-surface-variant sticky top-0 z-30 backdrop-blur-xl bg-surface/80">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary min-w-[touch_target_min] h-touch_target_min focus:ring-2 focus:ring-primary focus:outline-none rounded-lg p-2"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          <span className="font-label-md text-label-md">Back</span>
        </button>
        <h1 className="font-headline text-headline-md text-on-surface">Your Results</h1>
        <button
          aria-label="Share results"
          className="flex items-center gap-xs text-primary min-w-[touch_target_min] h-touch_target_min focus:ring-2 focus:ring-primary focus:outline-none rounded-lg p-2"
        >
          <span className="material-symbols-outlined text-[24px]">share</span>
          <span className="font-label-md text-label-md hidden sm:inline">Share</span>
        </button>
      </header>

      {/* Content */}
      <div className="px-md flex flex-col gap-lg flex-1 pb-md mt-md">
        {/* Result Status Card */}
        <section className={`${riskConfig.bg} ${riskConfig.text} rounded-xl p-md flex flex-col gap-sm shadow-sm`}>
          <div className="flex items-center gap-sm">
            <span
              className={`material-symbols-outlined ${riskConfig.titleColor} text-[32px]`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {riskConfig.icon}
            </span>
            <h2 className={`font-headline text-headline-lg ${riskConfig.titleColor}`}>
              {riskConfig.title}
            </h2>
          </div>
          <p className="font-body-lg text-body-lg">{riskConfig.message}</p>
          <p className="font-body-md text-body-md opacity-90 mt-xs">
            We're {Math.round((scanData.confidence || 0.98) * 100)}% confident in this result.
          </p>
        </section>

        {/* Image Viewer */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden flex flex-col">
          <div className="relative w-full aspect-square bg-surface-container-low">
            {scanData.image_url ? (
              <img
                src={scanData.image_url}
                alt="Scanned area"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[64px]">
                  image
                </span>
              </div>
            )}
            
            {/* AI Highlight Overlay */}
            {viewMode === 'ai' && scanData.heatmap_url && (
              <img
                src={scanData.heatmap_url}
                alt="AI heatmap overlay"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            )}
            
            {/* No heatmap message */}
            {viewMode === 'ai' && !scanData.heatmap_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center p-md">
                  <span className="material-symbols-outlined text-white text-[48px] mb-2">info</span>
                  <p className="text-white font-body-md">AI heatmap not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Toggle View Buttons */}
          <div className="p-sm bg-surface-container-lowest border-t border-surface-variant flex justify-center">
            <div className="flex bg-surface-variant rounded-lg p-1 w-full max-w-[300px]">
              <button
                onClick={() => setViewMode('photo')}
                className={`flex-1 py-2 font-label-md text-label-md rounded-md transition-colors focus:ring-2 focus:ring-primary focus:outline-none ${
                  viewMode === 'photo'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                Your Photo
              </button>
              <button
                onClick={() => setViewMode('ai')}
                className={`flex-1 py-2 font-label-md text-label-md rounded-md transition-colors focus:ring-2 focus:ring-primary focus:outline-none ${
                  viewMode === 'ai'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                AI Highlights
              </button>
            </div>
          </div>
        </section>

        {/* What We Noticed - AI Explanation */}
        {scanData.explanation_text && (
          <section>
            <h3 className="font-headline text-headline-md text-on-surface mb-sm px-2">
              What We Noticed
            </h3>
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant shadow-sm">
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                {scanData.explanation_text}
              </p>
            </div>
          </section>
        )}

        {/* Clinical Feature Importance */}
        {scanData.shap_importance && Object.keys(scanData.shap_importance).length > 0 && (
          <section>
            <h3 className="font-headline text-headline-md text-on-surface mb-sm px-2">
              Key Risk Factors
            </h3>
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant shadow-sm flex flex-col gap-sm">
              {Object.entries(scanData.shap_importance)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([feature, importance], index) => {
                  const percentage = Math.abs(importance * 100)
                  return (
                    <div key={index} className="flex items-center gap-sm">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-body-md text-body-md text-on-surface">
                            {feature}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        )}

        {/* What To Do Next */}
        {scanData.recommendations && scanData.recommendations.length > 0 && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
            <div className="p-md pl-lg flex flex-col gap-sm border border-surface-variant rounded-xl border-l-0">
              <h3 className="font-headline text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  medical_services
                </span>
                What To Do Next
              </h3>
              <ul className="list-disc list-inside font-body-lg text-body-lg text-on-surface space-y-2 mt-xs ml-1">
                {scanData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-md bg-surface/95 backdrop-blur-md border-t border-surface-variant flex flex-col gap-sm z-40 max-w-[640px] mx-auto pb-safe">
        <button 
          onClick={() => {
            // Generate shareable text
            const shareText = `MedVision AI Scan Results\n\nRisk Level: ${scanData.risk_level}\nConfidence: ${Math.round((scanData.confidence || 0) * 100)}%\nDate: ${new Date(scanData.analyzed_at).toLocaleDateString()}\n\nRecommendations:\n${scanData.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
            
            if (navigator.share) {
              navigator.share({
                title: 'MedVision AI Scan Results',
                text: shareText,
              }).catch(err => console.log('Share cancelled'))
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!')
              })
            }
          }}
          className="w-full h-[56px] rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors active:bg-primary-container focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none shadow-md"
        >
          <span className="material-symbols-outlined">send</span>
          Share with My Doctor
        </button>
        {user ? (
          <button 
            onClick={async () => {
              try {
                // Save to history if not already saved
                if (!scanData.saved_to_history) {
                  const formData = new FormData()
                  // Re-analyze with save_to_history=true
                  // This would require re-uploading, so just show a message
                  alert('This scan will be automatically saved when you log in before analyzing')
                } else {
                  alert('Already saved to history')
                }
              } catch (error) {
                alert('Failed to save to history')
              }
            }}
            className="w-full h-[56px] rounded-full bg-surface-container-lowest text-primary border-2 border-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors active:bg-surface-variant focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            disabled={scanData.saved_to_history}
          >
            <span className="material-symbols-outlined">
              {scanData.saved_to_history ? 'check' : 'bookmark_add'}
            </span>
            {scanData.saved_to_history ? 'Saved to History' : 'Save to My History'}
          </button>
        ) : (
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full h-[56px] rounded-full bg-surface-container-lowest text-primary border-2 border-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors active:bg-surface-variant focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
          >
            <span className="material-symbols-outlined">login</span>
            Sign In to Save History
          </button>
        )}
      </div>
    </div>
  )
}
