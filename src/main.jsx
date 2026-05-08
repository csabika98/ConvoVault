import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SessionsProvider } from './context/sessions/SessionsProvider'
import { CharactersProvider } from './context/characters/CharactersProvider'
import { ProfileProvider } from './context/profile/ProfileProvider'
import { ThemeProvider } from './components/Theme/theme-provider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="convovault-theme">
      <SessionsProvider>
        <CharactersProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </CharactersProvider>
      </SessionsProvider>
    </ThemeProvider>
  </StrictMode>,
)
