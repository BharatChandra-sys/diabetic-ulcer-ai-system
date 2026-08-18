import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../services/api'

export default function FootScanAnalysis() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stream, setStream] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCaptureMode('camera')
      setError('')
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCaptureMode('upload')
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setSelectedFile(file)
          setPreview(canvas.toDataURL('image/jpeg'))
          stopCamera()
        }
      }, 'image/jpeg')
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select or capture an image first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await api.post('/predictions/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 60 second timeout for ML inference
      })

      console.log('Analysis response:', response.data)

      // Navigate to results page
      if (response.data && response.data.id) {
        navigate(`/scan-results?id=${response.data.id}`)
      } else {
        console.error('No ID in response:', response.data)
        setError('Invalid response from server. Please try again.')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
  }

  return (
    <PageLayout title="New Scan" activeNav="scan">
      <div className="flex flex-col w-full gap-lg">
        {/* Instructions Card */}
        <div className="bg-primary-container/10 border border-primary-container rounded-xl p-md">
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">info</span>
            <div className="flex flex-col gap-xs">
              <h3 className="font-headline text-headline-md text-on-surface">
                Tips for Best Results
              </h3>
              <ul className="font-body-md text-body-md text-on-surface-variant space-y-1 list-disc list-inside">
                <li>Use good lighting</li>
                <li>Keep the camera steady</li>
                <li>Fill the frame with the affected area</li>
                <li>Avoid shadows on the skin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Camera/Upload Area */}
        {captureMode === 'camera' && !preview ? (
          <div className="flex flex-col gap-md">
            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-primary/50 rounded-xl pointer-events-none"></div>
            </div>
            <div className="flex gap-sm">
              <Button variant="secondary" onClick={stopCamera} className="flex-1">
                Cancel
              </Button>
              <Button onClick={capturePhoto} className="flex-1">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                Capture
              </Button>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-md">
            <div className="relative w-full aspect-square bg-surface-container rounded-xl overflow-hidden border border-outline-variant">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-sm">
              <Button variant="secondary" onClick={handleRetake} className="flex-1">
                Retake
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Analyzing...' : 'Analyze Scan'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {/* Upload Button */}
            <button
              onClick={handleUploadClick}
              className="w-full h-[200px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-colors flex flex-col items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined text-primary text-[48px]">
                cloud_upload
              </span>
              <span className="font-headline text-headline-md text-on-surface">
                Upload Photo
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Tap to select from gallery
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Or Divider */}
            <div className="flex items-center gap-md py-md">
              <div className="flex-1 h-[1px] bg-outline-variant"></div>
              <span className="font-body-md text-body-md text-on-surface-variant">or</span>
              <div className="flex-1 h-[1px] bg-outline-variant"></div>
            </div>

            {/* Camera Button */}
            <Button onClick={startCamera} className="w-full">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              Use Camera
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-sm bg-error-container/20 rounded-lg flex items-start gap-xs border border-error/20">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="font-body-sm text-on-error-container">{error}</p>
          </div>
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Privacy Notice */}
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mt-md">
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              lock
            </span>
            <div className="flex flex-col gap-xs">
              <h4 className="font-headline text-headline-md text-on-surface">
                Your Privacy Matters
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                All images are encrypted and stored securely. Your data is never shared without
                your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
