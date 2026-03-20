import { api } from './api'

export async function fetchMenu() {
  const response = await api.get('/menu')
  return response.data || response
}
