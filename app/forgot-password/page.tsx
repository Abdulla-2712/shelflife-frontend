"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      email: email.trim(),
    }

    try {
      const response = await fetch("http://localhost:5279/api/Auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSubmitted(true)
        alert("If an account exists with this email, you will receive a password reset link.")
      } else {
        alert("An error occurred. Please try again.")
      }
    } catch (error) {
      console.error(error)
      alert("Server error")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                Check your email for a password reset link. If you don't see it, check your spam folder.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full"
              >
                Try Another Email
              </Button>
            </div>
          )}

          <p className="text-center text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
