import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "@/index.css"
import { ErrorBoundary } from "@/components/common/ErrorBoundary.tsx"

import "@/config/gsap.ts"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
