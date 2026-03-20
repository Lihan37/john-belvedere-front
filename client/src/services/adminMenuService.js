import { api } from './api'

export async function fetchAdminMenuItems() {
  const response = await api.get('/menu')
  return response.data || response
}

export async function createAdminMenuItem(payload) {
  const response = await api.post('/menu', payload)
  return response.data || response
}

export async function updateAdminMenuItem(menuItemId, payload) {
  const response = await api.put(`/menu/${menuItemId}`, payload)
  return response.data || response
}

export async function deleteAdminMenuItem(menuItemId) {
  const response = await api.delete(`/menu/${menuItemId}`)
  return response.data || response
}
