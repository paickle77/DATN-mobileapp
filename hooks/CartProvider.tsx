import React, { createContext, useContext, useState, ReactNode } from 'react'

export type CartItem = {
  image: any
  id: string
  name: string
  price: number
  quantity: number
  selected?: boolean
}

type CartContextType = {
  cartItems: CartItem[]
  getSelectedTotal: () => number
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  getSelectedTotal: () => 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    // bạn có thể khởi tạo từ AsyncStorage hoặc API
  ])

  const getSelectedTotal = () =>
    cartItems
      .filter(i => i.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, getSelectedTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
