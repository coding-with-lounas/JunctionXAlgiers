"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Droplets,
  Fish,
  Home,
  Settings,
  Menu,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  LogOut,
  User,
  History,
  Download,
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Add the useAuth import at the top
import { useAuth } from "@/lib/auth-context"
import { bassinHistoryService, type BassinHistoryEntry } from "@/lib/bassin-history"
import { NotificationCenter } from "@/components/notification-center"
import { notificationService } from "@/lib/notification-system"

// Mock data generators
const generateSensorData = () => ({
  temperature: Math.random() * 5 + 18, // 18-23°C
  ph: Math.random() * 1.5 + 6.5, // 6.5-8.0
  dissolvedOxygen: Math.random() * 3 + 6, // 6-9 mg/L
  ammonia: Math.random() * 2 + 0.1,
  nitrite: Math.random() * 1 + 0.05,
  nitrate: Math.random() * 40 + 5,
  waterLevel: Math.random() * 20 + 80,
  turbidity: Math.random() * 10 + 2, // 2-12 NTU
  timestamp: new Date().toISOString(),
})

const generateHistoricalData = (hours = 24) => {
  const data = []
  for (let i = hours; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      fullTime: time.toLocaleString(),
      temperature: Math.random() * 5 + 18,
      ph: Math.random() * 1.5 + 6.5,
      dissolvedOxygen: Math.random() * 3 + 6,
      ammonia: Math.random() * 2 + 0.1,
      nitrite: Math.random() * 1 + 0.05,
      nitrate: Math.random() * 40 + 5,
      waterLevel: Math.random() * 20 + 80,
      turbidity: Math.random() * 10 + 2,
    })
  }
  return data
}

const BassinMonitoring = () => {
  const [settings, setSettings] = useState({
    thresholds: {
      temperature: { safe: 20, warning: 22 },
      ph: { safe: 7.5, warning: 8.0 },
      dissolvedOxygen: { safe: 7, warning: 6.5 },
      ammonia: { safe: 0.5, warning: 1.0 },
      nitrite: { safe: 0.2, warning: 0.5 },
      nitrate: { safe: 20, warning: 30 },
      waterLevel: { safe: 90, warning: 85 },
      turbidity: { safe: 5, warning: 8 },
    },
    display: {
      refreshInterval: 3000,
    },
  })

  const router = useRouter()
  const params = useParams()
  const bassinId = params.id as string

  const [sensorData, setSensorData] = useState(generateSensorData())
  const [historicalData, setHistoricalData] = useState(generateHistoricalData())
  const [alerts, setAlerts] = useState<
    Array<{ id: string; message: string; timestamp: string; type: "warning" | "danger" }>
  >([])
  const [selectedParameter, setSelectedParameter] = useState("temperature")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [historyData, setHistoryData] = useState<BassinHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyStats, setHistoryStats] = useState({
    totalEntries: 0,
    dateRange: { start: "", end: "" },
    averages: {},
  })

  const currentBassin = {
    "bassin-1": { name: "Bassin Alpha", location: "North Section", fishType: "Salmon", capacity: "50,000L" },
    "bassin-2": { name: "Bassin Beta", location: "East Section", fishType: "Trout", capacity: "35,000L" },
    "bassin-3": { name: "Bassin Gamma", location: "South Section", fishType: "Bass", capacity: "42,000L" },
    "bassin-4": { name: "Bassin Delta", location: "West Section", fishType: "Catfish", capacity: "60,000L" },
    "bassin-5": { name: "Bassin Epsilon", location: "Central Section", fishType: "Tilapia", capacity: "45,000L" },
    "bassin-6": { name: "Bassin Zeta", location: "North Section", fishType: "Salmon", capacity: "55,000L" },
  }[bassinId] || {
    name: "Unknown Bassin",
    location: "Unknown",
    fishType: "Unknown",
    capacity: "Unknown",
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("aquaculture-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({
          ...prev,
          thresholds: parsed.thresholds || prev.thresholds,
          display: { refreshInterval: parsed.display?.refreshInterval || prev.display.refreshInterval },
        }))
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  const getStatusColor = (value: number, parameter: keyof typeof settings.thresholds) => {
    const thresholds = settings.thresholds[parameter]
    if (!thresholds) return "bg-gray-500"

    // Special handling for parameters where lower is worse
    if (parameter === "dissolvedOxygen" || parameter === "waterLevel") {
      if (value >= thresholds.safe) return "bg-green-500"
      if (value >= thresholds.warning) return "bg-yellow-500"
      return "bg-red-500"
    }

    // Normal handling for parameters where higher is worse
    if (value <= thresholds.safe) return "bg-green-500"
    if (value <= thresholds.warning) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusText = (value: number, parameter: keyof typeof settings.thresholds) => {
    const thresholds = settings.thresholds[parameter]
    if (!thresholds) return "Unknown"

    // Special handling for parameters where lower is worse
    if (parameter === "dissolvedOxygen" || parameter === "waterLevel") {
      if (value >= thresholds.safe) return "Safe"
      if (value >= thresholds.warning) return "Warning"
      return "Danger"
    }

    // Normal handling for parameters where higher is worse
    if (value <= thresholds.safe) return "Safe"
    if (value <= thresholds.warning) return "Warning"
    return "Danger"
  }

  const getParameterUnit = (parameter: string) => {
    switch (parameter) {
      case "temperature":
        return "°C"
      case "ph":
        return ""
      case "dissolvedOxygen":
        return " mg/L"
      case "ammonia":
        return " mg/L"
      case "nitrite":
        return " mg/L"
      case "nitrate":
        return " mg/L"
      case "waterLevel":
        return "%"
      case "turbidity":
        return " NTU"
      default:
        return ""
    }
  }

  const getParameterName = (parameter: string) => {
    switch (parameter) {
      case "dissolvedOxygen":
        return "Dissolved Oxygen"
      case "waterLevel":
        return "Water Level"
      default:
        return parameter.charAt(0).toUpperCase() + parameter.slice(1)
    }
  }

  const saveSensorDataToHistory = (data: any) => {
    bassinHistoryService.addEntry(bassinId, {
      temperature: data.temperature,
      ph: data.ph,
      dissolvedOxygen: data.dissolvedOxygen,
      ammonia: data.ammonia,
      nitrite: data.nitrite,
      nitrate: data.nitrate,
      waterLevel: data.waterLevel,
      turbidity: data.turbidity,
      status: getOverallStatus(data),
      activeAlerts: alerts.length,
      notes: `Automated data collection - ${alerts.length > 0 ? "Alerts active" : "Normal operation"}`,
    })
  }

  const getOverallStatus = (data: any) => {
    const scores = {
      temperature: Math.max(0, 1 - Math.abs(data.temperature - 20) / 5),
      ph: Math.max(0, 1 - Math.abs(data.ph - 7.2) / 1.5),
      dissolvedOxygen: Math.max(0, (data.dissolvedOxygen - 5) / 4),
      ammonia: Math.max(0, 1 - data.ammonia / 2),
      nitrite: Math.max(0, 1 - data.nitrite / 1),
      nitrate: Math.max(0, 1 - data.nitrate / 40),
      waterLevel: Math.max(0, data.waterLevel / 100),
      turbidity: Math.max(0, 1 - data.turbidity / 15),
    }

    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length

    if (avgScore > 0.8) return "excellent"
    if (avgScore > 0.6) return "good"
    if (avgScore > 0.4) return "warning"
    return "poor"
  }

  const loadHistoryData = () => {
    const history = bassinHistoryService.getHistory(bassinId, 100) // Load last 100 entries
    const stats = bassinHistoryService.getHistoryStats(bassinId)
    setHistoryData(history)
    setHistoryStats(stats)
  }

  const exportHistory = () => {
    bassinHistoryService.exportToCsv(bassinId, currentBassin.name)
  }

  // Add this after the existing useEffect for real-time data updates
  useEffect(() => {
    loadHistoryData()
  }, [bassinId])

  // Simulate real-time data updates
  useEffect(() => {
    let saveCounter = 0
    const interval = setInterval(() => {
      const newData = generateSensorData()
      setSensorData(newData)

      // Update historical data
      setHistoricalData((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          fullTime: new Date().toLocaleString(),
          ...newData,
        }
        return [...prev.slice(1), newPoint]
      })

      // Save to history every 5 minutes (100 intervals of 3 seconds)
      saveCounter++
      if (saveCounter >= 100) {
        saveSensorDataToHistory(newData)
        loadHistoryData() // Refresh history display
        saveCounter = 0
      }

      // Check for alerts using settings thresholds
      const newAlerts = []

      // Check all parameters for alerts
      Object.entries(newData).forEach(([key, value]) => {
        if (key === "timestamp") return

        const thresholds = settings.thresholds[key as keyof typeof settings.thresholds]
        if (!thresholds) return

        let isAlert = false
        let alertType: "warning" | "danger" = "warning"

        if (key === "dissolvedOxygen" || key === "waterLevel") {
          // Lower values are worse
          if (value < thresholds.warning) {
            isAlert = true
            alertType = value < thresholds.warning * 0.8 ? "danger" : "warning"
          }
        } else {
          // Higher values are worse
          if (value > thresholds.warning) {
            isAlert = true
            alertType = value > thresholds.warning * 1.5 ? "danger" : "warning"
          }
        }

        if (isAlert) {
          const parameterName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")
          const unit = getParameterUnit(key)
          newAlerts.push({
            id: Date.now() + "-" + key,
            message: `${alertType === "danger" ? "Critical" : "High"} ${parameterName.toLowerCase()} levels detected: ${typeof value === "number" ? value.toFixed(2) : value}${unit}`,
            timestamp: new Date().toLocaleTimeString(),
            type: alertType,
          })
        }
      })

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10))

        // Generate notifications for the current bassin
        notificationService.generateBassinRiskNotification({
          id: bassinId,
          name: currentBassin.name,
          status: getOverallStatus(newData),
          activeAlerts: newAlerts.length,
          ...newData,
        })
      }
    }, settings.display.refreshInterval)

    return () => clearInterval(interval)
  }, [settings.thresholds, settings.display.refreshInterval, bassinId, alerts.length, currentBassin.name])

  // Generate AI prediction
  const getAIPrediction = () => {
    const scores = {
      temperature: Math.max(0, 1 - Math.abs(sensorData.temperature - 20) / 5),
      ph: Math.max(0, 1 - Math.abs(sensorData.ph - 7.2) / 1.5),
      dissolvedOxygen: Math.max(0, (sensorData.dissolvedOxygen - 5) / 4),
      ammonia: Math.max(0, 1 - sensorData.ammonia / 2),
      nitrite: Math.max(0, 1 - sensorData.nitrite / 1),
      nitrate: Math.max(0, 1 - sensorData.nitrate / 40),
      waterLevel: Math.max(0, sensorData.waterLevel / 100),
      turbidity: Math.max(0, 1 - sensorData.turbidity / 15),
    }

    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length

    if (avgScore > 0.8) return { quality: "Excellent", confidence: 95, color: "bg-green-500" }
    if (avgScore > 0.6) return { quality: "Good", confidence: 87, color: "bg-blue-500" }
    if (avgScore > 0.4) return { quality: "Fair", confidence: 78, color: "bg-yellow-500" }
    return { quality: "Poor", confidence: 92, color: "bg-red-500" }
  }

  const aiPrediction = getAIPrediction()
  const bacterialCount = Math.floor(Math.random() * 200000 + 50000)

  // Chart configurations for each parameter
  const chartConfigs = {
    temperature: {
      temperature: {
        label: "Temperature",
        color: "hsl(var(--chart-1))",
      },
    },
    ph: {
      ph: {
        label: "pH Level",
        color: "hsl(var(--chart-2))",
      },
    },
    dissolvedOxygen: {
      dissolvedOxygen: {
        label: "Dissolved Oxygen",
        color: "hsl(var(--chart-3))",
      },
    },
    ammonia: {
      ammonia: {
        label: "Ammonia",
        color: "hsl(var(--chart-4))",
      },
    },
    nitrite: {
      nitrite: {
        label: "Nitrite",
        color: "hsl(var(--chart-5))",
      },
    },
    nitrate: {
      nitrate: {
        label: "Nitrate",
        color: "hsl(var(--chart-1))",
      },
    },
    waterLevel: {
      waterLevel: {
        label: "Water Level",
        color: "hsl(var(--chart-2))",
      },
    },
    turbidity: {
      turbidity: {
        label: "Turbidity",
        color: "hsl(var(--chart-3))",
      },
    },
  }

  const SidebarContent = () => {
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
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push("/")}>
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant="default"
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

  // Add authentication check in the main component
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Loading Bassin Data</h2>
            <p className="text-sm text-gray-600">Please wait while we load the monitoring data...</p>
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
                  <Fish className="h-8 w-8 text-blue-600 lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentBassin.name}</h1>
                    <p className="text-sm text-gray-600">
                      {currentBassin.location} • {currentBassin.fishType} • {currentBassin.capacity}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </Badge>
                <NotificationCenter />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Live Sensor Data - Enhanced with more parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.temperature.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">°C</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.temperature, "temperature")} text-white`}>
                      {getStatusText(sensorData.temperature, "temperature")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">pH Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.ph.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">pH</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.ph, "ph")} text-white`}>
                      {getStatusText(sensorData.ph, "ph")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dissolved Oxygen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.dissolvedOxygen.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">mg/L</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.dissolvedOxygen, "dissolvedOxygen")} text-white`}>
                      {getStatusText(sensorData.dissolvedOxygen, "dissolvedOxygen")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Water Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.waterLevel.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">%</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.waterLevel, "waterLevel")} text-white`}>
                      {getStatusText(sensorData.waterLevel, "waterLevel")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ammonia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.ammonia.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">mg/L</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.ammonia, "ammonia")} text-white`}>
                      {getStatusText(sensorData.ammonia, "ammonia")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Nitrite</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.nitrite.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">mg/L</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.nitrite, "nitrite")} text-white`}>
                      {getStatusText(sensorData.nitrite, "nitrite")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Nitrate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.nitrate.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">mg/L</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.nitrate, "nitrate")} text-white`}>
                      {getStatusText(sensorData.nitrate, "nitrate")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Turbidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{sensorData.turbidity.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">NTU</p>
                    </div>
                    <Badge className={`${getStatusColor(sensorData.turbidity, "turbidity")} text-white`}>
                      {getStatusText(sensorData.turbidity, "turbidity")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Prediction Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Water Quality Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${aiPrediction.color} text-white px-3 py-1`}>{aiPrediction.quality}</Badge>
                      <span className="text-sm text-muted-foreground">Confidence: {aiPrediction.confidence}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on current sensor readings and historical patterns
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Estimated Bacterial Count</div>
                    <div className="text-2xl font-bold">{bacterialCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">CFU/mL</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section - Fixed with all parameters */}
            <Card>
              <CardHeader>
                <CardTitle>24-Hour Trends</CardTitle>
                <CardDescription>Historical data for all water quality parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedParameter} onValueChange={setSelectedParameter}>
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="temperature">Temp</TabsTrigger>
                    <TabsTrigger value="ph">pH</TabsTrigger>
                    <TabsTrigger value="dissolvedOxygen">DO</TabsTrigger>
                    <TabsTrigger value="ammonia">NH₃</TabsTrigger>
                    <TabsTrigger value="nitrite">NO₂</TabsTrigger>
                    <TabsTrigger value="nitrate">NO₃</TabsTrigger>
                    <TabsTrigger value="waterLevel">Level</TabsTrigger>
                    <TabsTrigger value="turbidity">Turbidity</TabsTrigger>
                  </TabsList>

                  {Object.keys(chartConfigs).map((parameter) => (
                    <TabsContent key={parameter} value={parameter} className="mt-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">{getParameterName(parameter)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current:{" "}
                          {(sensorData[parameter as keyof typeof sensorData] as number).toFixed(
                            parameter === "ph" ? 2 : 1,
                          )}
                          {getParameterUnit(parameter)}
                        </p>
                      </div>
                      <ChartContainer
                        config={chartConfigs[parameter as keyof typeof chartConfigs]}
                        className="h-[400px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 12 }} />
                            <YAxis
                              className="text-xs"
                              tick={{ fontSize: 12 }}
                              domain={["dataMin - 1", "dataMax + 1"]}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name) => [
                                    `${(value as number).toFixed(parameter === "ph" ? 2 : 1)}${getParameterUnit(parameter)}`,
                                    getParameterName(parameter),
                                  ]}
                                  labelFormatter={(label) => `Time: ${label}`}
                                />
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey={parameter}
                              stroke={`var(--color-${parameter})`}
                              strokeWidth={2}
                              dot={{ fill: `var(--color-${parameter})`, strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Alerts & Logs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alerts & Logs
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setAlerts([])} disabled={alerts.length === 0}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">No active alerts</span>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <Alert
                        key={alert.id}
                        className={
                          alert.type === "danger" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
                        }
                      >
                        <AlertTriangle
                          className={`h-4 w-4 ${alert.type === "danger" ? "text-red-600" : "text-yellow-600"}`}
                        />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <span>{alert.message}</span>
                            <span className="text-xs text-muted-foreground ml-2">{alert.timestamp}</span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Data History
                    </CardTitle>
                    <CardDescription>Historical sensor data and system logs for {currentBassin.name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                      {showHistory ? "Hide History" : "Show History"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportHistory}
                      disabled={historyData.length === 0}
                      className="gap-2 bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* History Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{historyStats.totalEntries}</div>
                    <p className="text-sm text-blue-600">Total Records</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Date Range</div>
                    <p className="text-xs text-green-600">
                      {historyStats.dateRange.start && historyStats.dateRange.end
                        ? `${historyStats.dateRange.start} - ${historyStats.dateRange.end}`
                        : "No data available"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">Avg Temperature</div>
                    <p className="text-lg font-bold text-purple-600">
                      {historyStats.averages.temperature ? `${historyStats.averages.temperature.toFixed(1)}°C` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* History Table */}
                {showHistory && (
                  <div className="space-y-4">
                    {historyData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No historical data available yet.</p>
                        <p className="text-sm">Data is automatically saved every 5 minutes during monitoring.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-2">Date & Time</th>
                              <th className="text-left p-2">Temp (°C)</th>
                              <th className="text-left p-2">pH</th>
                              <th className="text-left p-2">DO (mg/L)</th>
                              <th className="text-left p-2">NH₃ (mg/L)</th>
                              <th className="text-left p-2">NO₂ (mg/L)</th>
                              <th className="text-left p-2">NO₃ (mg/L)</th>
                              <th className="text-left p-2">Level (%)</th>
                              <th className="text-left p-2">Turbidity</th>
                              <th className="text-left p-2">Status</th>
                              <th className="text-left p-2">Alerts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyData.slice(0, 20).map((entry) => (
                              <tr key={entry.id} className="border-b hover:bg-muted/25">
                                <td className="p-2 font-mono text-xs">{new Date(entry.timestamp).toLocaleString()}</td>
                                <td className="p-2">{entry.temperature.toFixed(1)}</td>
                                <td className="p-2">{entry.ph.toFixed(2)}</td>
                                <td className="p-2">{entry.dissolvedOxygen.toFixed(1)}</td>
                                <td className="p-2">{entry.ammonia.toFixed(3)}</td>
                                <td className="p-2">{entry.nitrite.toFixed(3)}</td>
                                <td className="p-2">{entry.nitrate.toFixed(1)}</td>
                                <td className="p-2">{entry.waterLevel.toFixed(1)}</td>
                                <td className="p-2">{entry.turbidity.toFixed(1)}</td>
                                <td className="p-2">
                                  <Badge
                                    className={`${getStatusColor(entry.temperature, "temperature")} text-white text-xs`}
                                  >
                                    {entry.status}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  {entry.activeAlerts > 0 ? (
                                    <Badge variant="destructive" className="text-xs">
                                      {entry.activeAlerts}
                                    </Badge>
                                  ) : (
                                    <span className="text-green-600 text-xs">None</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {historyData.length > 20 && (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            Showing latest 20 entries of {historyData.length} total records.
                            <br />
                            Export to CSV to view all data.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default BassinMonitoring
