import { Navigate, Route, Routes } from 'react-router-dom'
import Menu from '../pages/Menu'
import Cart from '../pages/Cart'
import Login from '../pages/Login'
import Success from '../pages/Success'
import AdminLogin from '../pages/AdminLogin'
import AdminDashboard from '../pages/AdminDashboard'
import AdminMenuManager from '../pages/AdminMenuManager'
import AdminReports from '../pages/AdminReports'
import AdminUsers from '../pages/AdminUsers'
import CustomerDashboard from '../pages/CustomerDashboard'
import ProtectedRoute from '../components/common/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/success" element={<Success />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute adminOnly>
            <AdminMenuManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOnly>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  )
}

export default AppRoutes
