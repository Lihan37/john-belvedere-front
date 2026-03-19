import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  const { isAuthenticated, isAdmin, authReady } = useAuth()

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="glass-panel rounded-[24px] px-5 py-4 text-sm text-muted">
          Verifying session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/menu" replace />
  }

  return children
}

export default ProtectedRoute
