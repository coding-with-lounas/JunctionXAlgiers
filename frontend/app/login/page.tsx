"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Fish, Eye, EyeOff, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

// Mock user credentials
const mockUsers = [
  {
    email: "admin@aquaculture.com",
    password: "admin123",
    name: "John Doe",
    role: "Farm Manager",
  },
  {
    email: "manager@aquaculture.com",
    password: "manager123",
    name: "Jane Smith",
    role: "Operations Manager",
  },
  {
    email: "operator@aquaculture.com",
    password: "operator123",
    name: "Mike Johnson",
    role: "System Operator",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, login, isLoading: authLoading } = useAuth()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      // Use the auth context login function
      login({
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        isAuthenticated: true,
      })

      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      })

      // Redirect will happen automatically via useEffect above
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Fish className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">AquaCulture AI</CardTitle>
          <CardDescription>Sign in to your aquaculture monitoring dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>Admin:</strong> admin@aquaculture.com / admin123
              </p>
              <p>
                <strong>Manager:</strong> manager@aquaculture.com / manager123
              </p>
              <p>
                <strong>Operator:</strong> operator@aquaculture.com / operator123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
