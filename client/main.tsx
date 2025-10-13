import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import '@vitejs/plugin-react/preamble'
import App from './App.tsx'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
