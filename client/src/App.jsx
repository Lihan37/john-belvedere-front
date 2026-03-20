import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
