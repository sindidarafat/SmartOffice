"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Mail, Phone, MapPin, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EmployeeDetailsModal from "@/components/admin/employee-details-modal"

interface Employee {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  department?: string
  position?: string
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

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
        setError(data.error || "Failed to fetch employees")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployees((prev) => prev.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp)))
    setSelectedEmployee(updatedEmployee) // Update selected employee in modal
  }

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
          <Users className="h-5 w-5 mr-2" />
          Employee List
        </CardTitle>
        <CardDescription>Manage all employees in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No employees found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <div key={employee._id} className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {employee.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        {employee.phone}
                      </div>
                    )}

                    {employee.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 mr-2" />
                        {employee.address}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      {employee.department && <Badge variant="secondary">{employee.department}</Badge>}
                      {employee.position && <Badge variant="outline">{employee.position}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => handleViewDetails(employee)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedEmployee && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
              <DialogHeader className="pb-4">
                <DialogTitle>Employee Details: {selectedEmployee.name}</DialogTitle>
                <DialogDescription>View and manage this employee's profile.</DialogDescription>
              </DialogHeader>
              {/* This div makes the content scrollable while keeping the header fixed */}
              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                <EmployeeDetailsModal employeeId={selectedEmployee._id} onUpdate={handleEmployeeUpdate} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
