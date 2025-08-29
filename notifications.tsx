"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell } from "lucide-react"

// Interface for the notification data structure
interface Notification {
  _id: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Fetches notifications from the '/api/notifications/me' endpoint
  const fetchNotifications = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Retrieve the authentication token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      // Fetch notifications for the logged-in user
      const response = await fetch("http://localhost:5000/api/notifications/me", {
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
        setNotifications(data.data)
      } else {
        setError(data.error || "Failed to fetch notifications")
      }
    } catch (err: any) {
      setError(`Failed to load notifications: ${err.message}.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Display a loading spinner while data is being fetched
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
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </CardTitle>
        <CardDescription>Here are your recent notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {notifications.length === 0 && !error ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">You have no new notifications.</p>
            <p className="text-sm text-gray-400 mt-2">We'll let you know when something comes up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 ${notification.read ? "bg-gray-50 text-gray-500" : "bg-white"}`}
              >
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
