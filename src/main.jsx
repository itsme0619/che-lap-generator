import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router' // lets the app have pages with their own web addresses
import { AuthProvider } from './auth/AuthProvider.jsx' // NEW: shares "who's signed in" with every page
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* wraps the whole app so every page can use links */}
      <AuthProvider> {/* NEW */}
        <App />
      </AuthProvider> {/* NEW */}
    </BrowserRouter>
  </StrictMode>,
)
