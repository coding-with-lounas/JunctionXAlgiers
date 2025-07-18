"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Fish, Home, Settings, Menu, Droplets, ArrowLeft, Save, Upload, User, LogOut, Edit3, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationCenter } from "@/components/notification-center"

const availableRoles = [
  "Farm Manager",
  "Operations Manager",
  "System Operator",
  "Aquaculture Specialist",
  "Water Quality Technician",
  "Maintenance Supervisor",
  "Data Analyst",
  "Research Coordinator",
]

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, updateProfile, logout, isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    email: "",
    profileImage: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        role: user.role,
        email: user.email,
        profileImage: user.profileImage || "",
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setProfileData((prev) => ({
          ...prev,
          profileImage: imageUrl,
        }))
        setHasChanges(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    try {
      // Update the user profile through auth context
      await updateProfile({
        name: profileData.name,
        role: profileData.role,
        email: profileData.email,
        profileImage: profileData.profileImage,
      })

      setHasChanges(false)
      setIsEditing(false)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const cancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name,
        role: user.role,
        email: user.email,
        profileImage: user.profileImage || "",
      })
    }
    setHasChanges(false)
    setIsEditing(false)
  }

  const SidebarContent = () => {
    if (!user) return null

    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Fish className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-lg">AquaCulture AI</h2>
              <p className="text-sm text-muted-foreground">Smart Monitoring</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push("/")}>
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                // Find the most dangerous bassin (mock data for this context)
                const bassins = [
                  { id: "bassin-1", status: "excellent", activeAlerts: 0 },
                  { id: "bassin-2", status: "good", activeAlerts: 1 },
                  { id: "bassin-3", status: "warning", activeAlerts: 2 },
                  { id: "bassin-4", status: "excellent", activeAlerts: 0 },
                  { id: "bassin-5", status: "poor", activeAlerts: 4 },
                  { id: "bassin-6", status: "good", activeAlerts: 0 },
                ]

                const mostDangerousBassin = bassins.reduce((worst, current) => {
                  const getStatusPriority = (status: string) => {
                    switch (status) {
                      case "poor":
                        return 4
                      case "warning":
                        return 3
                      case "good":
                        return 2
                      case "excellent":
                        return 1
                      default:
                        return 0
                    }
                  }

                  const currentPriority = getStatusPriority(current.status) + current.activeAlerts * 0.1
                  const worstPriority = getStatusPriority(worst.status) + worst.activeAlerts * 0.1

                  return currentPriority > worstPriority ? current : worst
                })

                router.push(`/bassin/${mostDangerousBassin.id}`)
              }}
            >
              <Droplets className="h-4 w-4" />
              Live Monitor
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </nav>
        {/* Profile Section */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage || "/placeholder.svg?height=40&width=40"} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              onClick={logout}
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Loading Profile</h2>
            <p className="text-sm text-gray-600">Please wait while we load your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Redirecting to Login</h2>
          <p className="text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-blue-600 lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-600">Manage your account information</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={cancelEdit} variant="outline" className="gap-2 bg-transparent">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={saveProfile} disabled={!hasChanges} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
                <NotificationCenter />
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture. Recommended size: 400x400px</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profileData.profileImage || "/placeholder.svg?height=96&width=96"}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!isEditing}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={!isEditing} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload New Picture
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and role information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  {isEditing ? (
                    <Select value={profileData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="role" value={profileData.role} disabled className="bg-gray-50" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View your account details and login information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                    <p className="text-sm font-medium">Standard User</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="text-sm font-medium">January 2024</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <p className="text-sm font-medium">Today at {new Date().toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that affect your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
