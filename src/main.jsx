import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SessionsProvider } from './context/SessionsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionsProvider>
      <App />
    </SessionsProvider>
  </StrictMode>,
)
