"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  email: string
  name: string
  role: string
  isAuthenticated: boolean
  profileImage?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("aquaculture-user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        if (userData.isAuthenticated) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("aquaculture-user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        // User is not authenticated and not on login page - redirect to login
        router.push("/login")
      } else if (user && pathname === "/login") {
        // User is authenticated but on login page - redirect to dashboard
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("aquaculture-user", JSON.stringify(userData))
    // Redirect to dashboard after login
    router.push("/")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("aquaculture-user")
    // Redirect to login page after logout
    router.push("/login")
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedUser = {
      ...user,
      ...profileData,
    }

    setUser(updatedUser)
    localStorage.setItem("aquaculture-user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
