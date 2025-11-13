"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface Book {
  id: number
  title: string
  author: string
  seller: string
  price: number
  location: string
  type: "buy" | "borrow"
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)

  // Mock book data - in a real app, fetch based on bookId
  const book: Book = {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    seller: "John Doe",
    price: 12.99,
    location: "New York, NY",
    type: "buy",
  }

  const serviceFee = book.price * 0.1
  const total = book.price + serviceFee

  const handleConfirmPurchase = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setOrderConfirmed(true)
    }, 1500)
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-8 mb-6">
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-lg mb-6">Your {book.type === "buy" ? "purchase" : "borrow"} has been confirmed.</p>
            <p className="text-sm mb-6">
              {book.type === "buy"
                ? "You will receive this book within 3-5 business days."
                : "You can borrow this book for 14 days."}
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-muted-foreground mb-2">{book.title}</p>
              <p className="font-semibold">{book.author}</p>
            </div>
            <Link href="/browse">
              <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/book-details/${book.id}`}>
          <Button variant="outline" className="mb-6 bg-transparent">
            Back to Details
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="bg-secondary rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
              <p className="text-sm text-muted-foreground mb-4">Seller: {book.seller}</p>
              <p className="text-sm text-muted-foreground">{book.location}</p>
            </div>

            <div className="space-y-3 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Book Price:</span>
                <span className="font-medium">${book.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee (10%):</span>
                <span className="font-medium">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              {book.type === "buy"
                ? "Delivery will take 3-5 business days. You will receive tracking information via email."
                : "You can keep this book for 14 days. Return it in the same condition."}
            </p>
          </div>

          {/* Delivery/Return Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{book.type === "buy" ? "Delivery Address" : "Borrowing Terms"}</h2>

            {book.type === "buy" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter delivery address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <p className="font-medium">Borrowing Period: 14 Days</p>
                <p className="text-sm text-muted-foreground">Please return the book in original condition.</p>
                <p className="text-sm text-muted-foreground">Damage or late returns may incur additional charges.</p>
              </div>
            )}
          </div>

          {/* Confirm Purchase */}
          <div className="flex gap-3">
            <Link href={`/book-details/${book.id}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isProcessing ? "Processing..." : `Confirm ${book.type === "buy" ? "Purchase" : "Borrow"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
