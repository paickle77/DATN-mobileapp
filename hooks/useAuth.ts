// hooks/useAuth.ts
import { useState, useEffect } from 'react'

type User = {
  name?: string
  email?: string
  phone?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: thay bằng gọi API hoặc AsyncStorage
    const fakeUser: User = {
      name: 'Nguyễn Văn A',
      email: 'a@example.com',
      phone: '0123456789',
    }
    setUser(fakeUser)
    setIsLoading(false)
  }, [])

  return { user, isLoading }
}
