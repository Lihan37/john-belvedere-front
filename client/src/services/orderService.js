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

export async function createStripeCheckout(payload) {
  const response = await api.post('/orders/checkout/stripe', payload)
  return response.data || response
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

export async function fetchStripeCheckoutSessionStatus(sessionId) {
  const response = await api.get(`/orders/checkout/stripe/session/${sessionId}`)
  return response.data || response
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

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  try {
    const response = await api.put(`/orders/${orderId}/payment`, { paymentStatus })
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error
    const updatedOrders = getMockOrders().map((order) =>
      order._id === orderId ? { ...order, paymentStatus } : order,
    )
    storage.set(storageKey, updatedOrders)
    return updatedOrders.find((order) => order._id === orderId)
  }
}

export async function fetchDailyOrderReport(date) {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : ''
    const response = await api.get(`/orders/reports/daily${query}`)
    return response.data || response
  } catch (error) {
    if (!useMocks) throw error

    const orders = getMockOrders()
    const summary = orders.reduce(
      (accumulator, order) => {
        const totalPrice = Number(order.totalPrice || 0)
        const paymentStatus = order.paymentStatus || 'unpaid'
        const paymentMethod = order.paymentMethod || 'counter'

        accumulator.totalOrders += 1
        accumulator.totalItems += (order.items || []).reduce(
          (itemCount, item) => itemCount + Number(item.quantity || 0),
          0,
        )
        accumulator.byStatus[order.status] = (accumulator.byStatus[order.status] || 0) + 1
        accumulator.byPaymentMethod[paymentMethod] =
          (accumulator.byPaymentMethod[paymentMethod] || 0) + 1

        if (paymentStatus === 'paid') {
          accumulator.paidOrders += 1
          accumulator.paidIncome += totalPrice
        } else {
          accumulator.unpaidOrders += 1
          accumulator.unpaidAmount += totalPrice
        }

        return accumulator
      },
      {
        totalOrders: 0,
        totalItems: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        paidIncome: 0,
        unpaidAmount: 0,
        byStatus: { pending: 0, preparing: 0, served: 0 },
        byPaymentMethod: { counter: 0, stripe: 0 },
      },
    )

    return {
      date: new Date().toISOString(),
      summary,
      orders,
    }
  }
}
