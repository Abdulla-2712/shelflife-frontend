"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const payload = {   
      token,
      newPassword: password.trim(),
    }

    try {
      const response = await fetch("http://localhost:5279/api/Auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const result = await response.json()
        setError(result.message || "An error occurred. Please try again.")
      }
    } catch (error) {
      console.error(error)
      setError("Server error")
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-muted-foreground mb-6">
              Invalid or missing reset link. Please request a new password reset.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-primary hover:bg-primary/90">Request Reset Link</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
          <p className="text-muted-foreground mb-8">Enter your new password below</p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">Your password has been successfully reset.</p>
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90">Back to Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
