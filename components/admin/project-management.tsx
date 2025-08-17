"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FolderOpen, Plus } from "lucide-react"

interface Project {
  _id: string
  name: string
  description: string
  createdAt: string
}

export default function ProjectManagement() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/admin/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
      } else {
        setError(data.error || "Failed to fetch projects")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
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

      const response = await fetch("http://localhost:5000/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Project created successfully!")
        setFormData({ name: "", description: "" })
        fetchProjects() // Refresh the list after creation
      } else {
        setError(data.error || "Failed to create project")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Project Management
        </CardTitle>
        <CardDescription>Create and manage projects</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Q4 Marketing Campaign"
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
              placeholder="Launch campaign for the new product line."
              required
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </form>

        <h3 className="text-lg font-semibold mb-3">Existing Projects</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No projects found.</p>
            <p className="text-sm text-gray-400 mt-2">Create a new project above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-1">{project.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <p className="text-xs text-gray-400">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
