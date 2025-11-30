"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"NORMAL_USER" | "BUSINESS" | null>(null)
  const [successMessage, setSuccessMessage] = useState("") // Add this
  const [errorMessage, setErrorMessage] = useState("") // Add this
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    city: "",
    organizationName: "",
    organizationDetails: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("") // Clear previous messages
    setErrorMessage("")

    const payload = {
      userType,
      email: formData.email,
      password: formData.password,
      phone: null,
      name: formData.name,
      Location: formData.location,
      City: formData.city
    }

    try {
      const response = await fetch("http://localhost:5279/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage("Account created successfully! Redirecting to login...")
        console.log(result)
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setErrorMessage(result.message || "Registration failed")
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Server error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground mb-8">Join ShelfLife and start buying, selling, or lending books</p>

          {!userType ? (
            <div className="space-y-4">
              <p className="font-medium mb-4">Select your account type:</p>
              <button
                onClick={() => setUserType("NORMAL_USER")}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-secondary transition text-left"
              >
                <h3 className="font-semibold">Normal User</h3>
                <p className="text-sm text-muted-foreground">Buy, sell, or lend individual books</p>
              </button>
              <button
                onClick={() => setUserType("BUSINESS")}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-secondary transition text-left"
              >
                <h3 className="font-semibold">Organization/Bookstore</h3>
                <p className="text-sm text-muted-foreground">Manage a collection and lend books</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="City, Country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {userType === "BUSINESS" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Details</label>
                    <textarea
                      name="organizationDetails"
                      value={formData.organizationDetails}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setUserType(null)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Create Account
                </Button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
                  {errorMessage}
                </div>
              )}
            </form>
          )}

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}