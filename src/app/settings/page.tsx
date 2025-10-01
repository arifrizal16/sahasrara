"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, Key, Shield, ArrowLeft, Check, X } from "lucide-react"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPinInputs, setShowPinInputs] = useState(false)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (!response.ok) {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const handlePinInput = (field: string, value: string) => {
    // Only allow numbers and max 4 digits
    if (/^\d{0,4}$/.test(value)) {
      switch (field) {
        case 'current':
          setCurrentPin(value)
          break
        case 'new':
          setNewPin(value)
          break
        case 'confirm':
          setConfirmPin(value)
          break
      }
    }
  }

  const validatePins = () => {
    if (currentPin.length !== 4) {
      setError("PIN saat ini harus 4 digit")
      return false
    }
    
    if (newPin.length !== 4) {
      setError("PIN baru harus 4 digit")
      return false
    }
    
    if (confirmPin.length !== 4) {
      setError("Konfirmasi PIN harus 4 digit")
      return false
    }
    
    if (newPin !== confirmPin) {
      setError("PIN baru dan konfirmasi PIN tidak cocok")
      return false
    }
    
    if (currentPin === newPin) {
      setError("PIN baru tidak boleh sama dengan PIN saat ini")
      return false
    }
    
    return true
  }

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePins()) {
      return
    }
    
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call change PIN API
      const response = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPin: currentPin,
          newPin: newPin
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`PIN berhasil diubah! ${result.data.newPin}`)
        setShowPinInputs(false)
        
        // Reset form
        setCurrentPin("")
        setNewPin("")
        setConfirmPin("")

        // Test new PIN by showing confirmation
        setTimeout(() => {
          alert("PIN telah berhasil diubah. Silakan login kembali dengan PIN baru untuk testing.")
        }, 500)
        
      } else {
        setError(result.error || "Gagal mengubah PIN")
      }

    } catch (error) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mr-3 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Settings className="h-8 w-8 text-teal-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
                <p className="text-sm text-slate-500">Kelola sistem Sahasrara</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-teal-600 rounded-full">
                  <Settings className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Pengaturan Sistem</h2>
              <p className="text-slate-600">Kelola keamanan dan preferensi sistem</p>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  Pengaturan Keamanan
                </CardTitle>
                <CardDescription>
                  Kelola PIN akses dan keamanan sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current PIN Info */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-blue-900">PIN Saat Ini</Label>
                      <p className="text-blue-700">4 digit number</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Change PIN Button */}
                {!showPinInputs ? (
                  <Button
                    onClick={() => setShowPinInputs(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Ubah PIN
                  </Button>
                ) : (
                  <form onSubmit={handleChangePin} className="space-y-4">
                    {/* Error/Success Messages */}
                    {error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-700">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* PIN Inputs */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPin" className="text-sm font-medium">
                          PIN Saat Ini
                        </Label>
                        <Input
                          id="currentPin"
                          type="password"
                          placeholder="1234"
                          value={currentPin}
                          onChange={(e) => handlePinInput('current', e.target.value)}
                          className="mt-1"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPin" className="text-sm font-medium">
                          PIN Baru
                        </Label>
                        <Input
                          id="newPin"
                          type="password"
                          placeholder="Masukkan 4 digit"
                          value={newPin}
                          onChange={(e) => handlePinInput('new', e.target.value)}
                          className="mt-1"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPin" className="text-sm font-medium">
                          Konfirmasi PIN Baru
                        </Label>
                        <Input
                          id="confirmPin"
                          type="password"
                          placeholder="Ulangi PIN baru"
                          value={confirmPin}
                          onChange={(e) => handlePinInput('confirm', e.target.value)}
                          className="mt-1"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPinInputs(false)
                          setCurrentPin("")
                          setNewPin("")
                          setConfirmPin("")
                          setError("")
                        }}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                        disabled={isLoading || !currentPin || !newPin || !confirmPin}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Memproses...
                          </div>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Simpan PIN
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* About System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Tentang Sistem
                </CardTitle>
                <CardDescription>
                  Informasi tentang pengembang sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Dikembangkan Oleh</Label>
                    <p className="text-slate-900 font-medium">Arif Rizal</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Tahun</Label>
                    <p className="text-slate-900">2025</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-slate-700">Kontak</Label>
                    <p className="text-slate-900">mochrizal1616@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Shield className="h-5 w-5" />
                  Tips Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    Gunakan PIN yang mudah diingat tapi sulit ditebak
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    Jangan gunakan PIN yang berulang seperti 1111 atau 1234
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    Selalu logout setelah selesai menggunakan sistem
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    Jangan bagikan PIN Anda kepada orang lain
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}