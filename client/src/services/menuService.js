import { api } from './api'
import { mockMenu } from './mockData'

const useMocks = import.meta.env.VITE_ENABLE_MOCKS === 'true'

export async function fetchMenu() {
  try {
    const response = await api.get('/menu')
    return response.data || response
  } catch (error) {
    if (useMocks) return mockMenu
    throw error
  }
}
