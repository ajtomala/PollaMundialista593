import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashPage from '@/pages/SplashPage'
import AppPage from '@/pages/AppPage'
import { useStore } from '@/store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, group } = useStore()
  return user && group ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
