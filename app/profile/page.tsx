"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface UserProfile {
  userID: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  profilePhotoURL?: string
  averageRating?: number
  isActive: boolean
  createdAt: string
  userType: string
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    profilePhotoURL: "",
  })

  // Change password states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Decode JWT and fetch user ID
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token")
    setToken(storedToken)

    if (!storedToken) {
      setError("No authentication token found. Please login.")
      setLoading(false)
      return
    }

    try {
      const payload = storedToken.split(".")[1]
      const decodedPayload = JSON.parse(atob(payload))
      const uid = decodedPayload.sub || decodedPayload.userId || decodedPayload.id || decodedPayload.nameid

      if (uid) {
        setUserId(Number.parseInt(uid))
      } else {
        setError("User ID not found in token")
        setLoading(false)
      }
    } catch (err) {
      console.error("Error decoding token:", err)
      setError("Invalid authentication token")
      setLoading(false)
    }
  }, [])

  // Fetch user profile
  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`http://localhost:5279/api/User/${userId}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setProfile(data)
        setEditFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          profilePhotoURL: data.profilePhotoURL || "",
        })
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError(err.message || "Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, token])

  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const updateDto = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone || null,
        address: editFormData.address || null,
        profilePhotoURL: editFormData.profilePhotoURL || null,
      }

      const response = await fetch(`http://localhost:5279/api/User/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateDto),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditingProfile(false)
      setSuccessMessage("Profile updated successfully!")

      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError("")
    setSuccessMessage("")

    // Validate passwords
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (passwordFormData.newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const changePasswordDto = {
        CurrentPassword: passwordFormData.currentPassword,
        NewPassword: passwordFormData.newPassword,
        ConfirmPassword: passwordFormData.confirmPassword,
      }

      const response = await fetch(`http://localhost:5279/api/User/${userId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changePasswordDto),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) {
          if (errorData.errors.CurrentPassword) {
            throw new Error("Current password is incorrect. Please try again.")
          }
          const errorMessages = Object.entries(errorData.errors)
            .map(([key, messages]: [string, any]) => `${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join(" | ")
          throw new Error(errorMessages || "Validation error occurred")
        }
        throw new Error(errorData.message || "Failed to change password")
      }

      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangingPassword(false)
      setSuccessMessage("Password changed successfully!")

      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      console.error("Error changing password:", err)
      setError(err.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-center text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and personal information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{successMessage}</div>
        )}

        {/* Error Message */}
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              {!isEditingProfile && (
                <Button onClick={() => setIsEditingProfile(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditProfileChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditProfileChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditProfileChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditProfileChange}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={editFormData.city}
                  onChange={handleEditProfileChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/*
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo URL</label>
                <input
                  type="url"
                  name="profilePhotoURL"
                  value={editFormData.profilePhotoURL}
                  onChange={handleEditProfileChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              */}
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              {profile?.profilePhotoURL && (
                <div className="mb-6">
                  <img
                    src={profile.profilePhotoURL || "/placeholder.svg"}
                    alt="Profile"
                    className="w-20 h-20 rounded-lg object-cover border border-border"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile?.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile?.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{profile?.address || "Not provided"}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{profile?.city || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium">
                    {profile?.userType === "BUSINESS" ? "Organization/Bookstore" : "Normal User"}
                  </p>
                </div>
              </div>

              {profile?.averageRating !== undefined && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="font-medium text-lg">
                    {profile.averageRating > 0 ? `${profile.averageRating.toFixed(1)} / 5` : "No ratings yet"}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{new Date(profile?.createdAt || "").toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Security</h2>
              {!isChangingPassword && (
                <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                  Change Password
                </Button>
              )}
            </div>
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordFormData.currentPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Manage your password and account security</p>
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-sm">
                  Your password is securely encrypted. You can change it at any time for security purposes.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
