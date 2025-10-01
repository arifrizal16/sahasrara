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
  const [modalDismissed, setModalDismissed] = useState(false)
  const [remindMeLaterTime, setRemindMeLaterTime] = useState<number | null>(null)
  const router = useRouter()

  // Check session status
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        setSessionInfo(data.session)
      } else {
        // Session invalid, redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/login')
    }
  }

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  // Handle re-login - store current path and redirect to login
  const handleReLogin = () => {
    // Store current path for redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    router.push('/login')
  }

  // Dismiss modal manually
  const handleDismissModal = () => {
    setModalDismissed(true)
  }

  // Remind me later - hide modal for 2 minutes
  const handleRemindMeLater = () => {
    const remindTime = Date.now() + (2 * 60 * 1000) // 2 minutes
    setRemindMeLaterTime(remindTime)
    setModalDismissed(true)
  }

  // Calculate time left
  useEffect(() => {
    if (!sessionInfo || !sessionInfo.expiresAt) return

    const updateTimer = () => {
      const now = Date.now()
      const expiresAt = sessionInfo.expiresAt
      const timeLeftMs = expiresAt - now

      if (timeLeftMs <= 0) {
        // Session expired
        handleLogout()
        return
      }

      // Calculate time components
      const minutes = Math.floor(timeLeftMs / (1000 * 60))
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000)

      if (minutes > 0) {
        setTimeLeft(`${minutes} menit ${seconds} detik`)
      } else {
        setTimeLeft(`${seconds} detik`)
      }

      // Check if we should show warning
      // Don't show if modal was dismissed and remind me later is still active
      const shouldShowWarning = timeLeftMs < 5 * 60 * 1000 // Less than 5 minutes
      const remindMeLaterActive = remindMeLaterTime && now < remindMeLaterTime
      
      if (shouldShowWarning && !remindMeLaterActive) {
        setShowWarning(true)
        setModalDismissed(false) // Reset dismissal state when warning becomes active again
      } else {
        setShowWarning(false)
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [sessionInfo, remindMeLaterTime])

  // Check session on mount
  useEffect(() => {
    checkSession()
    
    // Check if we need to redirect after login
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      // Clear the stored path
      sessionStorage.removeItem('redirectAfterLogin')
      // Reset modal states when returning from login
      setModalDismissed(false)
      setRemindMeLaterTime(null)
    }
  }, [])

  // Auto-check session every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkSession, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!sessionInfo) {
    return null // or loading spinner
  }

  return (
    <>
      {/* Session Warning Modal */}
      {showWarning && !modalDismissed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-5 w-5" />
                  Session Akan Habis
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissModal}
                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-orange-700">
                Session Anda akan berakhir dalam:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800 mb-2">
                  {timeLeft}
                </div>
                <Alert className="border-orange-200 bg-orange-100">
                  <AlertDescription className="text-orange-700 text-sm">
                    Silakan simpan pekerjaan Anda atau perpanjang session dengan login kembali.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout Sekarang
                </Button>
                <Button 
                  onClick={handleReLogin}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Login Ulang
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleRemindMeLater}
                  className="w-full text-orange-700 hover:text-orange-800 hover:bg-orange-100"
                >
                  Ingatkan Saya Nanti
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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