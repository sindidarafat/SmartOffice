"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Check, X } from "lucide-react"

interface LeaveRequest {
  _id: string
  employee: {
    _id: string
    name: string
    email: string
  }
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/admin/leaves", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setLeaveRequests(data.data)
      } else {
        setError(data.error || "Failed to fetch leave requests")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveAction = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch(`http://localhost:5000/api/admin/leaves/${leaveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        setLeaveRequests((prev) => prev.map((leave) => (leave._id === leaveId ? { ...leave, status } : leave)))
      } else {
        setError(data.error || "Failed to update leave request")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />
      case "approved":
        return <Check className="h-3 w-3" />
      case "rejected":
        return <X className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
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
          <Calendar className="h-5 w-5 mr-2" />
          Leave Management
        </CardTitle>
        <CardDescription>Review and manage employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <div key={leave._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{leave.employee.name}</h3>
                      <Badge variant={getStatusColor(leave.status)} className="flex items-center gap-1">
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{leave.employee.email}</p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Start Date</p>
                        <p className="text-sm">{new Date(leave.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">End Date</p>
                        <p className="text-sm">{new Date(leave.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500">Reason</p>
                      <p className="text-sm">{leave.reason}</p>
                    </div>
                  </div>

                  {leave.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleLeaveAction(leave._id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(leave._id, "rejected")}>
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
