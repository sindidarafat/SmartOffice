"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// 1. Updated User interface with `profilePhoto`
interface User {
  _id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  department?: string
  position?: string
  profilePhoto?: string // Added field
}

interface ProfileFormProps {
  user: User
  onUpdate: (user: User) => void
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  // State for text form
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    department: user.department || "",
    position: user.position || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // 2. New state for photo upload functionality
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.profilePhoto || null)
  const [isPhotoLoading, setIsPhotoLoading] = useState(false)
  const [photoMessage, setPhotoMessage] = useState("")
  const [photoError, setPhotoError] = useState("")

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoError("")
      setPhotoMessage("")
    }
  }

  // 3. New handler for submitting the photo
  const handlePhotoUpload = async () => {
    if (!photo) {
      setPhotoError("Please select an image file first.")
      return
    }

    setIsPhotoLoading(true)
    setPhotoError("")
    setPhotoMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const photoFormData = new FormData()
      photoFormData.append("photo", photo)

      const response = await fetch("http://localhost:5000/api/employees/profile/photo", {
        method: "POST",
        headers: {
          // NOTE: Do not set 'Content-Type' for FormData; the browser sets it automatically with the correct boundary.
          Authorization: `Bearer ${token}`,
        },
        body: photoFormData,
      })

      const data = await response.json()

      if (data.success) {
        setPhotoMessage("Profile photo updated successfully!")
        onUpdate(data.data) // Update parent state with the complete user object from the API
        setPhoto(null) // Reset the file input after successful upload
      } else {
        setPhotoError(data.error || "Failed to upload photo")
      }
    } catch (error) {
      setPhotoError("Network error. Please try again.")
    } finally {
      setIsPhotoLoading(false)
    }
  }

  // Handler for text information update (unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      const response = await fetch("http://localhost:5000/api/employees/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Profile details updated successfully!")
        onUpdate({ ...user, ...data.data })
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>Update your photo and personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 4. New UI section for Photo Upload */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">Profile Photo</Label>
          <div className="flex items-center gap-6">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile preview"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
               <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No Photo</span>
               </div>
            )}
            <div className="flex flex-col gap-3">
               <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="max-w-xs" />
               <Button onClick={handlePhotoUpload} disabled={isPhotoLoading || !photo} className="w-fit">
                {isPhotoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Photo
               </Button>
            </div>
          </div>

          {photoMessage && (
            <Alert>
              <AlertDescription>{photoMessage}</AlertDescription>
            </Alert>
          )}

          {photoError && (
            <Alert variant="destructive">
              <AlertDescription>{photoError}</AlertDescription>
            </Alert>
          )}
        </div>

        <hr />

        {/* --- Personal Information Form --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="123-456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Software Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, Anytown, USA"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Information
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}