"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Target, Award, Clock } from "lucide-react"

interface ProgressData {
  totalTasks: number
  completedTasks: number
  progress: string
  message?: string
}

export default function ProgressReport() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/employees/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setProgressData(data.data)
      } else {
        setError(data.error || "Failed to fetch progress data")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
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

  const progressPercentage = progressData?.progress ? Number.parseFloat(progressData.progress.replace("%", "")) : 0
  const inProgressTasks = (progressData?.totalTasks || 0) - (progressData?.completedTasks || 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Report
          </CardTitle>
          <CardDescription>Track your task completion and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {progressData?.message ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{progressData.message}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  <span className="text-2xl font-bold text-blue-600">{progressData?.progress || "0%"}</span>
                </div>
                <Progress value={progressPercentage} className="w-full h-3" />
                <p className="text-sm text-gray-600">
                  {progressData?.completedTasks || 0} of {progressData?.totalTasks || 0} tasks completed
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-blue-700">{progressData?.totalTasks || 0}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-700">{progressData?.completedTasks || 0}</p>
                    </div>
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">In Progress</p>
                      <p className="text-2xl font-bold text-orange-700">{inProgressTasks}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Performance Insights</h4>
                <div className="space-y-2 text-sm">
                  {progressPercentage >= 80 && (
                    <p className="text-green-600">🎉 Excellent work! You're performing above expectations.</p>
                  )}
                  {progressPercentage >= 60 && progressPercentage < 80 && (
                    <p className="text-blue-600">👍 Good progress! Keep up the momentum.</p>
                  )}
                  {progressPercentage >= 40 && progressPercentage < 60 && (
                    <p className="text-orange-600">
                      ⚡ You're making steady progress. Consider focusing on priority tasks.
                    </p>
                  )}
                  {progressPercentage < 40 && progressPercentage > 0 && (
                    <p className="text-red-600">
                      🎯 There's room for improvement. Consider discussing priorities with your manager.
                    </p>
                  )}
                  {progressPercentage === 0 && (
                    <p className="text-gray-600">📋 Ready to start! Your tasks are waiting for you.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
