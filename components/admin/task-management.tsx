"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckSquare, Plus, Clock, Play, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Employee {
  _id: string
  name: string
  email: string
}

interface Project {
  _id: string
  name: string
}

interface Task {
  _id: string
  project: {
    _id: string
    name: string
  }
  employee: {
    _id: string
    name: string
  }
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  createdAt: string
}

export default function TaskManagement() {
  const [formData, setFormData] = useState({
    project: "",
    employee: "",
    title: "",
    description: "",
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [projectError, setProjectError] = useState("")
  const [tasksError, setTasksError] = useState("")

  useEffect(() => {
    fetchEmployees()
    fetchProjects()
    fetchTasks()
  }, [])

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true)
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
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    setProjectError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      // NOTE: Your provided backend code for adminController does not include
      // a GET /api/admin/projects endpoint to fetch all projects.
      // This fetch call will likely fail until you implement that endpoint.
      const response = await fetch("http://localhost:5000/api/admin/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
      } else {
        setProjectError(data.error || "Failed to fetch projects")
      }
    } catch (error: any) {
      setProjectError("Network error. Please try again.")
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    setTasksError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      // NOTE: Your provided backend code for adminController does not include
      // a GET /api/admin/tasks endpoint to fetch all tasks.
      // This fetch call will likely fail until you implement that endpoint.
      const response = await fetch("http://localhost:5000/api/admin/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setTasks(data.data)
      } else {
        setTasksError(data.error || "Failed to fetch tasks")
      }
    } catch (error: any) {
      setTasksError("Network error. Please try again.")
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError("")
    setMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Task created and assigned successfully!")
        setFormData({ project: "", employee: "", title: "", description: "" })
        fetchTasks() // Refresh the task list
      } else {
        setError(data.error || "Failed to create task")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="h-5 w-5 mr-2" />
          Task Management
        </CardTitle>
        <CardDescription>Create and assign tasks to employees</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              {isLoadingProjects ? (
                <Input value="Loading projects..." disabled />
              ) : (
                <Select
                  value={formData.project}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, project: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 ? (
                      <SelectItem value="" disabled>
                        No projects found
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Assign to Employee</Label>
              {isLoadingEmployees ? (
                <Input value="Loading employees..." disabled />
              ) : (
                <Select
                  value={formData.employee}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, employee: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="" disabled>
                        No employees found
                      </SelectItem>
                    ) : (
                      employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name} ({employee.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Design social media graphics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Create 5 graphics for Instagram and Facebook."
              required
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={isCreating || !formData.project || !formData.employee}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Create & Assign Task
          </Button>
        </form>

        <h3 className="text-lg font-semibold mb-3">Existing Tasks</h3>
        {isLoadingTasks ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-gray-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No tasks found.</p>
            <p className="text-sm text-gray-400 mt-2">Create a new task above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge variant={getStatusColor(task.status)} className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Project: {task.project.name}</p>
                    <p className="text-sm text-gray-600 mb-2">Assigned to: {task.employee.name}</p>
                    {task.description && <p className="text-sm text-gray-700 mb-3">{task.description}</p>}
                    <p className="text-xs text-gray-400">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
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
