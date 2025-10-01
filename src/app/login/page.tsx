"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Baby, Lock, Shield } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [pin, setPin] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length !== 4) {
      setError("PIN harus 4 digit")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin,
          rememberMe
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          // Check if there's a redirect path stored
          const redirectPath = sessionStorage.getItem('redirectAfterLogin')
          if (redirectPath) {
            router.push(redirectPath)
          } else {
            router.push('/')
          }
        }, 1000)
      } else {
        setError(result.error || "PIN salah")
        setPin("")
      }
    } catch (error) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo dan Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-teal-600 rounded-full">
              <Baby className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sahasrara</h1>
          <p className="text-slate-600">Baby Spa Management System</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Lock className="h-5 w-5 text-teal-600" />
              Login Required
            </CardTitle>
            <CardDescription className="text-slate-600">
              Masukkan PIN 4 digit untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Login Berhasil!
                </h3>
                <p className="text-green-600">Mengalihkan ke dashboard...</p>
              </motion.div>
            ) : (
              <>
                {/* PIN Display */}
                <div className="flex justify-center mb-6">
                  <div className="flex gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="w-12 h-12 border-2 border-slate-300 rounded-lg flex items-center justify-center bg-white"
                      >
                        {pin[index] && (
                          <div className="w-3 h-3 bg-teal-600 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      size="lg"
                      className="h-14 text-lg font-semibold border-slate-300 hover:bg-slate-50"
                      onClick={() => handlePinInput(num.toString())}
                      disabled={isLoading}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 border-slate-300 hover:bg-slate-50"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 text-lg font-semibold border-slate-300 hover:bg-slate-50"
                    onClick={() => handlePinInput("0")}
                    disabled={isLoading}
                  >
                    0
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 border-slate-300 hover:bg-slate-50"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    ⌫
                  </Button>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="rememberMe" className="text-sm text-slate-700">
                    Ingat Saya
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3"
                  onClick={handleSubmit}
                  disabled={isLoading || pin.length !== 4}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memeriksa...
                    </div>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-slate-500 mt-6">
              <p>Hubungi admin jika lupa PIN</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
            <Shield className="h-4 w-4 text-teal-600" />
            <span className="text-sm text-slate-700">System Protected</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}