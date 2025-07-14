"use client"

import { useState, useCallback } from "react"
import type { KlarnaLogEntry } from "@/components/klarna-debug-alert"

interface UseKlarnaLoggerReturn {
  logs: KlarnaLogEntry[]
  addLog: (type: KlarnaLogEntry["type"], title: string, message: string, data?: any) => void
  clearLogs: () => void
}

export function useKlarnaLogger(): UseKlarnaLoggerReturn {
  const [logs, setLogs] = useState<KlarnaLogEntry[]>([])

  const addLog = useCallback(
    (type: KlarnaLogEntry["type"], title: string, message: string, data?: any) => {
      const newLog: KlarnaLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        title,
        message,
        data,
      }

      setLogs(prev => [...prev, newLog])

      // Also log to console for development
      const consoleMethod = type === "error" ? "error" : type === "warning" ? "warn" : "log"
      console[consoleMethod](`[Klarna SDK] ${title}: ${message}`, data || "")
    },
    []
  )

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    addLog,
    clearLogs,
  }
}
