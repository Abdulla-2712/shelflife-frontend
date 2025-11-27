import type React from "react"
import AuthGuard from "@/components/AuthGuard"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AuthGuard allowedRoles={["NORMAL_USER"]}>{children}</AuthGuard>
}
