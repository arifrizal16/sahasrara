"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Clock, Shield, X } from "lucide-react"

interface SessionInfo {
  authenticated: boolean
  expiresAt: number
  rememberMe: boolean
}

export function SessionManager() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [showWarning, setShowWarning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check session status
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check')
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSessionInfo(data.session)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout')
    
    if (response.ok) {
      router.push('/login')
    } else {
      // Handle server error if needed
      console.error('Logout failed on server')
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

  // Calculate time left
  useEffect(() => {
    if (!sessionInfo || !sessionInfo.expiresAt) return

    const updateTimer = () => {
      const now = Date.now()
      const expiresAt = sessionInfo.expiresAt
      const timeLeftMs = expiresAt - now

      if (timeLeftMs <= 0) {
        handleLogout()
        return
      }

      const minutes = Math.floor(timeLeftMs / (1000 * 60))
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000)

      if (minutes > 0) {
        setTimeLeft(`${minutes} menit ${seconds} detik`)
      } else {
        setTimeLeft(`${seconds} detik`)
      }

      const shouldShowWarning = timeLeftMs < 5 * 60 * 1000
      setShowWarning(shouldShowWarning)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [sessionInfo])

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Auto-check session every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkSession, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
        <span className="text-xs text-slate-600">Loading...</span>
      </div>
    )
  }

  if (!sessionInfo) {
    return null
  }

  return (
    <>
      {/* Session Status in Header */}
      <div className="flex items-center gap-3">
        <Badge variant={showWarning ? "destructive" : "secondary"} className="text-xs">
          {timeLeft}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-600 hover:text-red-600 h-8 px-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}