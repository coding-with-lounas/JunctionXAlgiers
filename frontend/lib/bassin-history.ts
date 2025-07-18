export interface BassinHistoryEntry {
  id: string
  bassinId: string
  timestamp: string
  temperature: number
  ph: number
  dissolvedOxygen: number
  ammonia: number
  nitrite: number
  nitrate: number
  waterLevel: number
  turbidity: number
  status: string
  activeAlerts: number
  notes?: string
}

export interface BassinHistoryManager {
  addEntry: (bassinId: string, data: Omit<BassinHistoryEntry, "id" | "bassinId" | "timestamp">) => void
  getHistory: (bassinId: string, limit?: number) => BassinHistoryEntry[]
  exportToCsv: (bassinId: string, bassinName: string) => void
  clearHistory: (bassinId: string) => void
  getHistoryStats: (bassinId: string) => {
    totalEntries: number
    dateRange: { start: string; end: string }
    averages: Record<string, number>
  }
}

class BassinHistoryService implements BassinHistoryManager {
  private getStorageKey(bassinId: string): string {
    return `bassin-history-${bassinId}`
  }

  addEntry(bassinId: string, data: Omit<BassinHistoryEntry, "id" | "bassinId" | "timestamp">): void {
    const entry: BassinHistoryEntry = {
      id: `${bassinId}-${Date.now()}`,
      bassinId,
      timestamp: new Date().toISOString(),
      ...data,
    }

    const existing = this.getHistory(bassinId)
    const updated = [entry, ...existing].slice(0, 1000) // Keep last 1000 entries

    localStorage.setItem(this.getStorageKey(bassinId), JSON.stringify(updated))
  }

  getHistory(bassinId: string, limit?: number): BassinHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(bassinId))
      if (!stored) return []

      const history = JSON.parse(stored) as BassinHistoryEntry[]
      return limit ? history.slice(0, limit) : history
    } catch (error) {
      console.error("Failed to load bassin history:", error)
      return []
    }
  }

  exportToCsv(bassinId: string, bassinName: string): void {
    const history = this.getHistory(bassinId)
    if (history.length === 0) {
      alert("No history data available for export")
      return
    }

    // CSV headers
    const headers = [
      "Timestamp",
      "Date",
      "Time",
      "Temperature (°C)",
      "pH Level",
      "Dissolved Oxygen (mg/L)",
      "Ammonia (mg/L)",
      "Nitrite (mg/L)",
      "Nitrate (mg/L)",
      "Water Level (%)",
      "Turbidity (NTU)",
      "Status",
      "Active Alerts",
      "Notes",
    ]

    // Convert data to CSV format
    const csvData = history.map((entry) => {
      const date = new Date(entry.timestamp)
      return [
        entry.timestamp,
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.temperature.toFixed(2),
        entry.ph.toFixed(2),
        entry.dissolvedOxygen.toFixed(2),
        entry.ammonia.toFixed(3),
        entry.nitrite.toFixed(3),
        entry.nitrate.toFixed(1),
        entry.waterLevel.toFixed(1),
        entry.turbidity.toFixed(1),
        entry.status,
        entry.activeAlerts.toString(),
        entry.notes || "",
      ]
    })

    // Create CSV content
    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${bassinName.replace(/\s+/g, "_")}_History_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  clearHistory(bassinId: string): void {
    localStorage.removeItem(this.getStorageKey(bassinId))
  }

  getHistoryStats(bassinId: string) {
    const history = this.getHistory(bassinId)

    if (history.length === 0) {
      return {
        totalEntries: 0,
        dateRange: { start: "", end: "" },
        averages: {},
      }
    }

    const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const averages = {
      temperature: history.reduce((sum, entry) => sum + entry.temperature, 0) / history.length,
      ph: history.reduce((sum, entry) => sum + entry.ph, 0) / history.length,
      dissolvedOxygen: history.reduce((sum, entry) => sum + entry.dissolvedOxygen, 0) / history.length,
      ammonia: history.reduce((sum, entry) => sum + entry.ammonia, 0) / history.length,
      nitrite: history.reduce((sum, entry) => sum + entry.nitrite, 0) / history.length,
      nitrate: history.reduce((sum, entry) => sum + entry.nitrate, 0) / history.length,
      waterLevel: history.reduce((sum, entry) => sum + entry.waterLevel, 0) / history.length,
      turbidity: history.reduce((sum, entry) => sum + entry.turbidity, 0) / history.length,
    }

    return {
      totalEntries: history.length,
      dateRange: {
        start: new Date(sortedHistory[0].timestamp).toLocaleDateString(),
        end: new Date(sortedHistory[sortedHistory.length - 1].timestamp).toLocaleDateString(),
      },
      averages,
    }
  }
}

export const bassinHistoryService = new BassinHistoryService()
