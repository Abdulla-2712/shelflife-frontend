"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface RouteGuardProps {
  children: React.ReactNode
  requiredUserType: "NORMAL_USER" | "BUSINESS"
  redirectTo?: string
}

export default function RouteGuard({ 
  children, 
  requiredUserType, 
  redirectTo = "/login" 
}: RouteGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem("token")
      const userType = localStorage.getItem("userType")

      if (!token) {
        router.push("/login")
        return
      }

      if (!userType) {
        // Decode token to get user type
        try {
          const payload = token.split(".")[1]
          const decodedPayload = JSON.parse(atob(payload))
          const roleFromToken = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] 
            || decodedPayload.role

          if (roleFromToken !== requiredUserType) {
            // Redirect to appropriate dashboard
            if (roleFromToken === "BUSINESS") {
              router.push("/org-dashboard")
            } else if (roleFromToken === "NORMAL_USER") {
              router.push("/dashboard")
            } else {
              router.push("/login")
            }
            return
          }
        } catch (error) {
          console.error("Token decode error:", error)
          router.push("/login")
          return
        }
      } else if (userType !== requiredUserType) {
        // User type doesn't match
        if (userType === "BUSINESS") {
          router.push("/org-dashboard")
        } else if (userType === "NORMAL_USER") {
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAccess()
  }, [requiredUserType, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}