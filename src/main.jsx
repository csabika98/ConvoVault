import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SessionsProvider } from './context/SessionsContext'
import { ProfileProvider } from './context/ProfileContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileProvider>
      <SessionsProvider>
        <App />
      </SessionsProvider>
    </ProfileProvider>
  </StrictMode>,
)
