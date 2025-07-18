"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, AlertTriangle, Info, Trash2, CheckCheck, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService, type BassinNotification } from "@/lib/notification-system"

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<BassinNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "danger" | "warning">("all")

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications()
    setNotifications(allNotifications)
    setUnreadCount(notificationService.getUnreadCount())
  }

  useEffect(() => {
    loadNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
    loadNotifications()
  }

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId)
    loadNotifications()
  }

  const handleClearAll = () => {
    notificationService.clearAllNotifications()
    loadNotifications()
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.isRead)
      case "danger":
        return notifications.filter((n) => n.type === "danger")
      case "warning":
        return notifications.filter((n) => n.type === "warning")
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type: BassinNotification["type"]) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationBadgeColor = (type: BassinNotification["type"]) => {
    switch (type) {
      case "danger":
        return "bg-red-500 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "info":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = getFilteredNotifications()
  const dangerCount = notifications.filter((n) => n.type === "danger" && !n.isRead).length
  const warningCount = notifications.filter((n) => n.type === "warning" && !n.isRead).length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>Monitor bassin alerts and system notifications</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{dangerCount}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{warningCount}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{notifications.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    {filter === "all"
                      ? "All"
                      : filter === "unread"
                        ? "Unread"
                        : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter("all")}>All Notifications</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("unread")}>Unread Only</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter("danger")}>Critical Alerts</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("warning")}>Warnings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2 bg-transparent">
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    ⋮
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleClearAll} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications to display</p>
                  <p className="text-sm">
                    {filter === "all"
                      ? "All caught up! New alerts will appear here."
                      : `No ${filter} notifications found.`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-200 ${
                      !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge className={`text-xs ${getNotificationBadgeColor(notification.type)}`}>
                                  {notification.type}
                                </Badge>
                                {notification.priority === "high" && (
                                  <Badge variant="destructive" className="text-xs">
                                    HIGH
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="font-medium">{notification.bassinName}</span>
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                                {notification.autoGenerated && (
                                  <Badge variant="outline" className="text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </div>

                              {notification.parameters && (
                                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                  <strong>{notification.parameters.parameter}:</strong>{" "}
                                  {notification.parameters.currentValue.toFixed(2)}
                                  {notification.parameters.unit} (threshold: {notification.parameters.threshold}
                                  {notification.parameters.unit})
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                title="Delete notification"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
