export const APP_NAME = import.meta.env.VITE_APP_NAME || 'John Belvedere'

export const currency = (value) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value)

export const formatOrderTime = (value) =>
  new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const sanitizePhone = (value = '') => value.replace(/[^\d+]/g, '')

export const getAllowedAdminPhones = () =>
  (import.meta.env.VITE_ALLOWED_ADMIN_PHONES || '')
    .split(',')
    .map((phone) => sanitizePhone(phone))
    .filter(Boolean)

export const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key) {
    localStorage.removeItem(key)
  },
}

export const calculateCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
