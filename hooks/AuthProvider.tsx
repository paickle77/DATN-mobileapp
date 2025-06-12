import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type User = { name?: string; email?: string; phone?: string } | null
type AuthContextType = { user: User; isLoading: boolean }

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: thay bằng call API hoặc AsyncStorage của bạn
    const fake = { name: 'Nguyễn Văn A', email: 'a@e.com', phone: '0123456789' }
    setUser(fake)
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
