import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import CustomCursor from './components/CustomCursor'
import GradientBackground from './components/GradientBackground'
import PhoneFrame from './components/PhoneFrame'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* On large screens, the app is shown inside a drawn iPhone. */}
    <PhoneFrame>
      {/* Behind everything (z-index -1); see .gradient-bg in index.css. */}
      <GradientBackground />
      <App />
    </PhoneFrame>
    {/* Outside App so it sits above every screen. Desktop (mouse) only. */}
    <CustomCursor />
  </StrictMode>,
)
