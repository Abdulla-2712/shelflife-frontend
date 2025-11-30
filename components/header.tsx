"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    const handleStorageChange = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storageChange", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storageChange", handleStorageChange)
    }
  }, [])

  const isOrganization = () => {
    const userType = localStorage.getItem("userType")
    return userType === "BUSINESS"
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  if (!mounted) {
    return (
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold text-foreground">ShelfLife</span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={isLoggedIn ? (isOrganization() ? "/org-dashboard" : "/browse") : "/"}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold text-foreground">ShelfLife</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Dashboard link - only for normal users */}
            {isLoggedIn && (
              <Link href="/dashboard" className="text-sm text-foreground/80 hover:text-primary transition px-3 py-2">
                Dashboard
              </Link>
            )}

            {/* Browse Books - hidden for business users */}
            {!isOrganization() && (
              <Link href="/browse" className="text-sm text-foreground/80 hover:text-primary transition px-3 py-2">
                Browse Books
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition text-foreground text-sm font-medium"
                  >
                    <span>👤 Profile</span>
                    <span className={`text-xs transition-transform ${isProfileOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>

                  {/* Profile dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-secondary rounded-md transition text-foreground"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md transition text-red-600 hover:text-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-secondary rounded-lg transition" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 space-y-2 pb-4">
            {isLoggedIn && !isOrganization() && (
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-foreground/80 hover:bg-secondary rounded-lg transition"
              >
                Dashboard
              </Link>
            )}

            {!isOrganization() && (
              <Link
                href="/browse"
                className="block px-4 py-2 text-foreground/80 hover:bg-secondary rounded-lg transition"
              >
                Browse Books
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-foreground/80 hover:bg-secondary rounded-lg transition"
                >
                  👤 Profile
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 justify-start"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
