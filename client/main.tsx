import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import '@vitejs/plugin-react/preamble'
import CustomScene from './excal.tsx'


createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <CustomScene />
  </StrictMode>,
)

