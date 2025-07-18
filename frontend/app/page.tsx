"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Fish,
  Home,
  Settings,
  Menu,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  History,
  LogOut,
  User,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { NotificationCenter } from "@/components/notification-center"
import { notificationService } from "@/lib/notification-system"

// Mock bassin data - this would come from a database in a real app
const initialBassins = [
  {
    id: "bassin-1",
    name: "Bassin Alpha",
    location: "North Section",
    fishType: "Salmon",
    capacity: "50,000L",
    status: "excellent",
    temperature: 18.5,
    ph: 7.2,
    activeAlerts: 0,
    lastUpdated: "2 min ago",
    dateCreated: "2024-01-15",
    description: "Primary salmon breeding bassin with advanced filtration system",
  },
  {
    id: "bassin-2",
    name: "Bassin Beta",
    location: "East Section",
    fishType: "Trout",
    capacity: "35,000L",
    status: "good",
    temperature: 16.8,
    ph: 7.0,
    activeAlerts: 1,
    lastUpdated: "1 min ago",
    dateCreated: "2024-01-20",
    description: "Secondary trout cultivation bassin with temperature control",
  },
  {
    id: "bassin-3",
    name: "Bassin Gamma",
    location: "South Section",
    fishType: "Bass",
    capacity: "42,000L",
    status: "warning",
    temperature: 20.1,
    ph: 6.8,
    activeAlerts: 2,
    lastUpdated: "3 min ago",
    dateCreated: "2024-02-01",
    description: "Bass breeding facility with automated feeding system",
  },
  {
    id: "bassin-4",
    name: "Bassin Delta",
    location: "West Section",
    fishType: "Catfish",
    capacity: "60,000L",
    status: "excellent",
    temperature: 22.3,
    ph: 7.4,
    activeAlerts: 0,
    lastUpdated: "1 min ago",
    dateCreated: "2024-02-10",
    description: "Large capacity catfish production bassin",
  },
  {
    id: "bassin-5",
    name: "Bassin Epsilon",
    location: "Central Section",
    fishType: "Tilapia",
    capacity: "45,000L",
    status: "poor",
    temperature: 25.2,
    ph: 6.5,
    activeAlerts: 4,
    lastUpdated: "5 min ago",
    dateCreated: "2024-02-15",
    description: "Tilapia cultivation with water quality monitoring issues",
  },
  {
    id: "bassin-6",
    name: "Bassin Zeta",
    location: "North Section",
    fishType: "Salmon",
    capacity: "55,000L",
    status: "good",
    temperature: 17.9,
    ph: 7.1,
    activeAlerts: 0,
    lastUpdated: "2 min ago",
    dateCreated: "2024-02-20",
    description: "Secondary salmon bassin with enhanced oxygenation",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-500"
    case "good":
      return "bg-blue-500"
    case "warning":
      return "bg-yellow-500"
    case "poor":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "excellent":
      return <CheckCircle className="h-4 w-4" />
    case "good":
      return <TrendingUp className="h-4 w-4" />
    case "warning":
    case "poor":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

const fishTypes = ["Salmon", "Trout", "Bass", "Catfish", "Tilapia", "Carp", "Cod", "Tuna", "Mackerel", "Sardine"]

const locations = [
  "North Section",
  "South Section",
  "East Section",
  "West Section",
  "Central Section",
  "Northeast Section",
  "Northwest Section",
  "Southeast Section",
  "Southwest Section",
]

const SidebarContent = ({ router, bassins }) => {
  const { user, logout } = useAuth()

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
          <Button variant="default" className="w-full justify-start gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              // Find the most dangerous bassin
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
        <div
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => router.push("/profile")}
        >
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
            onClick={(e) => {
              e.stopPropagation()
              logout()
            }}
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const AddBassinDialog = ({ onAddBassin }) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    fishType: "",
    capacity: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      fishType: "",
      capacity: "",
      description: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.name || !formData.location || !formData.fishType || !formData.capacity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate capacity format
    const capacityRegex = /^\d+,?\d*L?$/
    if (!capacityRegex.test(formData.capacity.replace(/\s/g, ""))) {
      toast({
        title: "Invalid Capacity",
        description: "Please enter capacity in format like '50,000L' or '50000L'.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create new bassin
    const newBassin = {
      id: `bassin-${Date.now()}`,
      name: formData.name,
      location: formData.location,
      fishType: formData.fishType,
      capacity: formData.capacity.endsWith("L") ? formData.capacity : `${formData.capacity}L`,
      status: "excellent", // New bassins start with excellent status
      temperature: Math.random() * 5 + 18, // Random temperature between 18-23°C
      ph: Math.random() * 1.5 + 6.5, // Random pH between 6.5-8.0
      activeAlerts: 0, // New bassins start with no alerts
      lastUpdated: "Just now",
      dateCreated: new Date().toISOString().split("T")[0],
      description: formData.description || `${formData.fishType} cultivation bassin in ${formData.location}`,
    }

    onAddBassin(newBassin)

    toast({
      title: "Bassin Added Successfully",
      description: `${formData.name} has been added to your aquaculture system.`,
    })

    resetForm()
    setOpen(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Bassin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Bassin</DialogTitle>
          <DialogDescription>
            Create a new bassin for your aquaculture monitoring system. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Bassin Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Bassin Theta"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fishType">
                Fish Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.fishType} onValueChange={(value) => handleInputChange("fishType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fish type" />
                </SelectTrigger>
                <SelectContent>
                  {fishTypes.map((fish) => (
                    <SelectItem key={fish} value={fish}>
                      {fish}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                placeholder="e.g., 50,000L"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Enter capacity in liters (e.g., 50,000L)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this bassin..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Bassin
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bassins, setBassins] = useState(initialBassins)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const handleAddBassin = (newBassin) => {
    setBassins((prev) => [...prev, newBassin])
  }

  useEffect(() => {
    // Generate notifications for bassins at risk
    const checkBassinRisks = () => {
      bassins.forEach((bassin) => {
        // Only generate notifications for bassins with issues
        if (bassin.status === "poor" || bassin.status === "warning" || bassin.activeAlerts > 0) {
          notificationService.generateBassinRiskNotification(bassin)
        }
      })
    }

    // Check immediately and then every 5 minutes
    checkBassinRisks()
    const interval = setInterval(checkBassinRisks, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [bassins])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard</h2>
            <p className="text-sm text-gray-600">Please wait while we load your aquaculture data...</p>
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

  // Calculate accurate statistics
  const totalBassins = bassins.length
  const activeBassins = bassins.filter((b) => b.status === "excellent" || b.status === "good").length
  const totalAlerts = bassins.reduce((sum, b) => sum + b.activeAlerts, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent router={router} bassins={bassins} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent router={router} bassins={bassins} />
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
                    <SidebarContent router={router} bassins={bassins} />
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-3">
                  <Fish className="h-8 w-8 text-blue-600 lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">AquaCulture AI</h1>
                    <p className="text-sm text-gray-600">Smart Monitoring for Fish Farms</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </Badge>
                <AddBassinDialog onAddBassin={handleAddBassin} />
                <NotificationCenter />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Stats - Now Accurate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Bassins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalBassins}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalBassins === 1 ? "Monitoring system active" : "Monitoring systems active"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Bassins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{activeBassins}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Operating normally ({Math.round((activeBassins / totalBassins) * 100)}% healthy)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{totalAlerts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalAlerts === 0
                      ? "No alerts active"
                      : totalAlerts === 1
                        ? "Requires attention"
                        : "Require attention"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bassins Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Bassin Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalBassins} {totalBassins === 1 ? "bassin" : "bassins"} • {activeBassins} active •{" "}
                    {totalBassins - activeBassins} need attention
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Click on a bassin to view detailed monitoring</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bassins.map((bassin) => (
                  <Card
                    key={bassin.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
                    onClick={() => router.push(`/bassin/${bassin.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{bassin.name}</CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription>{bassin.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(bassin.status)} text-white gap-1`}>
                          {getStatusIcon(bassin.status)}
                          {bassin.status.charAt(0).toUpperCase() + bassin.status.slice(1)}
                        </Badge>
                        {bassin.activeAlerts > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {bassin.activeAlerts} Alert{bassin.activeAlerts > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      {/* Bassin Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fish Type</p>
                          <p className="font-medium">{bassin.fishType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-medium">{bassin.capacity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Temperature</p>
                          <p className="font-medium">{bassin.temperature.toFixed(1)}°C</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">pH Level</p>
                          <p className="font-medium">{bassin.ph.toFixed(1)}</p>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Last updated: {bassin.lastUpdated} • Created: {bassin.dateCreated}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and system management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">System Settings</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm">Alert Management</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                    <History className="h-6 w-6" />
                    <span className="text-sm">Data Export</span>
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
