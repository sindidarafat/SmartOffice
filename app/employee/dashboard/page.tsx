"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserIcon, CheckSquare, Calendar, TrendingUp, Clock, Award, DollarSign, Bell } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import ProfileForm from "@/components/employee/profile-form"
import LeaveRequestForm from "@/components/employee/leave-request-form"
import TaskList from "@/components/employee/task-list"
import LeaveHistory from "@/components/employee/leave-history"
import ProgressReport from "@/components/employee/progress-report"
import SalaryHistory from "@/components/employee/salary-history"
import Notifications from "@/components/employee/notifications" // New import for the notifications component

interface Employee {
  _id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  department?: string
  position?: string
  salary?: number
}

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingLeaves: number
  progress: string
}

interface SalaryRecord {
  _id: string
  baseAmount: number
  bonus: number
  totalAmount: number
  month: number
  year: number
  createdAt: string
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<Employee | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [latestSalary, setLatestSalary] = useState<SalaryRecord | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0) // New state for unread notifications
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

        if (!token) {
          router.push("/")
          return
        }

        // Fetch user data
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userData = await userResponse.json()

        if (userData.success) {
          if (userData.data.role !== "employee") {
            router.push("/admin/dashboard")
            return
          }
          setUser({
            ...userData.data,
            salary: userData.data.salary ? Number(userData.data.salary) : undefined,
          })

          // Fetch progress stats
          try {
            const progressResponse = await fetch("http://localhost:5000/api/employees/progress", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            const progressData = await progressResponse.json()
            if (progressData.success) {
              setStats(progressData.data)
            }
          } catch (error) {
            console.error("Failed to fetch progress:", error)
          }

          // Fetch latest salary history
          try {
            const salaryResponse = await fetch("http://localhost:5000/api/employees/salary-history", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            const salaryData = await salaryResponse.json()
            if (salaryData.success && salaryData.data.length > 0) {
              setLatestSalary(salaryData.data[0])
            }
          } catch (error) {
            console.error("Failed to fetch salary history:", error)
          }

          // --- NEW: Fetch notifications ---
          try {
            const notificationsResponse = await fetch("http://localhost:5000/api/notifications/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            const notificationsData = await notificationsResponse.json()
            if (notificationsData.success) {
              const unreadCount = notificationsData.data.filter((n: any) => !n.read).length
              setUnreadNotifications(unreadCount)
            }
          } catch (error) {
            console.error("Failed to fetch notifications:", error)
          }
          // --- END NEW ---

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

    fetchUserAndStats()
  }, [router])

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(" ")[0]}! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your work today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
              <p className="text-xs text-muted-foreground">Tasks finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.progress || "0%"}</div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(latestSalary?.totalAmount ?? user.salary ?? 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {latestSalary
                  ? `For ${months.find((m) => m.value === (latestSalary.month ?? "").toString())?.label} ${
                      latestSalary.year
                    }`
                  : "No records yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {stats && stats.totalTasks > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Task Completion</span>
                  <span>{stats.progress}</span>
                </div>
                <Progress value={Number.parseFloat(stats.progress.replace("%", ""))} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-lg font-semibold">
                  {user.department ? <Badge variant="secondary">{user.department}</Badge> : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p className="text-lg font-semibold">
                  {user.position ? <Badge variant="outline">{user.position}</Badge> : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7"> {/* Changed to grid-cols-7 */}
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Leave History</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Salary</span>
            </TabsTrigger>
            {/* --- NEW: Notifications Tab --- */}
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{unreadNotifications}</Badge>
              )}
            </TabsTrigger>
            {/* --- END NEW --- */}
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskList />
          </TabsContent>
          <TabsContent value="leave">
            <LeaveRequestForm />
          </TabsContent>
          <TabsContent value="history">
            <LeaveHistory />
          </TabsContent>
          <TabsContent value="progress">
            <ProgressReport />
          </TabsContent>
          <TabsContent value="salary">
            <SalaryHistory />
          </TabsContent>
          {/* --- NEW: Notifications Content --- */}
          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>
          {/* --- END NEW --- */}
          <TabsContent value="profile">
            <ProfileForm user={user} onUpdate={setUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
