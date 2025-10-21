import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Security, LoginCallback } from '@okta/okta-react'
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js'
import { useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CustomerPortal from './pages/CustomerPortal'
import ChefPortal from './pages/ChefPortal'
import './App.css'

const oktaAuth = new OktaAuth({
  issuer: `https://${import.meta.env.VITE_OKTA_DOMAIN}/oauth2/default`,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: window.location.origin + '/login/callback',
})

function App() {
  const navigate = useNavigate()
  
  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin))
  }

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/customer" element={<CustomerPortal />} />
        <Route path="/chef" element={<ChefPortal />} />
      </Routes>
    </Security>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
