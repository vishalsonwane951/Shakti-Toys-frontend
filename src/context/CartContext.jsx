import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shakti_cart') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('shakti_cart', JSON.stringify(cartItems)) }, [cartItems])

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === product._id)
      if (existing) {
        const updated = prev.map(i => i._id === product._id ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } : i)
        toast.success('Cart updated!')
        return updated
      }
      toast.success('Added to cart!')
      return [...prev, { ...product, quantity: qty }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i._id !== id))
    toast('Item removed from cart')
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCartItems(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setCartItems([])

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
