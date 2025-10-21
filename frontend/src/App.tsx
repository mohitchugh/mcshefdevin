import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import Home from './pages/Home'
import Login from './pages/Login'
import CustomerPortal from './pages/CustomerPortal'
import ChefPortal from './pages/ChefPortal'
import './App.css'

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/chef" element={<ChefPortal />} />
        </Routes>
      </Router>
    </Auth0Provider>
  )
}

export default App
