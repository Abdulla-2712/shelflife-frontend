"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        // Check if we are in the browser
        if (typeof window === "undefined") return

        const token = localStorage.getItem("token")
        const userType = localStorage.getItem("userType")

        if (!token) {
            router.push("/login")
            return
        }

        if (allowedRoles.includes(userType || "")) {
            setAuthorized(true)
        } else {
            // Redirect to the correct dashboard based on user type
            if (userType === "NORMAL_USER") {
                router.push("/dashboard")
            } else if (userType === "BUSINESS") {
                router.push("/org-dashboard")
            } else {
                router.push("/")
            }
        }
    }, [router, allowedRoles])

    if (!authorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner className="size-8" />
            </div>
        )
    }

    return <>{children}</>
}
