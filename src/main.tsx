import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import CustomCursor from './components/CustomCursor'
import GradientBackground from './components/GradientBackground'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Behind everything (z-index -1); see .gradient-bg in index.css. */}
    <GradientBackground />
    <App />
    {/* Outside App so it sits above every screen. Desktop (mouse) only. */}
    <CustomCursor />
  </StrictMode>,
)
