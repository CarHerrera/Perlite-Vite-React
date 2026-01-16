import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import '@vitejs/plugin-react/preamble'
import CustomScene from './excal.tsx'
import Bases from './bases.tsx'
const SiteSettings = {
    uriPath: "/",
    vaultName: "Demo",
}
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <CustomScene />
  </StrictMode>,
)

createRoot(document.getElementById('TheBase')!).render(
  <StrictMode>
    <Bases props={SiteSettings}/>
  </StrictMode>,
)
