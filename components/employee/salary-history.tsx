"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, History } from "lucide-react"

interface SalaryRecord {
  _id: string
  employee: {
    _id: string
    name: string
    email: string
  }
  baseAmount: number
  bonus: number
  totalAmount: number
  month: number
  year: number
  createdAt: string
}

export default function SalaryHistory() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSalaryRecords()
  }, [])

  const fetchSalaryRecords = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/employees/salary-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSalaryRecords(data.data)
      } else {
        setError(data.error || "Failed to fetch salary records")
      }
    } catch (err: any) {
      setError(`Failed to load salary records: ${err.message}.`)
    } finally {
      setIsLoading(false)
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2" />
          Salary History
        </CardTitle>
        <CardDescription>View your past salary and bonus records.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {salaryRecords.length === 0 && !error ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No salary records found.</p>
            <p className="text-sm text-gray-400 mt-2">Your issued salaries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {salaryRecords.map((record) => (
              <div key={record._id} className="border rounded-lg p-4">
                <p className="font-semibold text-lg">
                  Total: <span className="font-medium">${(record.totalAmount ?? 0).toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Base: ${(record.baseAmount ?? 0).toFixed(2)}
                  {record.bonus > 0 && ` | Bonus: $${(record.bonus ?? 0).toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  For: {months.find((m) => m.value === (record.month ?? "").toString())?.label}{" "}
                  {(record.year ?? "").toString()}
                  {" | "}Issued: {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
