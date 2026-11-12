import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import CustomCursor from './components/CustomCursor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Outside App so it sits above every screen. Desktop (mouse) only. */}
    <CustomCursor />
  </StrictMode>,
)
