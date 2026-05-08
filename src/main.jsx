import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SessionsProvider } from './context/sessions/SessionsProvider'
import { CharactersProvider } from './context/characters/CharactersProvider'
import { ProfileProvider } from './context/profile/ProfileProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionsProvider>
      <CharactersProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </CharactersProvider>
    </SessionsProvider>
  </StrictMode>,
)
