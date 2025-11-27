"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")

    if (token && userType) {
      if (userType === 'NORMAL_USER') {
        window.location.href = "/dashboard"
      } else if (userType === 'BUSINESS') {
        window.location.href = "/org-dashboard"
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      email: email.trim(),
      password: password.trim(),
    }

    try {
      const response = await fetch("http://localhost:5279/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        // Store JWT token
        localStorage.setItem("token", result.token)

        // Store user type
        const userType = result.user.userType
        localStorage.setItem("userType", userType)

        // Also store user ID for easy access
        localStorage.setItem("userId", result.user.userID.toString())

        // Redirect based on user type
        if (userType === 'NORMAL_USER') {
          window.location.href = "/dashboard"
        } else if (userType === 'BUSINESS') {
          window.location.href = "/org-dashboard"
        } else {
          // Fallback
          window.location.href = "/"
        }
      } else {
        alert(result.message || "Login failed")
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      alert("Server error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}