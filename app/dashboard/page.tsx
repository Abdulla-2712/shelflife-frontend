"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface UserBook {
  bookListingID: number
  title: string
  author: string
  isbn: string
  price: number
  condition: string
  edition: string
  description: string
  availabilityStatus: string
  photoURLs?: string
  isSellable: boolean
  isSwappable: boolean
  quantity: number
  availableQuantity: number
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

export default function DashboardPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"my-books" | "sell" | "orders">("my-books")
  const [myBooks, setMyBooks] = useState<UserBook[]>([])
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([])
  const [outgoingOrders, setOutgoingOrders] = useState<Order[]>([])
  const [activeOrdersTab, setActiveOrdersTab] = useState<"incoming" | "outgoing">("incoming")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingBook, setEditingBook] = useState<UserBook | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [sellFormData, setSellFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    price: "",
    condition: "good",
    edition: "",
    description: "",
    photoURLs: "",
    city: "",
    categoryID: 1,
    isSellable: true,
    isSwappable: false,
  })

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
    if (activeTab === "my-books") {
      fetchMyBooks()
    } else if (activeTab === "orders") {
      if (activeOrdersTab === "incoming") {
        fetchIncomingOrders()
      } else {
        fetchOutgoingOrders()
      }
    }
  }, [activeTab, activeOrdersTab, userId])

  const fetchMyBooks = async () => {
    if (!userId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings`)
      if (!res.ok) throw new Error("Failed to fetch books")
      const data = await res.json()
      setMyBooks(data)
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
      if (!res.ok) throw new Error("Failed to fetch incoming orders")
      const data = await res.json()
      const mappedOrders = data.map((order: any) => ({
        orderID: order.orderId || order.orderID || 0,
        bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
        buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
        sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
        buyerID: order.buyerID || order.buyerId,
        sellerID: order.sellerID || order.sellerId,
        totalPrice: order.totalPrice || order.amount || 0,
        orderStatus: order.status || order.orderStatus || "ACCEPTED",
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        buyerConfirmed: order.buyerConfirmed || false,
        sellerConfirmed: order.sellerConfirmed || false,
      }))
      setIncomingOrders(mappedOrders)
    } catch (err: any) {
      console.error("Error fetching incoming orders:", err)
      setError(err.message || "Failed to fetch incoming orders")
    } finally {
      setLoading(false)
    }
  }

  const fetchOutgoingOrders = async () => {
    if (!userId || !token) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/Orders/outgoing/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Failed to fetch outgoing orders")
      const data = await res.json()
      const mappedOrders = data.map((order: any) => ({
        orderID: order.orderId || order.orderID || 0,
        bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
        buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
        sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
        buyerID: order.buyerID || order.buyerId,
        sellerID: order.sellerID || order.sellerId,
        totalPrice: order.totalPrice || order.amount || 0,
        orderStatus: order.status || order.orderStatus || "ACCEPTED",
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        buyerConfirmed: order.buyerConfirmed || false,
        sellerConfirmed: order.sellerConfirmed || false,
      }))
      setOutgoingOrders(mappedOrders)
    } catch (err: any) {
      console.error("Error fetching outgoing orders:", err)
      setError(err.message || "Failed to fetch outgoing orders")
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

  const confirmDeliveryBuyer = async (orderId: number) => {
    if (!token) return
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`http://localhost:5279/api/Orders/${orderId}/confirm-delivery-buyer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Failed to confirm delivery")
      await fetchOutgoingOrders()
    } catch (err: any) {
      setError(err.message || "Failed to confirm delivery")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleEditBook = (book: UserBook) => {
    setEditingBook(book)
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

      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings/${editingBook.bookListingID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateDto),
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = "Failed to update book"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      await fetchMyBooks()
      setShowEditModal(false)
      setEditingBook(null)
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
        title: sellFormData.title,
        author: sellFormData.author,
        isbn: sellFormData.isbn,
        price: Number.parseFloat(sellFormData.price),
        condition: sellFormData.condition,
        edition: sellFormData.edition,
        description: sellFormData.description,
        photoURLs: sellFormData.photoURLs,
        city: sellFormData.city,
        categoryID: sellFormData.categoryID,
        isSellable: sellFormData.isSellable,
        isSwappable: sellFormData.isSwappable,
        quantity: 1,
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

      setSellFormData({
        isbn: "",
        title: "",
        author: "",
        price: "",
        condition: "good",
        edition: "",
        description: "",
        photoURLs: "",
        city: "",
        categoryID: 1,
        isSellable: true,
        isSwappable: false,
      })

      setActiveTab("my-books")
      await fetchMyBooks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create listing")
    } finally {
      setLoading(false)
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your books and orders</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">{error}</div>}

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("my-books")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${activeTab === "my-books"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            My Books
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${activeTab === "sell"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Sell a Book
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            My Orders
          </button>
        </div>

        {/* My Books Tab */}
        {activeTab === "my-books" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">My Books</h2>
              <p className="text-muted-foreground mt-1">Books you are selling</p>
            </div>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading books...</div>
            ) : myBooks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No books listed yet. Start by selling a book!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cover</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">ISBN</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBooks.map((book) => (
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
                        <td className="px-6 py-4 font-medium">{book.title}</td>
                        <td className="px-6 py-4">{book.author}</td>
                        <td className="px-6 py-4 text-sm">{book.isbn}</td>
                        <td className="px-6 py-4 font-semibold">${book.price?.toFixed(2) ?? "0.00"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {book.availabilityStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditBook(book)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBook(book.bookListingID)}
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
              </div>
            )}
          </div>
        )}

        {/* Sell a Book Tab */}
        {activeTab === "sell" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Sell a Book</h2>
            <div className="bg-secondary p-4 rounded-lg mb-6 border border-border">
              <p className="text-sm font-medium">⚠️ Note: A 10% service fee will be added to your listed price.</p>
            </div>
            <form className="space-y-4 max-w-2xl" onSubmit={handleAddBook}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ISBN *</label>
                  <input
                    type="text"
                    value={sellFormData.isbn}
                    onChange={(e) => setSellFormData({ ...sellFormData, isbn: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter ISBN"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Book Title *</label>
                  <input
                    type="text"
                    value={sellFormData.title}
                    onChange={(e) => setSellFormData({ ...sellFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter book title"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Author *</label>
                  <input
                    type="text"
                    value={sellFormData.author}
                    onChange={(e) => setSellFormData({ ...sellFormData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter author name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Edition</label>
                  <input
                    type="text"
                    value={sellFormData.edition}
                    onChange={(e) => setSellFormData({ ...sellFormData, edition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 2nd Edition"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input
                    type="number"
                    value={sellFormData.price}
                    onChange={(e) => setSellFormData({ ...sellFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition *</label>
                  <select
                    value={sellFormData.condition}
                    onChange={(e) => setSellFormData({ ...sellFormData, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="good">Good</option>
                    <option value="like-new">Like New</option>
                    <option value="acceptable">Acceptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={sellFormData.city}
                  onChange={(e) => setSellFormData({ ...sellFormData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={sellFormData.description}
                  onChange={(e) => setSellFormData({ ...sellFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the book's condition, any notes, defects, etc."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Photo URL</label>
                <input
                  type="text"
                  value={sellFormData.photoURLs}
                  onChange={(e) => setSellFormData({ ...sellFormData, photoURLs: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter photo filename (e.g., book1.jpg)"
                />
              </div>

              <Button type="submit" className="bg-primary hover:bg-primary/90 w-full md:w-auto" disabled={loading}>
                {loading ? "Listing..." : "List Book for Sale"}
              </Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>

            {/* Order Sub-tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              <button
                onClick={() => setActiveOrdersTab("incoming")}
                className={`px-4 py-2 font-medium border-b-2 transition ${activeOrdersTab === "incoming"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Incoming Orders (Seller)
              </button>
              <button
                onClick={() => setActiveOrdersTab("outgoing")}
                className={`px-4 py-2 font-medium border-b-2 transition ${activeOrdersTab === "outgoing"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Outgoing Orders (Buyer)
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : (
              <>
                {/* Incoming Orders */}
                {activeOrdersTab === "incoming" && (
                  <div>
                    {incomingOrders.length === 0 ? (
                      <div className="bg-secondary border border-border rounded-lg p-8 text-center">
                        <p className="text-muted-foreground">No incoming orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {incomingOrders.map((order) => (
                          <div
                            key={order.orderID}
                            className="bg-secondary border border-border rounded-lg p-6 hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{order.bookTitle}</h3>
                                <p className="text-sm text-muted-foreground">Buyer: {order.buyerName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Ordered: {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ${order.totalPrice?.toFixed(2) ?? "0.00"}
                                </p>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                                    order.orderStatus,
                                  )}`}
                                >
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {order.orderStatus === "ACCEPTED" && (
                                <button
                                  onClick={() => markAsDelivering(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                                >
                                  {updatingOrderId === order.orderID ? "Updating..." : "📦 Mark as Delivering"}
                                </button>
                              )}
                              {order.orderStatus === "DELIVERING" && !order.sellerConfirmed && (
                                <button
                                  onClick={() => confirmDeliverySeller(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                                >
                                  {updatingOrderId === order.orderID ? "Confirming..." : "✓ Confirm Delivery"}
                                </button>
                              )}
                              {order.orderStatus === "DELIVERING" && order.sellerConfirmed && !order.buyerConfirmed && (
                                <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                  ⏳ Waiting for buyer confirmation...
                                </div>
                              )}
                              {order.orderStatus === "COMPLETED" && (
                                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                  ✅ Order completed
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Outgoing Orders */}
                {activeOrdersTab === "outgoing" && (
                  <div>
                    {outgoingOrders.length === 0 ? (
                      <div className="bg-secondary border border-border rounded-lg p-8 text-center">
                        <p className="text-muted-foreground">No outgoing orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {outgoingOrders.map((order) => (
                          <div
                            key={order.orderID}
                            className="bg-secondary border border-border rounded-lg p-6 hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{order.bookTitle}</h3>
                                <p className="text-sm text-muted-foreground">Seller: {order.sellerName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Ordered: {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ${order.totalPrice?.toFixed(2) ?? "0.00"}
                                </p>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                                    order.orderStatus,
                                  )}`}
                                >
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {order.orderStatus === "DELIVERING" && !order.buyerConfirmed && (
                                <button
                                  onClick={() => confirmDeliveryBuyer(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                                >
                                  {updatingOrderId === order.orderID ? "Confirming..." : "✓ Confirm Delivery"}
                                </button>
                              )}
                              {order.orderStatus === "DELIVERING" && order.buyerConfirmed && !order.sellerConfirmed && (
                                <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                  ⏳ Waiting for seller confirmation...
                                </div>
                              )}
                              {order.orderStatus === "COMPLETED" && (
                                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                  ✅ Order completed
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Edit Book Modal */}
        {showEditModal && editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="number"
                      value={editingBook.price}
                      onChange={(e) => setEditingBook({ ...editingBook, price: Number.parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                      value={editingBook.condition}
                      onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="good">Good</option>
                      <option value="like-new">Like New</option>
                      <option value="acceptable">Acceptable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingBook.description}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBook} disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
