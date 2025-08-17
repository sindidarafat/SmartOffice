"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, Play, CheckCircle } from "lucide-react"

interface Task {
  _id: string
  project: {
    _id: string
    name: string
  }
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError("")
    setRetryCount((prev) => prev + 1)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/employees/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()

      if (data.success) {
        setTasks(data.data)
      } else {
        setError(data.error || "Failed to fetch tasks")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch(`http://localhost:5000/api/employees/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()

      if (data.success) {
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? { ...task, status: status as Task["status"] } : task)),
        )
      } else {
        setError(data.error || "Failed to update task")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }

  const loadingStates = [
    "Loading tasks...",
    "Fetching your tasks...",
    "Almost there...",
    "Just a moment...",
    "Hold on...",
  ]

  const currentLoadingState = loadingStates[retryCount % loadingStates.length]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-500">{currentLoadingState}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="h-5 w-5 mr-2" />
          My Tasks
        </CardTitle>
        <CardDescription>Manage your assigned tasks</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchTasks} className="ml-2 bg-transparent">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant={getStatusColor(task.status)} className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Project: {task.project.name}</p>
                    {task.description && <p className="text-sm text-gray-700 mb-3">{task.description}</p>}
                  </div>
                  <div className="ml-4">
                    <Select value={task.status} onValueChange={(value) => updateTaskStatus(task._id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
