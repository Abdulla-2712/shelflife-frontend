"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for token (matching your login page)
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  if (!mounted) {
    return (
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              B
            </div>
            <span className="text-xl font-bold text-foreground">ShelfLife</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="text-foreground hover:text-primary transition">
              Browse Books
            </Link>
          </nav>
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={isLoggedIn ? "/browse" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            B
          </div>
          <span className="text-xl font-bold text-foreground">ShelfLife</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn && (
            <Link href="/dashboard" className="text-foreground hover:text-primary transition">
              Dashboard
            </Link>
          )}
          <Link href="/browse" className="text-foreground hover:text-primary transition">
            Browse Books
          </Link>

          {isLoggedIn ? (
            <Button onClick={handleLogout} variant="outline" className="hover:bg-destructive hover:text-destructive-foreground">
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-foreground hover:text-primary transition">
                Login
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90">Register</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="absolute top-full left-0 right-0 bg-card border-b border-border md:hidden">
            <div className="flex flex-col gap-4 p-4">
              {isLoggedIn && (
                <Link href="/dashboard" className="text-foreground hover:text-primary transition">
                  Dashboard
                </Link>
              )}
              <Link href="/browse" className="text-foreground hover:text-primary transition">
                Browse Books
              </Link>

              {isLoggedIn ? (
                <Button onClick={handleLogout} variant="outline" className="w-full hover:bg-destructive hover:text-destructive-foreground">
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-foreground hover:text-primary transition">
                    Login
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-primary hover:bg-primary/90">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}