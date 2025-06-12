// hooks/useCart.ts
import { useState } from 'react'

export type CartItem = {
  image: any
  id: string
  name: string
  price: number
  quantity: number
  selected?: boolean
}

export function useCart() {
  // TODO: thay bằng context hoặc redux cho toàn app
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const getSelectedTotal = () =>
    cartItems
      .filter(item => item.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0)

  return { cartItems, getSelectedTotal }
}
