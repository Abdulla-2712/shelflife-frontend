import type React from "react"
import AuthGuard from "@/components/AuthGuard"

export default function OrgDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AuthGuard allowedRoles={["BUSINESS"]}>{children}</AuthGuard>
}
