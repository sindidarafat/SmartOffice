"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardStats from "@/components/admin/dashboard-stats"
import EmployeeList from "@/components/admin/employee-list"
import ProjectManagement from "@/components/admin/project-management"
import TaskManagement from "@/components/admin/task-management"
import LeaveManagement from "@/components/admin/leave-management"
import SalaryManagement from "@/components/admin/salary-management" // Updated import
import Navbar from "@/components/layout/navbar"
import { Users, FolderOpen, CheckSquare, Calendar, DollarSign } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

        if (!token) {
          router.push("/")
          return
        }

        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          if (data.data.role !== "admin") {
            router.push("/employee/dashboard")
            return
          }
          setUser(data.data)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Leaves</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Salary</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeList />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="leaves">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="salary">
            <SalaryManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
