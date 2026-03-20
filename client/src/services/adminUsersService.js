import { api } from './api'

export async function fetchAdminUsers({ page = 1, limit = 50, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (search.trim()) {
    params.set('search', search.trim())
  }

  const response = await api.get(`/auth/users?${params.toString()}`)
  return response.data || response
}
