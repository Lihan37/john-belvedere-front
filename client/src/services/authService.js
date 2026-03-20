import { api } from './api'
import { getAllowedAdminPhones, sanitizePhone, storage } from '../utils/helpers'

const useMocks = import.meta.env.VITE_ENABLE_MOCKS === 'true'

function buildMockToken(user) {
  return btoa(JSON.stringify({ sub: user.id, role: user.role }))
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me')
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const authState = storage.get('jb_auth', { user: null })
    if (!authState?.user) {
      throw new Error('Invalid or expired token.')
    }
    return { user: authState.user }
  }
}

export async function registerCustomer(payload) {
  try {
    const response = await api.post('/auth/register', payload)
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const user = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email || '',
      phone: payload.phone || '',
      role: 'customer',
    }
    const token = buildMockToken(user)
    storage.set('jb_registered_users', [
      ...(storage.get('jb_registered_users', [])),
      { ...user, password: payload.password },
    ])
    return { user }
  }
}

export async function loginCustomer(payload) {
  try {
    const response = await api.post('/auth/login', payload)
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const users = storage.get('jb_registered_users', [])
    const user = users.find((entry) => {
      const matchesIdentity =
        entry.email === payload.identity || entry.phone === payload.identity
      return matchesIdentity && entry.password === payload.password
    })
    if (!user) throw new Error('Invalid customer credentials.')
    const token = buildMockToken(user)
    return { user: { ...user, password: undefined } }
  }
}

export async function loginAdmin(payload) {
  try {
    const response = await api.post('/auth/login', {
      phone: sanitizePhone(payload.phone),
      password: payload.password,
      role: 'admin',
    })
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const allowedPhones = getAllowedAdminPhones()
    const phone = sanitizePhone(payload.phone)
    if (!allowedPhones.includes(phone)) {
      throw new Error('This phone number is not authorized for admin access.')
    }
    const user = {
      id: 'admin-1',
      name: 'Admin',
      phone,
      role: 'admin',
    }
    return { user }
  }
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout', {})
  } catch (error) {
    if (!useMocks) throw error
  }
}

export async function requestPasswordReset(payload) {
  const response = await api.post('/auth/forgot-password', payload)
  return response.data || response
}

export async function resetPassword(payload) {
  const response = await api.post('/auth/reset-password', payload)
  return response.data || response
}
