"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Phone, MapPin, Briefcase, Building, TrendingUp, DollarSign, History } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components

interface Employee {
  _id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  department?: string
  position?: string
  salary?: number // Changed to number for consistency
}

interface EmployeeProgress {
  totalTasks: number
  completedTasks: number
  progress: string
  message?: string
}

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

interface EmployeeDetailsModalProps {
  employeeId: string
  onUpdate: (employee: Employee) => void
}

export default function EmployeeDetailsModal({ employeeId, onUpdate }: EmployeeDetailsModalProps) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [employeeProgress, setEmployeeProgress] = useState<EmployeeProgress | null>(null)
  const [employeeSalaries, setEmployeeSalaries] = useState<SalaryRecord[]>([]) // New state for salaries
  const [formData, setFormData] = useState<Partial<Employee>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [salariesError, setSalariesError] = useState("") // New state for salary fetch error

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setIsLoading(true)
      setError("")
      setSalariesError("") // Clear previous salary error
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

        // Fetch employee profile
        const employeeResponse = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const employeeData = await employeeResponse.json()

        if (employeeData.success) {
          setEmployee(employeeData.data)
          setFormData({
            name: employeeData.data.name,
            phone: employeeData.data.phone || "",
            address: employeeData.data.address || "",
            department: employeeData.data.department || "",
            position: employeeData.data.position || "",
            salary: employeeData.data.salary ? Number(employeeData.data.salary) : undefined, // Ensure salary is number
          })
        } else {
          setError(employeeData.error || "Failed to fetch employee details")
        }

        // Fetch employee progress
        const progressResponse = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const progressData = await progressResponse.json()

        if (progressData.success) {
          setEmployeeProgress(progressData.data)
        } else {
          console.error("Failed to fetch employee progress:", progressData.error)
        }

        // Fetch employee salary history
        const salariesResponse = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}/salary-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const salariesData = await salariesResponse.json()

        if (salariesData.success) {
          setEmployeeSalaries(salariesData.data)
        } else {
          setSalariesError(salariesData.error || "Failed to fetch salary history")
        }
      } catch (err) {
        setError("Network error. Could not fetch employee details or progress.")
        setSalariesError("Network error. Could not fetch salary history.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeDetails()
  }, [employeeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, valueAsNumber, type } = e.target // Destructure type and valueAsNumber
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? valueAsNumber : value, // Use valueAsNumber for number inputs
    }))
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError("")
    setMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const payload = { ...formData }
      // Ensure salary is sent as a number, or undefined if not a valid number
      if (payload.salary !== undefined) {
        const parsedSalary = Number(payload.salary)
        payload.salary = !isNaN(parsedSalary) ? parsedSalary : undefined
      }

      const response = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Send the prepared payload
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Employee profile updated successfully!")
        setEmployee(data.data)
        onUpdate(data.data) // Notify parent component of update
      } else {
        setError(data.error || "Failed to update employee profile.")
      }
    } catch (err) {
      setError("Network error. Could not update employee profile.")
    } finally {
      setIsUpdating(false)
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-gray-500">Loading employee details...</p>
      </div>
    )
  }

  if (error && !employee) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!employee) {
    return <div className="text-center py-8 text-gray-500">Employee not found.</div>
  }

  const progressPercentage = employeeProgress?.progress
    ? Number.parseFloat(employeeProgress.progress.replace("%", ""))
    : 0

  return (
    <div className="space-y-6">
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

      {/* Current Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Name:</span> {employee.name}
        </div>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Email:</span> {employee.email}
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Phone:</span> {formData.phone || "N/A"}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Address:</span> {formData.address || "N/A"}
        </div>
        <div className="flex items-center">
          <Building className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Department:</span> {formData.department || "N/A"}
        </div>
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Position:</span> {formData.position || "N/A"}
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-medium">Base Salary:</span> $
          {employee.salary !== undefined && employee.salary !== null
            ? Number.parseFloat(String(employee.salary)).toFixed(2)
            : "N/A"}
        </div>
      </div>

      {/* Employee Progress Report */}
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Employee Progress
        </h3>
        {employeeProgress?.message ? (
          <p className="text-gray-500 text-sm">{employeeProgress.message}</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Task Completion</span>
              <span>{employeeProgress?.progress || "0%"}</span>
            </div>
            <Progress value={progressPercentage} className="w-full h-3" />
            <p className="text-xs text-muted-foreground">
              {employeeProgress?.completedTasks || 0} of {employeeProgress?.totalTasks || 0} tasks completed
            </p>
          </div>
        )}
      </div>

      {/* Salary History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Salary History
          </CardTitle>
          <CardDescription>View all issued salaries and bonuses for this employee.</CardDescription>
        </CardHeader>
        <CardContent>
          {salariesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{salariesError}</AlertDescription>
            </Alert>
          )}
          {employeeSalaries.length === 0 && !salariesError ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No salary records found for this employee.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeeSalaries.map((record) => (
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

      {/* Edit Form */}
      <form onSubmit={handleUpdateSubmit} className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Edit Employee Profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="123-456-7890" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Engineering"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Software Developer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, Anytown, USA"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Base Salary (USD)</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            step="0.01"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g., 60000.00"
          />
        </div>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  )
}
