import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import './index.css'
import App from './App.jsx'

// Most data fetches here go through Supabase's query builder, which
// resolves (not rejects) even on a query error — only a genuine network
// failure (offline, DNS, a dropped connection) rejects the promise. Screens
// aren't required to catch that themselves; surface it instead of letting
// it crash as an unhandled rejection.
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  event.preventDefault()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
