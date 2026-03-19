import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  loginAdmin,
  loginCustomer,
  registerCustomer,
} from '../services/authService'
import { storage } from '../utils/helpers'

const AuthContext = createContext(null)
const storageKey = 'jb_auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() =>
    storage.get(storageKey, {
      user: null,
      token: null,
    }),
  )
  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    storage.set(storageKey, auth)
  }, [auth])

  useEffect(() => {
    let active = true

    async function hydrateAuth() {
      if (!auth?.token) {
        if (active) setAuthReady(true)
        return
      }

      try {
        const response = await getCurrentUser(auth.token)
        if (!active) return
        setAuth((current) => ({
          ...current,
          user: response.user,
        }))
      } catch {
        if (!active) return
        setAuth({ user: null, token: null })
      } finally {
        if (active) setAuthReady(true)
      }
    }

    hydrateAuth()

    return () => {
      active = false
    }
  }, [])

  const signUp = async (payload) => {
    setLoading(true)
    try {
      const response = await registerCustomer(payload)
      setAuth(response)
      return response
    } finally {
      setLoading(false)
    }
  }

  const login = async (payload) => {
    setLoading(true)
    try {
      const response = await loginCustomer(payload)
      setAuth(response)
      return response
    } finally {
      setLoading(false)
    }
  }

  const loginAsAdmin = async (payload) => {
    setLoading(true)
    try {
      const response = await loginAdmin(payload)
      setAuth(response)
      return response
    } finally {
      setLoading(false)
    }
  }

  const logout = () => setAuth({ user: null, token: null })

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isAuthenticated: Boolean(auth.token),
        isAdmin: auth.user?.role === 'admin',
        authReady,
        loading,
        signUp,
        login,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
