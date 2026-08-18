import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Wrapper to detect when CSS is fully loaded
function AppWithCSSDetection() {
  useEffect(() => {
    // Mark CSS as loaded after first render
    const timer = setTimeout(() => {
      document.getElementById('root')?.classList.add('css-loaded')
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithCSSDetection />
    </BrowserRouter>
  </StrictMode>,
)
