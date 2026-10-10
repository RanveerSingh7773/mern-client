import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// 🚀 Wake up Render backend IMMEDIATELY on app load (before user even scrolls)
// This eliminates cold start delay by the time products section is visible
const API_URL = import.meta.env.VITE_API_URL || 'https://mern-back-a2r1.onrender.com';
fetch(`${API_URL}/api/products`, { method: 'GET' }).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)

