"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Code2,
  Eye,
  EyeOff,
  Trash2,
  Settings,
} from "lucide-react"

export interface KlarnaLogEntry {
  id: string
  timestamp: Date
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  data?: any
}

interface KlarnaDebugAlertProps {
  logs: KlarnaLogEntry[]
  onClearLogs: () => void
  className?: string
}

export function KlarnaDebugAlert({ logs, onClearLogs, className }: KlarnaDebugAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const filteredLogs = logs.filter(
    (log) =>
      log.title.includes("API") ||
      log.title.includes("SDK") ||
      log.title.includes("Presentation") ||
      log.title.includes("Component")
  );

  const getIcon = (type: KlarnaLogEntry["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: KlarnaLogEntry["type"]) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  const getBadgeVariant = (type: KlarnaLogEntry["type"]) => {
    switch (type) {
      case "info":
        return "secondary"
      case "success":
        return "default"
      case "warning":
        return "outline"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Klarna Debug ({logs.length})
        </Button>
      </div>
    )
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 w-96 max-w-[90vw] max-h-[60vh] z-50 shadow-lg border-2 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Klarna SDK Debug Console
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {filteredLogs.length} events
            </Badge>
            <Button
              onClick={onClearLogs}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              title="Clear logs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              title="Hide console"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Klarna SDK activity yet</AlertTitle>
                <AlertDescription>
                  SDK interactions will appear here as they occur.
                </AlertDescription>
              </Alert>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <Alert
                    variant={getAlertVariant(log.type)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <AlertTitle className="text-sm font-medium truncate">
                            {log.title}
                          </AlertTitle>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={getBadgeVariant(log.type)} className="text-xs">
                              {log.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </div>
                        <AlertDescription className="text-xs">{log.message}</AlertDescription>

                        {expandedLogs.has(log.id) && log.data && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-1 mb-1">
                              <Code2 className="h-3 w-3" />
                              <span className="text-xs font-medium">Data:</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                  {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
