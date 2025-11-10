import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/tokens.css'
import './styles/global.css'
import './styles/glass.css'
import './styles/responsive.css'
import './styles/prescription.css'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
