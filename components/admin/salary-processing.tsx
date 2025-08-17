"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, DollarSign } from "lucide-react"

interface Employee {
  _id: string
  name: string
  email: string
}

export default function SalaryProcessing() {
  const [formData, setFormData] = useState({
    employeeId: "",
    amount: "",
    bonus: "",
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

        const response = await fetch("http://localhost:5000/api/admin/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setEmployees(data.data)
        } else {
          console.error("Failed to fetch employees for salary processing:", data.error)
        }
      } catch (error) {
        console.error("Network error fetching employees for salary processing:", error)
      }
    }
    fetchEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/admin/salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          amount: Number.parseFloat(formData.amount),
          bonus: Number.parseFloat(formData.bonus),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Salary and bonus processed successfully!")
        setFormData({ employeeId: "", amount: "", bonus: "" })
      } else {
        setError(data.error || "Failed to process salary")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Salary & Bonus Processing
        </CardTitle>
        <CardDescription>Process employee salaries and bonuses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 && (
                  <SelectItem value="" disabled>
                    No employees found
                  </SelectItem>
                )}
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 5000.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (USD)</Label>
              <Input
                id="bonus"
                name="bonus"
                type="number"
                step="0.01"
                value={formData.bonus}
                onChange={handleChange}
                placeholder="e.g., 500.00"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !formData.employeeId || !formData.amount}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Salary
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
