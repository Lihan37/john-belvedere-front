import { api } from './api'
import { storage } from '../utils/helpers'
import { mockOrders } from './mockData'

const useMocks = import.meta.env.VITE_ENABLE_MOCKS === 'true'
const storageKey = 'jb_mock_orders'

function getMockOrders() {
  const stored = storage.get(storageKey, [])
  if (stored.length) return stored
  storage.set(storageKey, mockOrders)
  return mockOrders
}

export async function createOrder(payload, token) {
  try {
    const response = await api.post('/orders', payload)
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const nextOrder = {
      _id: crypto.randomUUID(),
      ...payload,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    }
    storage.set(storageKey, [nextOrder, ...getMockOrders()])
    return nextOrder
  }
}

export async function fetchOrders(token) {
  try {
    const response = await api.get('/orders')
    return response.data || response
  } catch (error) {
    if (useMocks) return getMockOrders()
    throw error
  }
}

export async function fetchMyOrders() {
  try {
    const response = await api.get('/orders/my')
    return response.data || response
  } catch (error) {
    if (useMocks) {
      return getMockOrders()
    }
    throw error
  }
}

export async function updateOrderStatus(orderId, status, token) {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status })
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const updatedOrders = getMockOrders().map((order) =>
      order._id === orderId ? { ...order, status } : order,
    )
    storage.set(storageKey, updatedOrders)
    return updatedOrders.find((order) => order._id === orderId)
  }
}
