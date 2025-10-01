"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, Download, Filter, TrendingUp, Users, DollarSign, Calendar, Baby, Eye, Edit, Trash2, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { TreatmentChart, RevenueChart } from "@/components/charts"
import { SessionManager } from "@/components/session-manager"
import { Footer } from "@/components/footer"

const formSchema = z.object({
  nama: z.string().min(1, "Nama bayi harus diisi"),
  umur: z.string().min(1, "Umur harus diisi"),
  jenisKelamin: z.enum(["L", "P"], { required_error: "Jenis kelamin harus dipilih" }),
  beratBadan: z.string().min(1, "Berat badan harus diisi"),
  panjangBadan: z.string().min(1, "Panjang badan harus diisi"),
  namaOrtu: z.string().min(1, "Nama orang tua harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  tindakan: z.string().min(1, "Tindakan harus dipilih"),
  biaya: z.string().min(1, "Biaya harus diisi"),
  tanggal: z.string().optional(),
  keterangan: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface TransactionData {
  id: string
  namaBayi: string
  umur: string
  jenisKelamin: string
  beratBadan: string
  panjangBadan: string
  namaOrtu: string
  alamat: string
  tindakan: string
  biaya: number
  keterangan?: string | null
  createdAt: string
}

const tindakanOptions = [
  { value: "pijat_bayi", label: "Pijat Bayi", icon: "👐" },
  { value: "baby_swimming", label: "Baby Swimming", icon: "🏊" },
  { value: "perawatan_kulit", label: "Perawatan Kulit Bayi", icon: "🧴" },
  { value: "stimulasi_sensorik", label: "Stimulasi Sensorik", icon: "🎯" },
  { value: "yoga_bayi", label: "Yoga Bayi", icon: "🧘" },
  { value: "paket_lengkap", label: "Paket Lengkap", icon: "⭐" },
  { value: "aqua_therapy", label: "Aqua Therapy", icon: "🌊" },
  { value: "baby_gym", label: "Baby Gym", icon: "💪" }
]

export default function Home() {
  const router = useRouter()
  const [transaksiList, setTransaksiList] = useState<TransactionData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTindakan, setFilterTindakan] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // State untuk analisis pendapatan
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [revenueFilterTindakan, setRevenueFilterTindakan] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      umur: "",
      jenisKelamin: undefined,
      beratBadan: "",
      panjangBadan: "",
      namaOrtu: "",
      alamat: "",
      tindakan: "",
      biaya: "",
      tanggal: "",
      keterangan: ""
    }
  })

  // Reset form when modal is closed
  const handleCloseForm = () => {
    setShowForm(false)
    setIsEditMode(false)
    setSelectedTransaction(null)
    form.reset()
  }

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/transactions')
      const result = await response.json()
      
      if (result.success) {
        setTransaksiList(result.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditMode ? '/api/transactions' : '/api/transactions'
      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode ? { ...data, id: selectedTransaction?.id } : data

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      
      if (result.success) {
        // Reset form and state
        handleCloseForm()
        
        // Refresh transactions list
        await fetchTransactions()
        
        // Show success message
        alert(isEditMode ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil disimpan!')
      } else {
        alert(result.error || 'Gagal menyimpan transaksi')
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Terjadi kesalahan saat menyimpan transaksi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (transaction: TransactionData) => {
    setSelectedTransaction(transaction)
    setIsEditMode(true)
    setShowForm(true)
    
    // Format tanggal untuk form (YYYY-MM-DD format untuk input date)
    const tanggalFormatted = transaction.createdAt ? 
      new Date(transaction.createdAt).toISOString().split('T')[0] : ""
    
    // Populate form with transaction data
    form.reset({
      nama: transaction.namaBayi,
      umur: transaction.umur,
      jenisKelamin: transaction.jenisKelamin as "L" | "P",
      beratBadan: transaction.beratBadan,
      panjangBadan: transaction.panjangBadan,
      namaOrtu: transaction.namaOrtu,
      alamat: transaction.alamat,
      tindakan: transaction.tindakan,
      biaya: transaction.biaya.toString(),
      tanggal: tanggalFormatted,
      keterangan: transaction.keterangan || ""
    })
  }

  const handleDelete = async (transaction: TransactionData) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi untuk ${transaction.namaBayi}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/transactions?id=${transaction.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh transactions list
        await fetchTransactions()
        
        // Close detail modal if open
        setSelectedTransaction(null)
        
        // Show success message
        alert('Transaksi berhasil dihapus!')
      } else {
        alert(result.error || 'Gagal menghapus transaksi')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Terjadi kesalahan saat menghapus transaksi')
    }
  }

  // Filter transactions based on search and filter
  const filteredTransactions = transaksiList.filter(transaksi => {
    const matchesSearch = !searchTerm || 
      transaksi.namaBayi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaksi.namaOrtu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaksi.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTindakan = !filterTindakan || filterTindakan === "all" || transaksi.tindakan === filterTindakan
    
    return matchesSearch && matchesTindakan
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const totalPendapatan = filteredTransactions.reduce((sum, transaksi) => sum + transaksi.biaya, 0)
  
  // Filter untuk analisis pendapatan
  const getFilteredTransactionsForAnalysis = () => {
    return transaksiList.filter(t => {
      const transactionDate = new Date(t.createdAt)
      
      // Filter tanggal
      let dateMatch = true
      if (startDate) {
        const start = new Date(startDate)
        dateMatch = dateMatch && transactionDate >= start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // End of day
        dateMatch = dateMatch && transactionDate <= end
      }
      
      // Filter tindakan
      const tindakanMatch = !revenueFilterTindakan || revenueFilterTindakan === "all" || t.tindakan === revenueFilterTindakan
      
      return dateMatch && tindakanMatch
    })
  }

  const filteredTransactionsForAnalysis = getFilteredTransactionsForAnalysis()
  
  // Calculate statistics berdasarkan filter
  const filteredRevenue = filteredTransactionsForAnalysis.reduce((sum, t) => sum + t.biaya, 0)
  const filteredTransactionCount = filteredTransactionsForAnalysis.length
  
  // Calculate statistics (original untuk display umum)
  const today = new Date()
  const todayTransactions = transaksiList.filter(t => 
    new Date(t.createdAt).toDateString() === today.toDateString()
  )
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.biaya, 0)

  // Get most popular treatment berdasarkan filter
  const treatmentCountsFiltered = filteredTransactionsForAnalysis.reduce((acc, t) => {
    acc[t.tindakan] = (acc[t.tindakan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Prepare data for charts (menggunakan data yang sudah difilter)
  const treatmentChartData = tindakanOptions.map(option => {
    const count = treatmentCountsFiltered[option.value] || 0
    return {
      name: option.label,
      value: count,
      color: {
        "pijat_bayi": "#3b82f6",
        "baby_swimming": "#06b6d4", 
        "perawatan_kulit": "#8b5cf6",
        "stimulasi_sensorik": "#f59e0b",
        "yoga_bayi": "#10b981",
        "paket_lengkap": "#ef4444",
        "aqua_therapy": "#14b8a6",
        "baby_gym": "#f97316"
      }[option.value] || "#6b7280"
    }
  }).filter(item => item.value > 0)

  // Calculate revenue by treatment (menggunakan data yang sudah difilter)
  const revenueByTreatment = filteredTransactionsForAnalysis.reduce((acc, t) => {
    acc[t.tindakan] = (acc[t.tindakan] || 0) + t.biaya
    return acc
  }, {} as Record<string, number>)

  const revenueChartData = tindakanOptions.map(option => ({
    name: option.label,
    revenue: revenueByTreatment[option.value] || 0
  })).filter(item => item.revenue > 0)

  const exportToCSV = () => {
    const headers = [
      'No',
      'Nama Bayi',
      'Umur',
      'Jenis Kelamin',
      'Berat Badan (kg)',
      'Panjang Badan (cm)',
      'Nama Ortu',
      'Alamat',
      'Tindakan',
      'Biaya (Rp)',
      'Keterangan',
      'Tanggal'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((transaksi, index) => [
        index + 1,
        `"${transaksi.namaBayi}"`,
        `"${transaksi.umur}"`,
        transaksi.jenisKelamin,
        transaksi.beratBadan,
        transaksi.panjangBadan,
        `"${transaksi.namaOrtu}"`,
        `"${transaksi.alamat}"`,
        `"${tindakanOptions.find(t => t.value === transaksi.tindakan)?.label}"`,
        transaksi.biaya,
        `"${transaksi.keterangan || ''}"`,
        `"${new Date(transaksi.createdAt).toLocaleDateString('id-ID')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `baby-spa-transactions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportFilteredToCSV = () => {
    const headers = [
      'No',
      'Nama Bayi',
      'Umur',
      'Jenis Kelamin',
      'Berat Badan (kg)',
      'Panjang Badan (cm)',
      'Nama Ortu',
      'Alamat',
      'Tindakan',
      'Biaya (Rp)',
      'Keterangan',
      'Tanggal'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredTransactionsForAnalysis.map((transaksi, index) => [
        index + 1,
        `"${transaksi.namaBayi}"`,
        `"${transaksi.umur}"`,
        transaksi.jenisKelamin,
        transaksi.beratBadan,
        transaksi.panjangBadan,
        `"${transaksi.namaOrtu}"`,
        `"${transaksi.alamat}"`,
        `"${tindakanOptions.find(t => t.value === transaksi.tindakan)?.label}"`,
        transaksi.biaya,
        `"${transaksi.keterangan || ''}"`,
        `"${new Date(transaksi.createdAt).toLocaleDateString('id-ID')}"`
      ].join(','))
    ].join('\n')

    // Create filename with filter info
    let filename = 'baby-spa-analisis'
    if (startDate || endDate || revenueFilterTindakan) {
      const filterParts = []
      if (startDate) filterParts.push(`dari-${startDate}`)
      if (endDate) filterParts.push(`sampai-${endDate}`)
      if (revenueFilterTindakan && revenueFilterTindakan !== 'all') {
        const treatment = tindakanOptions.find(t => t.value === revenueFilterTindakan)?.label || revenueFilterTindakan
        filterParts.push(`tindakan-${treatment.replace(/\s+/g, '-').toLowerCase()}`)
      }
      if (filterParts.length > 0) {
        filename += '-' + filterParts.join('-')
      }
    }
    filename += `-${new Date().toISOString().split('T')[0]}.csv`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <Baby className="h-8 w-8 text-teal-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 truncate">Sahasrara</h1>
                <p className="text-sm text-slate-500 hidden sm:block">Professional Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SessionManager />
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="text-slate-600 hover:text-slate-900 h-8 px-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Transaksi</p>
                    <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-slate-900">
                      Rp {totalPendapatan.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Transaksi Hari Ini</p>
                    <p className="text-2xl font-bold text-slate-900">{todayTransactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Pendapatan Hari Ini</p>
                    <p className="text-2xl font-bold text-slate-900">
                      Rp {todayRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analisis Pendapatan dengan Filter */}
        {transaksiList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Analisis Pendapatan
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Filter analisis berdasarkan tanggal dan tindakan perawatan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dari Tanggal
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sampai Tanggal
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  
                  {/* Tindakan Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filter Tindakan
                    </label>
                    <Select value={revenueFilterTindakan} onValueChange={setRevenueFilterTindakan}>
                      <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm">
                        <SelectValue placeholder="Semua tindakan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🔄 Semua Tindakan</SelectItem>
                        {tindakanOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Reset Filter */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStartDate("")
                        setEndDate("")
                        setRevenueFilterTindakan("")
                      }}
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  </div>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {filteredTransactionCount}
                    </div>
                    <div className="text-sm text-slate-600">Total Transaksi</div>
                    {(startDate || endDate || revenueFilterTindakan) && (
                      <div className="text-xs text-blue-600 mt-1">Setelah Filter</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Rp {filteredRevenue.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-slate-600">Total Pendapatan</div>
                    {(startDate || endDate || revenueFilterTindakan) && (
                      <div className="text-xs text-blue-600 mt-1">Setelah Filter</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredTransactionCount > 0 ? Math.round(filteredRevenue / filteredTransactionCount) : 0}
                    </div>
                    <div className="text-sm text-slate-600">Rata-rata/Transaksi</div>
                    {(startDate || endDate || revenueFilterTindakan) && (
                      <div className="text-xs text-blue-600 mt-1">Setelah Filter</div>
                    )}
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => exportFilteredToCSV()}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={filteredTransactionsForAnalysis.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data Terfilter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts Section */}
        {transaksiList.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TreatmentChart data={treatmentChartData} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <RevenueChart data={revenueChartData} />
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Daftar Transaksi */}
          <div>
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-slate-900 text-lg sm:text-xl">
                      <Filter className="h-5 w-5 text-slate-600 flex-shrink-0" />
                      <span className="truncate">Daftar Transaksi</span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm sm:text-base mt-1">
                      {filteredTransactions.length} transaksi ditemukan
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-slate-700 border-slate-300 w-full sm:w-auto whitespace-nowrap mt-2 sm:mt-0"
                    onClick={exportToCSV}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Cari nama bayi, orang tua, atau alamat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                    />
                  </div>
                  
                  <Select value={filterTindakan} onValueChange={setFilterTindakan}>
                    <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base">
                      <SelectValue placeholder="Filter berdasarkan tindakan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔄 Semua Tindakan</SelectItem>
                      {tindakanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-lg font-medium">Memuat data transaksi...</p>
                    <p className="text-sm">Mohon tunggu sebentar</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg font-medium">Belum ada transaksi</p>
                    <p className="text-sm mb-4">Klik tombol "Transaksi Baru" untuk menambah data</p>
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Transaksi
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Enhanced Table */}
                    <div className="overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50 sticky top-0">
                            <TableRow>
                              <TableHead className="text-slate-700 font-semibold w-12 text-sm sm:text-base">No</TableHead>
                              <TableHead className="text-slate-700 font-semibold text-sm sm:text-base hidden sm:table-cell">Data Bayi</TableHead>
                              <TableHead className="text-slate-700 font-semibold text-sm sm:text-base hidden lg:table-cell">Data Ortu</TableHead>
                              <TableHead className="text-slate-700 font-semibold text-sm sm:text-base">Tindakan</TableHead>
                              <TableHead className="text-slate-700 font-semibold text-right text-sm sm:text-base">Biaya</TableHead>
                              <TableHead className="text-slate-700 font-semibold text-center text-sm sm:text-base">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedTransactions.map((transaksi, index) => (
                              <TableRow key={transaksi.id} className="hover:bg-slate-50 border-b border-slate-100">
                                <TableCell className="text-slate-600 font-medium text-sm sm:text-base">
                                  {startIndex + index + 1}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-900 text-sm sm:text-base">{transaksi.namaBayi}</span>
                                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                        {transaksi.jenisKelamin === 'L' ? '👦' : '👧'} {transaksi.jenisKelamin}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">Umur:</span>
                                        <span>{transaksi.umur}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">BB/PB:</span>
                                        <span>{transaksi.beratBadan}kg / {transaksi.panjangBadan}cm</span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="space-y-1">
                                    <div className="font-medium text-slate-900 text-sm sm:text-base">{transaksi.namaOrtu}</div>
                                    <div className="text-sm text-slate-600 truncate max-w-xs" title={transaksi.alamat}>
                                      📍 {transaksi.alamat}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs sm:text-sm">
                                      {tindakanOptions.find(t => t.value === transaksi.tindakan)?.icon} {tindakanOptions.find(t => t.value === transaksi.tindakan)?.label}
                                    </Badge>
                                    {/* Mobile-only detailed card */}
                                    <div className="sm:hidden space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-slate-900">{transaksi.namaBayi}</span>
                                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                            {transaksi.jenisKelamin === 'L' ? '👦' : '👧'} {transaksi.jenisKelamin}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1">
                                          <div><span className="font-medium">Umur:</span> {transaksi.umur}</div>
                                          <div><span className="font-medium">BB/PB:</span> {transaksi.beratBadan}kg / {transaksi.panjangBadan}cm</div>
                                          <div><span className="font-medium">Ortu:</span> {transaksi.namaOrtu}</div>
                                          <div className="truncate"><span className="font-medium">Alamat:</span> {transaksi.alamat}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="space-y-1">
                                    <div className="font-bold text-lg text-green-700">
                                      Rp {transaksi.biaya.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {new Date(transaksi.createdAt).toLocaleDateString('id-ID')}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTransaction(transaksi)}
                                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="text-sm text-slate-600">
                          Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-slate-300"
                          >
                            ←
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const page = i + 1
                              if (totalPages > 5) {
                                const startPage = Math.max(1, currentPage - 2)
                                const endPage = Math.min(totalPages, currentPage + 2)
                                if (page < startPage || page > endPage) return null
                              }
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={currentPage === page ? "bg-teal-600 hover:bg-teal-700" : "border-slate-300"}
                                >
                                  {page}
                                </Button>
                              )
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="border-slate-300"
                          >
                            →
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal Transaksi Baru */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 text-sm sm:text-xl">
              <Plus className="h-5 w-5 text-teal-600" />
              {isEditMode ? 'Edit Transaksi' : 'Form Transaksi Baru'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm sm:text-base">
              {isEditMode 
                ? 'Perbarui data transaksi yang sudah ada' 
                : 'Isi data transaksi dengan lengkap untuk membuat catatan baru'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 sm:mt-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Informasi:</span> Semua field dengan tanda <span className="text-red-500">*</span> wajib diisi.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Tanggal Field */}
                  <FormField
                    control={form.control}
                    name="tanggal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Tanggal Transaksi <span className="text-slate-400">(opsional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Pilih tanggal"
                            max={new Date().toISOString().split('T')[0]}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-500">
                          Kosongkan jika transaksi dilakukan hari ini
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Nama Bayi <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan nama bayi" 
                            {...field}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="umur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            Umur <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="6 bulan" 
                              {...field}
                              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jenisKelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            Jenis Kelamin <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                                <SelectValue placeholder="L/P" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="L">Laki-laki</SelectItem>
                              <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="beratBadan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            BB (kg) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="7.5" 
                              {...field}
                              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="panjangBadan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            PB (cm) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="65" 
                              {...field}
                              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="namaOrtu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Nama Orang Tua <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan nama orang tua" 
                            {...field}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Alamat <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masukkan alamat lengkap" 
                            {...field}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tindakan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Tindakan/Perawatan <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                              <SelectValue placeholder="Pilih tindakan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tindakanOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <span>{option.icon}</span>
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="biaya"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          Biaya (Rp) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="150000" 
                            {...field}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Keterangan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Catatan tambahan..." 
                            {...field}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseForm}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        💾 {isEditMode ? 'Update Transaksi' : 'Simpan Transaksi'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Transaction Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-sm sm:text-xl">
              <Eye className="h-5 w-5 text-teal-600" />
              Detail Transaksi
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Informasi lengkap transaksi baby spa
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Baby Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  👶 Data Bayi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Nama Lengkap</span>
                    <p className="text-blue-900 font-semibold">{selectedTransaction.namaBayi}</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Jenis Kelamin</span>
                    <p className="text-blue-900 font-semibold">
                      {selectedTransaction.jenisKelamin === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Umur</span>
                    <p className="text-blue-900 font-semibold">{selectedTransaction.umur}</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Berat Badan</span>
                    <p className="text-blue-900 font-semibold">{selectedTransaction.beratBadan} kg</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Panjang Badan</span>
                    <p className="text-blue-900 font-semibold">{selectedTransaction.panjangBadan} cm</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Tanggal Transaksi</span>
                    <p className="text-blue-900 font-semibold">
                      {new Date(selectedTransaction.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  👨‍👩‍👧‍👦 Data Orang Tua
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-green-600 font-medium">Nama Orang Tua</span>
                    <p className="text-green-900 font-semibold text-lg">{selectedTransaction.namaOrtu}</p>
                  </div>
                  <div>
                    <span className="text-sm text-green-600 font-medium">Alamat</span>
                    <p className="text-green-900">{selectedTransaction.alamat}</p>
                  </div>
                </div>
              </div>

              {/* Treatment Information */}
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                  💆‍♀️ Informasi Perawatan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-teal-600 font-medium">Jenis Tindakan</span>
                      <p className="text-teal-900 font-semibold text-lg">
                        {tindakanOptions.find(t => t.value === selectedTransaction.tindakan)?.icon} {tindakanOptions.find(t => t.value === selectedTransaction.tindakan)?.label}
                      </p>
                    </div>
                    <Badge className="bg-teal-100 text-teal-700 text-sm px-3 py-1">
                      {tindakanOptions.find(t => t.value === selectedTransaction.tindakan)?.label}
                    </Badge>
                  </div>
                  
                  {selectedTransaction.keterangan && (
                    <div>
                      <span className="text-sm text-teal-600 font-medium">Keterangan</span>
                      <div className="bg-white p-3 rounded border border-teal-200 mt-1">
                        <p className="text-teal-900">{selectedTransaction.keterangan}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  💰 Informasi Pembayaran
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-yellow-600 font-medium">Total Biaya</span>
                    <p className="text-yellow-900 font-bold text-2xl">
                      Rp {selectedTransaction.biaya.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-yellow-600 font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-700">✓ Lunas</Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => selectedTransaction && handleEdit(selectedTransaction)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Transaksi
                </Button>
                <Button 
                  onClick={() => selectedTransaction && handleDelete(selectedTransaction)}
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setShowForm(!showForm)}
          size="lg"
          className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center group"
        >
          <Plus className="h-6 w-6" />
          <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Transaksi Baru
          </span>
        </Button>
      </motion.div>

      <Footer />
    </div>
  )
}