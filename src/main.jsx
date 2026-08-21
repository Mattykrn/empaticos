import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

import '/css/styles.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <FavoritesProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </FavoritesProvider>
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>
)
