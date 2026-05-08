import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SessionsProvider } from './context/SessionContext.jsx'
import { ProfileProvider } from './context/ProfileContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionsProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </SessionsProvider>
  </StrictMode>,
)
