"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, DollarSign, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Employee {
  _id: string
  name: string
  email: string
  salary?: string // Employee's base salary from their profile
}

interface SalaryRecord {
  _id: string
  employee: {
    _id: string
    name: string
    email: string
  }
  baseAmount: number // Base salary at the time of issuance
  bonus: number
  totalAmount: number
  month: number
  year: number
  createdAt: string
}

export default function SalaryManagement() {
  const [newSalaryFormData, setNewSalaryFormData] = useState({
    employeeId: "",
    bonus: "",
    month: "",
    year: "",
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [isProcessingNewSalary, setIsProcessingNewSalary] = useState(false)
  const [isFetchingSalaries, setIsFetchingSalaries] = useState(true)
  const [newSalaryMessage, setNewSalaryMessage] = useState("")
  const [newSalaryError, setNewSalaryError] = useState("")
  const [fetchSalariesError, setFetchSalariesError] = useState("")

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null)
  const [editFormData, setEditFormData] = useState({
    bonus: "",
    month: "",
    year: "",
  })
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)
  const [updateSalaryError, setUpdateSalaryError] = useState("")
  const [updateSalaryMessage, setUpdateSalaryMessage] = useState("")

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null)
  const [isDeletingSalary, setIsDeletingSalary] = useState(false)
  const [deleteSalaryError, setDeleteSalaryError] = useState("")

  useEffect(() => {
    fetchEmployees()
    fetchSalaryRecords()
    // Set current month and year as default for new salary form
    const today = new Date()
    setNewSalaryFormData((prev) => ({
      ...prev,
      month: (today.getMonth() + 1).toString(), // Month is 0-indexed
      year: today.getFullYear().toString(),
    }))
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
        console.error("Failed to fetch employees:", data.error)
      }
    } catch (error) {
      console.error("Network error fetching employees:", error)
    }
  }

  const fetchSalaryRecords = async () => {
    setIsFetchingSalaries(true)
    setFetchSalariesError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/admin/salary", {
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
        setFetchSalariesError(data.error || "Failed to fetch salary records")
      }
    } catch (err: any) {
      setFetchSalariesError(`Failed to load salary records: ${err.message}.`)
    } finally {
      setIsFetchingSalaries(false)
    }
  }

  const handleNewSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingNewSalary(true)
    setNewSalaryError("")
    setNewSalaryMessage("")

    const selectedEmployee = employees.find((emp) => emp._id === newSalaryFormData.employeeId)
    if (!selectedEmployee || !selectedEmployee.salary) {
      setNewSalaryError("Please select an employee with a defined base salary.")
      setIsProcessingNewSalary(false)
      return
    }

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
          employee: newSalaryFormData.employeeId,
          bonus: newSalaryFormData.bonus ? Number.parseFloat(newSalaryFormData.bonus) : 0,
          month: Number.parseInt(newSalaryFormData.month),
          year: Number.parseInt(newSalaryFormData.year),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewSalaryMessage("Salary and bonus processed successfully!")
        setNewSalaryFormData((prev) => ({
          ...prev,
          employeeId: "",
          bonus: "",
        })) // Keep month/year for convenience
        fetchSalaryRecords() // Refresh the list
      } else {
        setNewSalaryError(data.error || "Failed to process salary")
      }
    } catch (error) {
      setNewSalaryError("Network error. Please try again.")
    } finally {
      setIsProcessingNewSalary(false)
    }
  }

  const handleNewSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSalaryFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEditClick = (salary: SalaryRecord) => {
    setEditingSalary(salary)
    setEditFormData({
      bonus: salary.bonus.toString(),
      month: salary.month.toString(),
      year: salary.year.toString(),
    })
    setIsEditModalOpen(true)
    setUpdateSalaryError("")
    setUpdateSalaryMessage("")
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleUpdateSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSalary) return

    setIsUpdatingSalary(true)
    setUpdateSalaryError("")
    setUpdateSalaryMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch(`http://localhost:5000/api/admin/salary/${editingSalary._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bonus: Number.parseFloat(editFormData.bonus),
          month: Number.parseInt(editFormData.month),
          year: Number.parseInt(editFormData.year),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUpdateSalaryMessage("Salary record updated successfully!")
        fetchSalaryRecords() // Refresh the list
        setIsEditModalOpen(false)
      } else {
        setUpdateSalaryError(data.error || "Failed to update salary record")
      }
    } catch (error) {
      setUpdateSalaryError("Network error. Please try again.")
    } finally {
      setIsUpdatingSalary(false)
    }
  }

  const handleDeleteClick = (salaryId: string) => {
    setSalaryToDelete(salaryId)
    setIsDeleteConfirmOpen(true)
    setDeleteSalaryError("")
  }

  const handleDeleteConfirm = async () => {
    if (!salaryToDelete) return

    setIsDeletingSalary(true)
    setDeleteSalaryError("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch(`http://localhost:5000/api/admin/salary/${salaryToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      setSalaryRecords((prev) => prev.filter((salary) => salary._id !== salaryToDelete))
      setIsDeleteConfirmOpen(false)
      setSalaryToDelete(null)
    } catch (err: any) {
      setDeleteSalaryError(`Failed to delete salary record: ${err.message}.`)
    } finally {
      setIsDeletingSalary(false)
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString()) // Current year +/- 2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Salary Management
        </CardTitle>
        <CardDescription>Process and manage employee salaries and bonuses</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Process New Salary Section */}
        <h3 className="text-lg font-semibold mb-3">Process New Salary</h3>
        <form onSubmit={handleNewSalarySubmit} className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
          {newSalaryMessage && (
            <Alert>
              <AlertDescription>{newSalaryMessage}</AlertDescription>
            </Alert>
          )}
          {newSalaryError && (
            <Alert variant="destructive">
              <AlertDescription>{newSalaryError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={newSalaryFormData.employeeId}
              onValueChange={(value) => setNewSalaryFormData((prev) => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-muted-foreground">No employees found</div>
                ) : (
                  employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name} ({employee.email}) - Base: $
                      {employee.salary ? Number.parseFloat(employee.salary).toFixed(2) : "N/A"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={newSalaryFormData.month}
                onValueChange={(value) => setNewSalaryFormData((prev) => ({ ...prev, month: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={newSalaryFormData.year}
                onValueChange={(value) => setNewSalaryFormData((prev) => ({ ...prev, year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (USD)</Label>
              <Input
                id="bonus"
                name="bonus"
                type="number"
                step="0.01"
                value={newSalaryFormData.bonus}
                onChange={handleNewSalaryChange}
                placeholder="e.g., 500.00"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              isProcessingNewSalary ||
              !newSalaryFormData.employeeId ||
              !newSalaryFormData.month ||
              !newSalaryFormData.year
            }
          >
            {isProcessingNewSalary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Issue Salary
          </Button>
        </form>

        {/* Existing Salary Records Section */}
        <h3 className="text-lg font-semibold mb-3">Existing Salary Records</h3>
        {fetchSalariesError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{fetchSalariesError}</AlertDescription>
          </Alert>
        )}
        {isFetchingSalaries ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-gray-500">Loading salary records...</p>
          </div>
        ) : salaryRecords.length === 0 && !fetchSalariesError ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No salary records found.</p>
            <p className="text-sm text-gray-400 mt-2">Issue a new salary above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {salaryRecords.map((record) => (
              <div key={record._id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {record.employee.name} (<span className="text-sm text-gray-600">{record.employee.email}</span>)
                  </p>
                  <p className="text-md">
                    Base: <span className="font-medium">${(record.baseAmount ?? 0).toFixed(2)}</span>
                    {record.bonus > 0 && (
                      <span className="ml-4">
                        Bonus: <span className="font-medium">${(record.bonus ?? 0).toFixed(2)}</span>
                      </span>
                    )}
                    <span className="ml-4">
                      Total: <span className="font-medium">${(record.totalAmount ?? 0).toFixed(2)}</span>
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For: {months.find((m) => m.value === (record.month ?? "").toString())?.label}{" "}
                    {(record.year ?? "").toString()}
                    {" | "}Processed: {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(record)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(record._id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Salary Modal */}
        {editingSalary && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Salary Record</DialogTitle>
                <DialogDescription>Edit bonus, month, and year for {editingSalary.employee.name}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSalarySubmit} className="space-y-4">
                {updateSalaryMessage && (
                  <Alert>
                    <AlertDescription>{updateSalaryMessage}</AlertDescription>
                  </Alert>
                )}
                {updateSalaryError && (
                  <Alert variant="destructive">
                    <AlertDescription>{updateSalaryError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-bonus">Bonus (USD)</Label>
                  <Input
                    id="edit-bonus"
                    name="bonus"
                    type="number"
                    step="0.01"
                    value={editFormData.bonus}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-month">Month</Label>
                    <Select
                      value={editFormData.month}
                      onValueChange={(value) => setEditFormData((prev) => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger id="edit-month">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">Year</Label>
                    <Select
                      value={editFormData.year}
                      onValueChange={(value) => setEditFormData((prev) => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger id="edit-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUpdatingSalary}>
                    {isUpdatingSalary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the salary record.
              </DialogDescription>
            </DialogHeader>
            {deleteSalaryError && (
              <Alert variant="destructive">
                <AlertDescription>{deleteSalaryError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeletingSalary}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeletingSalary}>
                {isDeletingSalary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
