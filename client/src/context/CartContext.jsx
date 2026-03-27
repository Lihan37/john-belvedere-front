import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { calculateCartTotal, storage } from '../utils/helpers'
import { useAuth } from './useAuth'

const CartContext = createContext(null)
const guestStorageKey = 'jb_cart_guest'

function getCartStorageKey(user) {
  if (!user) return guestStorageKey

  const identity = user._id || user.email || user.phone
  return identity ? `jb_cart_${identity}` : guestStorageKey
}

export function CartProvider({ children }) {
  const { authReady, user } = useAuth()
  const storageKey = useMemo(() => getCartStorageKey(user), [user])
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!authReady) return
    setItems(storage.get(storageKey, []))
  }, [authReady, storageKey])

  useEffect(() => {
    if (!authReady) return
    storage.set(storageKey, items)
  }, [authReady, items, storageKey])

  const addToCart = (menuItem) => {
    setItems((current) => {
      const existing = current.find((item) => item._id === menuItem._id)
      if (existing) {
        return current.map((item) =>
          item._id === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...current, { ...menuItem, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item._id !== itemId))
      return
    }
    setItems((current) =>
      current.map((item) => (item._id === itemId ? { ...item, quantity } : item)),
    )
  }

  const removeFromCart = (itemId) => {
    setItems((current) => current.filter((item) => item._id !== itemId))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateCartTotal(items),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
