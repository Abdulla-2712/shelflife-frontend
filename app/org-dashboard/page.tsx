"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface OrgBook {
  bookListingID: number
  isbn: string
  title: string
  author: string
  price: number
  condition: string
  edition: string
  description: string
  photoURLs?: string
  quantity: number
  availableQuantity: number
  availabilityStatus: string
  isSellable: boolean
  isSwappable: boolean
  city?: string
  categoryID?: number
}

interface Order {
  orderID: number
  bookTitle: string
  buyerName: string
  sellerName: string
  buyerID?: number
  sellerID?: number
  totalPrice: number
  orderStatus: string
  orderDate: string
  buyerConfirmed?: boolean
  sellerConfirmed?: boolean
}

export default function OrgDashboardPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"books" | "incoming" | "sold">("books")
  const [books, setBooks] = useState<OrgBook[]>([])
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([])
  const [soldOrders, setSoldOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    author: "",
    price: "",
    condition: "Good",
    edition: "",
    description: "",
    photoURLs: "",
    quantity: "1",
    city: "",
    categoryID: 1,
  })

  const [editingBook, setEditingBook] = useState<OrgBook | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Decode JWT token to get user ID
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token")
    setToken(storedToken)

    if (!storedToken) {
      setError("No authentication token found. Please login.")
      return
    }

    try {
      const payload = storedToken.split(".")[1]
      const decodedPayload = JSON.parse(atob(payload))
      const uid = decodedPayload.sub || decodedPayload.userId || decodedPayload.id || decodedPayload.nameid

      if (uid) {
        setUserId(Number.parseInt(uid))
      } else {
        setError("User ID not found in token")
      }
    } catch (err) {
      console.error("Error decoding token:", err)
      setError("Invalid authentication token")
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    if (activeTab === "books") {
      fetchMyBooks()
    } else if (activeTab === "incoming") {
      fetchIncomingOrders()
    } else if (activeTab === "sold") {
      fetchSoldOrders()
    }
  }, [activeTab, userId])

  const fetchMyBooks = async () => {
    if (!userId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings`)
      if (!res.ok) throw new Error("Failed to fetch books")
      const data = await res.json()
      setBooks(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Server error")
    } finally {
      setLoading(false)
    }
  }
const fetchIncomingOrders = async () => {
  if (!userId || !token) return
  setLoading(true)
  setError("")
  try {
    const res = await fetch(`http://localhost:5279/api/Orders/incoming/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) throw new Error("Failed to fetch orders")
    const data = await res.json()
    const mappedOrders = data.map((order: any) => ({
      orderID: order.orderId || order.orderID || 0,
      bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
      buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
      sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
      buyerID: order.buyerID || order.buyerId,
      sellerID: order.sellerID || order.sellerId,
      totalPrice: order.totalPrice || order.amount || 0,
      orderStatus: order.status || order.orderStatus || "Pending",
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      buyerConfirmed: order.buyerConfirmed || false,
      sellerConfirmed: order.sellerConfirmed || false,
    }))
    
    // Filter OUT completed orders from incoming orders
    setIncomingOrders(
      mappedOrders.filter((order: Order) => order.orderStatus !== "COMPLETED")
    )
  } catch (err: any) {
    console.error(err)
    setError(err.message || "Server error")
  } finally {
    setLoading(false)
  }
}

const fetchSoldOrders = async () => {
  if (!userId || !token) return
  setLoading(true)
  setError("")
  try {
    const res = await fetch(`http://localhost:5279/api/Orders/incoming/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) throw new Error("Failed to fetch orders")
    const data = await res.json()
    
    // Map the orders first (same as fetchIncomingOrders)
    const mappedOrders = data.map((order: any) => ({
      orderID: order.orderId || order.orderID || 0,
      bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
      buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
      sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
      buyerID: order.buyerID || order.buyerId,
      sellerID: order.sellerID || order.sellerId,
      totalPrice: order.totalPrice || order.amount || 0,
      orderStatus: order.status || order.orderStatus || "Pending",
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      buyerConfirmed: order.buyerConfirmed || false,
      sellerConfirmed: order.sellerConfirmed || false,
    }))
    
    // Filter for COMPLETED orders (case-sensitive)
    setSoldOrders(
      mappedOrders.filter((order: Order) => order.orderStatus === "COMPLETED")
    )
  } catch (err: any) {
    console.error(err)
    setError(err.message || "Server error")
  } finally {
    setLoading(false)
  }
}

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setError("User not authenticated")
      return
    }
    setLoading(true)
    setError("")

    try {
      const createDto = {
        isbn: newBook.isbn,
        title: newBook.title,
        author: newBook.author,
        price: Number.parseFloat(newBook.price),
        condition: newBook.condition,
        edition: newBook.edition,
        description: newBook.description,
        photoURLs: newBook.photoURLs,
        city: newBook.city,
        categoryID: newBook.categoryID,
        isSellable: true,
        isSwappable: false,
        quantity: Number.parseInt(newBook.quantity) || 1,
      }

      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDto),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to create listing")
      }

      setNewBook({
        isbn: "",
        title: "",
        author: "",
        price: "",
        condition: "Good",
        edition: "",
        description: "",
        photoURLs: "",
        quantity: "1",
        city: "",
        categoryID: 1,
      })
      setShowForm(false)
      await fetchMyBooks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (book: OrgBook) => {
    setEditingBook({ ...book })
    setShowEditModal(true)
  }

  const handleUpdateBook = async () => {
    if (!editingBook || !userId) return

    setLoading(true)
    setError("")
    try {
      const updateDto = {
        bookListingID: editingBook.bookListingID,
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        price: editingBook.isSellable ? editingBook.price : null,
        condition: editingBook.condition,
        edition: editingBook.edition || "",
        description: editingBook.description || "",
        photoURLs: editingBook.photoURLs || "",
        city: editingBook.city || "",
        categoryID: editingBook.categoryID || 1,
        isSellable: editingBook.isSellable,
        isSwappable: editingBook.isSwappable,
        quantity: editingBook.quantity || 1,
        availabilityStatus: editingBook.availabilityStatus || "Available",
      }

      console.log("Updating book with data:", updateDto)

      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings/${editingBook.bookListingID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateDto),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Update error response:", errorText)
        let errorMessage = "Failed to update book"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      setShowEditModal(false)
      setEditingBook(null)
      await fetchMyBooks()
    } catch (err: any) {
      console.error("Update error:", err)
      setError(err.message || "Failed to update book")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: number) => {
    if (!userId || !confirm("Are you sure you want to delete this listing?")) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings/${bookId}`, { method: "DELETE" })

      if (!res.ok) throw new Error("Failed to delete book")

      await fetchMyBooks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to delete book")
    } finally {
      setLoading(false)
    }
  }

  const markAsDelivering = async (orderId: number) => {
    if (!token) return
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`http://localhost:5279/api/Orders/${orderId}/mark-delivering`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Failed to update order")
      await fetchIncomingOrders()
    } catch (err: any) {
      setError(err.message || "Failed to update order")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const confirmDeliverySeller = async (orderId: number) => {
    if (!token) return
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`http://localhost:5279/api/Orders/${orderId}/confirm-delivery-seller`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Failed to confirm delivery")
      await fetchIncomingOrders()
    } catch (err: any) {
      setError(err.message || "Failed to confirm delivery")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800"
      case "DELIVERING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          {activeTab === "books" && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
              {showForm ? "Cancel" : "Add Book"}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("books")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "books"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Books
          </button>
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "incoming"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Incoming Orders
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "sold"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Sold Books
          </button>
        </div>

        {/* Add Book Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Add Book to Collection</h2>
            <form onSubmit={handleAddBook} className="space-y-4 max-w-4xl">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-0-7432-7356-5"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Enter book title"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Enter author name"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBook.price}
                    onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBook.condition}
                    onChange={(e) => setNewBook({ ...newBook, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Edition</label>
                  <input
                    type="text"
                    value={newBook.edition}
                    onChange={(e) => setNewBook({ ...newBook, edition: e.target.value })}
                    placeholder="1st Edition"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={newBook.city}
                  onChange={(e) => setNewBook({ ...newBook, city: e.target.value })}
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Enter book description"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Photo URL</label>
                <input
                  type="text"
                  value={newBook.photoURLs}
                  onChange={(e) => setNewBook({ ...newBook, photoURLs: e.target.value })}
                  placeholder="Enter photo filename (e.g., book1.jpg)"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newBook.quantity}
                  onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Adding..." : "Add Book"}
              </Button>
            </form>
          </div>
        )}

        {/* My Books Tab */}
        {activeTab === "books" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading books...</div>
            ) : books.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No books in collection yet. Add your first book!
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Cover</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">ISBN</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Condition</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Available</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.bookListingID} className="border-b border-border hover:bg-secondary transition">
                      <td className="px-6 py-4">
                        {book.photoURLs ? (
                          <img
                            src={`http://localhost:5279/images/${book.photoURLs}`}
                            alt={book.title}
                            className="h-16 w-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">📚</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{book.isbn}</td>
                      <td className="px-6 py-4">{book.title}</td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{book.condition}</td>
                      <td className="px-6 py-4">{book.quantity}</td>
                      <td className="px-6 py-4">{book.availableQuantity}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button onClick={() => handleEditClick(book)} variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteBook(book.bookListingID)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Incoming Orders Tab */}
        {activeTab === "incoming" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading incoming orders...</div>
            ) : incomingOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No incoming orders yet.</div>
            ) : (
              <div className="space-y-4 p-6">
                {incomingOrders.map((order) => (
                  <div key={order.orderID} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.orderID}</h3>
                        <p className="text-sm text-muted-foreground">{order.bookTitle}</p>
                        <p className="text-sm text-muted-foreground">Buyer: {order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${(order.totalPrice || 0).toFixed(2)}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {order.orderStatus === "ACCEPTED" && (
                        <button
                          onClick={() => markAsDelivering(order.orderID)}
                          disabled={updatingOrderId === order.orderID}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          {updatingOrderId === order.orderID ? "Updating..." : "📦 Mark as Delivering"}
                        </button>
                      )}
                      {order.orderStatus === "DELIVERING" && !order.sellerConfirmed && (
                        <button
                          onClick={() => confirmDeliverySeller(order.orderID)}
                          disabled={updatingOrderId === order.orderID}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {updatingOrderId === order.orderID ? "Confirming..." : "✓ Confirm Delivery"}
                        </button>
                      )}
                      {order.orderStatus === "DELIVERING" && order.sellerConfirmed && !order.buyerConfirmed && (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                          ⏳ Waiting for buyer confirmation...
                        </div>
                      )}
                      {order.orderStatus === "COMPLETED" && (
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                          ✓ Order completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sold Books Tab */}
        {activeTab === "sold" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading sold orders...</div>
            ) : soldOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No sold books yet.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Book Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Buyer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {soldOrders.map((order) => (
                    <tr key={order.orderID} className="border-b border-border hover:bg-secondary transition">
                      <td className="px-6 py-4 text-sm">#{order.orderID}</td>
                      <td className="px-6 py-4">{order.bookTitle}</td>
                      <td className="px-6 py-4">{order.buyerName}</td>
                      <td className="px-6 py-4">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Edit Book</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBook.price}
                    onChange={(e) => setEditingBook({ ...editingBook, price: Number.parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <input
                    type="text"
                    value={editingBook.condition}
                    onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={editingBook.quantity}
                    onChange={(e) => setEditingBook({ ...editingBook, quantity: Number.parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateBook} className="bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={() => setShowEditModal(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
