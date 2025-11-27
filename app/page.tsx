"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-accent py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Giving a second life to books
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Connect with book lovers in your community. Find your next favorite read or share your collection.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Get Started
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Browse Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How ShelfLife Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground">Sign up as a buyer, seller, or organization to get started.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">List or Browse</h3>
              <p className="text-muted-foreground">Sell your books or browse thousands of listings in your area.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Delivery</h3>
              <p className="text-muted-foreground">Monitor your orders from pickup to delivery in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to start your book journey?</h2>
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
