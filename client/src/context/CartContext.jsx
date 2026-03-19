import { createContext, useContext, useEffect, useState } from 'react'
import { calculateCartTotal, storage } from '../utils/helpers'

const CartContext = createContext(null)
const storageKey = 'jb_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => storage.get(storageKey, []))

  useEffect(() => {
    storage.set(storageKey, items)
  }, [items])

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
