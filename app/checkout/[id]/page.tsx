"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface Book {
  bookListingID: number
  title: string
  author?: string
  userName?: string
  ownerName?: string
  price?: number
  city?: string
  description?: string
  isbn?: string
  edition?: string
  pages?: number
  publishedYear?: number
  isSellable: boolean
  photoURLs?: string
  userID?: number
}

interface PaymentBreakdown {
  orderID: number
  buyerPays: number
  paymentSummary: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = Number(params.id)
  
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown | null>(null)
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null)

  // Get logged-in user ID from JWT
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    
    console.log("=== TOKEN DEBUG ===")
    console.log("Token exists:", !!token)
    
    if (!token) {
      setError("Please login to continue")
      setLoading(false)
      return
    }

    try {
      const parts = token.split('.')
      console.log("Token parts:", parts.length)
      
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }
      
      const payload = JSON.parse(atob(parts[1]))
      console.log("Token payload:", payload)
      console.log("Available claims:", Object.keys(payload))
      
      const uid = payload.sub || payload.userId || payload.id || payload.nameid
      console.log("Extracted user ID:", uid)
      
      if (uid) {
        setLoggedInUserId(parseInt(uid))
      } else {
        console.error("No user ID found in token. Available keys:", Object.keys(payload))
        setError("Invalid authentication token - no user ID found")
        setLoading(false)
      }
    } catch (err) {
      console.error("Token decode error:", err)
      setError("Invalid authentication token")
      setLoading(false)
    }
  }, [])

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5279/api/Listings/${bookId}`)
        if (!res.ok) throw new Error("Failed to fetch book details")
        const data = await res.json()

        setBook({
          bookListingID: data.bookListingID,
          title: data.title,
          author: data.ownerName,
          userName: data.ownerName,
          ownerName: data.ownerName,
          price: data.price,
          city: data.city,
          description: data.description,
          isbn: data.isbn,
          edition: data.edition,
          pages: data.pages,
          publishedYear: data.publishedYear,
          isSellable: data.isSellable,
          photoURLs: data.photoURLs,
          userID: data.userID
        })
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Server error")
      } finally {
        setLoading(false)
      }
    }
    
    if (loggedInUserId !== null) {
      fetchBook()
    }
  }, [bookId, loggedInUserId])

const handleConfirmPurchase = async () => {
  if (!book || !loggedInUserId) return
  
  // Check if user is trying to buy their own book
  if (book.userID === loggedInUserId) {
    setError("You cannot purchase your own book.")
    return
  }

  setIsProcessing(true)
  setError("")
  
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    
    if (!token) {
      throw new Error("Please login to continue. No authentication token found.")
    }

    console.log("Creating order with token:", token ? "Token exists" : "No token")
    console.log("Buyer ID:", loggedInUserId)
    console.log("Listing ID:", book.bookListingID)
    
    // Create sale order
    const res = await fetch(`http://localhost:5279/api/Orders/sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ListingID: book.bookListingID,
        Quantity: 1
      }),
    })

    console.log("Order creation response status:", res.status)

    if (!res.ok) {
      let message = "Failed to create order"
      const contentType = res.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errData = await res.json()
        message = errData.message || message
        console.error("Error response:", errData)
        
        // ⭐ Handle specific error messages
        if (message.includes("Not enough quantity available")) {
          message = "Sorry, this book is no longer available."
        }
      } else {
        const textError = await res.text()
        message = textError || message
        console.error("Error text:", textError)
      }
      
      if (res.status === 401) {
        message = "Authentication failed. Please login again."
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
      }
      
      throw new Error(message)
    }

    const orderData = await res.json()
    console.log("Order created successfully:", orderData)
    
    // Fetch payment breakdown
    const breakdownRes = await fetch(
      `http://localhost:5279/api/Orders/${orderData.orderID}/payment-breakdown`,
      {
        headers: { "Authorization": `Bearer ${token}` }
      }
    )
    
    if (!breakdownRes.ok) {
      console.error("Payment breakdown fetch failed:", breakdownRes.status)
      throw new Error("Failed to fetch payment breakdown")
    }
    
    const breakdownData = await breakdownRes.json()
    console.log("Payment breakdown:", breakdownData)
    setPaymentBreakdown(breakdownData)
    setOrderConfirmed(true)
  } catch (err: any) {
    console.error("Order creation error:", err)
    setError(err.message || "Failed to create order")
  } finally {
    setIsProcessing(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-8 text-center">Loading book details...</div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-6 mt-8">
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
          <Link href="/browse" className="mt-4 inline-block">
            <Button variant="outline">Back to Browse</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-8 text-center">Book not found.</div>
      </div>
    )
  }

  if (orderConfirmed && paymentBreakdown) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-6 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Your purchase has been successfully placed.</p>
              <p className="text-sm text-gray-500 mt-2">Order ID: #{paymentBreakdown.orderID}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 my-6">
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <p className="text-gray-600">{book.author}</p>
              <p className="text-gray-500 text-sm mt-1">Seller: {book.userName}</p>
              <p className="text-2xl font-bold text-green-600 mt-4">
                Total Paid: ${paymentBreakdown.buyerPays.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {paymentBreakdown.paymentSummary}
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> You can track this order in your dashboard under "My Orders" → "Outgoing Orders"
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  View My Orders
                </Button>
              </Link>
              <Link href="/browse" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto p-6 mt-8">
        <Link href={`/book/${bookId}`}>
          <Button variant="ghost" className="mb-4">
            ← Back to Details
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="border border-gray-200 rounded-lg p-6">
              {book.photoURLs && (
                <div className="mb-4">
                  <img
                    src={`http://localhost:5279/images/${book.photoURLs}`}
                    alt={book.title}
                    className="h-48 w-32 object-cover rounded mx-auto"
                  />
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-gray-600 mb-1">Seller: {book.userName}</p>
              <p className="text-gray-500 text-sm mb-4">{book.city}</p>
              
              {book.isbn && (
                <p className="text-gray-500 text-sm mb-1">ISBN: {book.isbn}</p>
              )}
              {book.edition && (
                <p className="text-gray-500 text-sm mb-4">Edition: {book.edition}</p>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Book Price:</span>
                  <span className="font-semibold">${book.price?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service Fee (10%):</span>
                  <span className="font-semibold">${((book.price || 0) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${((book.price || 0) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> A 10% service fee is added to the book price. The seller will receive ${book.price?.toFixed(2)} and you will pay ${((book.price || 0) * 1.1).toFixed(2)}.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href={`/book/${bookId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button 
              onClick={handleConfirmPurchase}
              disabled={isProcessing || !book.isSellable}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
            >
              {isProcessing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}