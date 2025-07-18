"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Fish,
  Home,
  Settings,
  Menu,
  Droplets,
  ArrowLeft,
  Save,
  Bell,
  Monitor,
  Palette,
  Database,
  LogOut,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { NotificationCenter } from "@/components/notification-center"

interface AppSettings {
  thresholds: {
    ammonia: { safe: number; warning: number }
    nitrite: { safe: number; warning: number }
    nitrate: { safe: number; warning: number }
    waterLevel: { safe: number; warning: number }
  }
  alerts: {
    emailNotifications: boolean
    soundAlerts: boolean
    pushNotifications: boolean
    alertFrequency: string
  }
  display: {
    refreshInterval: number
    temperatureUnit: string
    dateFormat: string
    theme: string
  }
  system: {
    autoRefresh: boolean
    dataRetention: number
    backupFrequency: string
    maintenanceMode: boolean
  }
}

const defaultSettings: AppSettings = {
  thresholds: {
    ammonia: { safe: 0.5, warning: 1.0 },
    nitrite: { safe: 0.2, warning: 0.5 },
    nitrate: { safe: 20, warning: 30 },
    waterLevel: { safe: 90, warning: 85 },
  },
  alerts: {
    emailNotifications: true,
    soundAlerts: false,
    pushNotifications: true,
    alertFrequency: "immediate",
  },
  display: {
    refreshInterval: 3000,
    temperatureUnit: "celsius",
    dateFormat: "12h",
    theme: "light",
  },
  system: {
    autoRefresh: true,
    dataRetention: 30,
    backupFrequency: "daily",
    maintenanceMode: false,
  },
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("aquaculture-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  const updateSettings = (section: keyof AppSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const updateThreshold = (parameter: string, type: "safe" | "warning", value: number) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [parameter]: {
          ...prev.thresholds[parameter as keyof typeof prev.thresholds],
          [type]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    try {
      localStorage.setItem("aquaculture-settings", JSON.stringify(settings))
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    })
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
            <Button variant="default" className="w-full justify-start gap-2">
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

  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Loading Settings</h2>
            <p className="text-sm text-gray-600">Please wait while we load your preferences...</p>
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
                  <Settings className="h-8 w-8 text-blue-600 lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-600">Configure your aquaculture monitoring system</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Button onClick={saveSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                )}
                <NotificationCenter />
              </div>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="thresholds" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="thresholds" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  Thresholds
                </TabsTrigger>
                <TabsTrigger value="alerts" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="display" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Display
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-2">
                  <Database className="h-4 w-4" />
                  System
                </TabsTrigger>
              </TabsList>

              {/* Water Quality Thresholds */}
              <TabsContent value="thresholds" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Water Quality Thresholds</CardTitle>
                    <CardDescription>
                      Set safe and warning levels for water quality parameters. Values above warning levels will trigger
                      alerts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(settings.thresholds).map(([parameter, values]) => (
                      <div key={parameter} className="space-y-3">
                        <h4 className="font-medium capitalize">
                          {parameter === "waterLevel" ? "Water Level" : parameter}
                          {parameter !== "waterLevel" ? " (mg/L)" : " (%)"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${parameter}-safe`}>Safe Level</Label>
                            <Input
                              id={`${parameter}-safe`}
                              type="number"
                              step="0.1"
                              value={values.safe}
                              onChange={(e) =>
                                updateThreshold(parameter, "safe", Number.parseFloat(e.target.value) || 0)
                              }
                              className="bg-green-50 border-green-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${parameter}-warning`}>Warning Level</Label>
                            <Input
                              id={`${parameter}-warning`}
                              type="number"
                              step="0.1"
                              value={values.warning}
                              onChange={(e) =>
                                updateThreshold(parameter, "warning", Number.parseFloat(e.target.value) || 0)
                              }
                              className="bg-yellow-50 border-yellow-200"
                            />
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Alert Settings */}
              <TabsContent value="alerts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Preferences</CardTitle>
                    <CardDescription>
                      Configure how and when you receive alerts about water quality issues.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                      </div>
                      <Switch
                        checked={settings.alerts.emailNotifications}
                        onCheckedChange={(checked) => updateSettings("alerts", "emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sound Alerts</Label>
                        <p className="text-sm text-muted-foreground">Play sound when alerts are triggered</p>
                      </div>
                      <Switch
                        checked={settings.alerts.soundAlerts}
                        onCheckedChange={(checked) => updateSettings("alerts", "soundAlerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.alerts.pushNotifications}
                        onCheckedChange={(checked) => updateSettings("alerts", "pushNotifications", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Alert Frequency</Label>
                      <Select
                        value={settings.alerts.alertFrequency}
                        onValueChange={(value) => updateSettings("alerts", "alertFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="5min">Every 5 minutes</SelectItem>
                          <SelectItem value="15min">Every 15 minutes</SelectItem>
                          <SelectItem value="30min">Every 30 minutes</SelectItem>
                          <SelectItem value="1hour">Every hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Display Settings */}
              <TabsContent value="display" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize how data is displayed in the dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Data Refresh Interval</Label>
                      <Select
                        value={settings.display.refreshInterval.toString()}
                        onValueChange={(value) => updateSettings("display", "refreshInterval", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1 second</SelectItem>
                          <SelectItem value="3000">3 seconds</SelectItem>
                          <SelectItem value="5000">5 seconds</SelectItem>
                          <SelectItem value="10000">10 seconds</SelectItem>
                          <SelectItem value="30000">30 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Temperature Unit</Label>
                      <Select
                        value={settings.display.temperatureUnit}
                        onValueChange={(value) => updateSettings("display", "temperatureUnit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="celsius">Celsius (°C)</SelectItem>
                          <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={settings.display.dateFormat}
                        onValueChange={(value) => updateSettings("display", "dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour format</SelectItem>
                          <SelectItem value="24h">24-hour format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={settings.display.theme}
                        onValueChange={(value) => updateSettings("display", "theme", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>Advanced system settings and maintenance options.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-muted-foreground">Automatically refresh sensor data</p>
                      </div>
                      <Switch
                        checked={settings.system.autoRefresh}
                        onCheckedChange={(checked) => updateSettings("system", "autoRefresh", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Retention (days)</Label>
                      <Input
                        type="number"
                        value={settings.system.dataRetention}
                        onChange={(e) =>
                          updateSettings("system", "dataRetention", Number.parseInt(e.target.value) || 30)
                        }
                        min="1"
                        max="365"
                      />
                      <p className="text-sm text-muted-foreground">How long to keep historical data</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <Select
                        value={settings.system.backupFrequency}
                        onValueChange={(value) => updateSettings("system", "backupFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Disable alerts during maintenance</p>
                      </div>
                      <Switch
                        checked={settings.system.maintenanceMode}
                        onCheckedChange={(checked) => updateSettings("system", "maintenanceMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions that affect your system configuration.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={resetSettings}>
                      Reset All Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
