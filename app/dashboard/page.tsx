"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Package, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react"

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
  const [myBooks, setMyBooks] = useState<UserBook[]>([])
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([])
  const [outgoingOrders, setOutgoingOrders] = useState<Order[]>([])
  const [activeOrdersTab, setActiveOrdersTab] = useState<"incoming" | "outgoing">("incoming")
  const [editingBook, setEditingBook] = useState<UserBook | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("my-books")
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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
    if (!userId || !token) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
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
      const mappedOrders = data.map((order: any) => {
        const price =
          order.totalPrice ||
          order.amount ||
          order.price ||
          order.listing?.price ||
          order.book?.price ||
          order.bookPrice ||
          0
        return {
          orderID: order.orderId || order.orderID || 0,
          bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
          buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
          sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
          buyerID: order.buyerID || order.buyerId,
          sellerID: order.sellerID || order.sellerId,
          totalPrice: price,
          orderStatus: order.status || order.orderStatus || "ACCEPTED",
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          buyerConfirmed: order.buyerConfirmed || false,
          sellerConfirmed: order.sellerConfirmed || false,
        }
      })
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
      const mappedOrders = data.map((order: any) => {
        const price =
          order.totalPrice ||
          order.amount ||
          order.price ||
          order.listing?.price ||
          order.book?.price ||
          order.bookPrice ||
          0
        return {
          orderID: order.orderId || order.orderID || 0,
          bookTitle: order.bookTitle || order.listingTitle || "Unknown Book",
          buyerName: order.buyerName || order.buyerUsername || "Unknown Buyer",
          sellerName: order.sellerName || order.sellerUsername || "Unknown Seller",
          buyerID: order.buyerID || order.buyerId,
          sellerID: order.sellerID || order.sellerId,
          totalPrice: price,
          orderStatus: order.status || order.orderStatus || "ACCEPTED",
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          buyerConfirmed: order.buyerConfirmed || false,
          sellerConfirmed: order.sellerConfirmed || false,
        }
      })
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
    if (!editingBook || !userId || !token) return
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
    if (!userId || !token || !confirm("Are you sure you want to delete this listing?")) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
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
    if (!userId || !token) {
      setError("User not authenticated")
      return
    }
    setLoading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("title", sellFormData.title)
      formData.append("author", sellFormData.author)
      formData.append("isbn", sellFormData.isbn)
      formData.append("price", sellFormData.price)
      formData.append("condition", sellFormData.condition)
      formData.append("edition", sellFormData.edition)
      formData.append("description", sellFormData.description)
      formData.append("city", sellFormData.city)
      formData.append("categoryID", String(sellFormData.categoryID))
      formData.append("isSellable", String(sellFormData.isSellable))
      formData.append("isSwappable", String(sellFormData.isSwappable))
      formData.append("quantity", "1")
      if (selectedImage) {
        formData.append("photoFile", selectedImage)
      }
      const res = await fetch(`http://localhost:5279/api/Listings/${userId}/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
      setSelectedImage(null)
      setImagePreview(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "DELIVERING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Clock className="w-4 h-4" />
      case "DELIVERING":
        return <Package className="w-4 h-4" />
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />
      case "CANCELLED":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your books and orders</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          {["my-books", "sell", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "my-books" && "📚 My Books"}
              {tab === "sell" && "📖 Sell a Book"}
              {tab === "orders" && "📦 My Orders"}
            </button>
          ))}
        </div>

        {/* My Books Tab */}
        {activeTab === "my-books" && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">My Books</h2>
                <p className="text-gray-600 mt-1">Books you are selling</p>
              </div>
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading books...</div>
              ) : myBooks.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-lg">No books listed yet</p>
                  <p className="text-sm mt-1">Start by selling a book!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cover</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Author</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ISBN</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myBooks.map((book) => (
                        <tr key={book.bookListingID} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            {book.photoURLs ? (
                              <img
                                src={`http://localhost:5279/images/${book.photoURLs}`}
                                alt={book.title}
                                className="h-16 w-12 object-cover rounded-lg shadow-sm"
                              />
                            ) : (
                              <div className="h-16 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                                📚
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{book.title}</td>
                          <td className="px-6 py-4 text-gray-700">{book.author}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{book.isbn}</td>
                          <td className="px-6 py-4 font-semibold text-purple-600">
                            ${book.price?.toFixed(2) ?? "0.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {book.availabilityStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBook(book)}
                                className="gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBook(book.bookListingID)}
                                className="text-red-600 hover:text-red-700 gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        )}

        {/* Sell a Book Tab */}
        {activeTab === "sell" && (
          <Card className="border-purple-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                List a Book for Sale
              </CardTitle>
              <CardDescription>Add details about the book you want to sell</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-6 max-w-2xl" onSubmit={handleAddBook}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">ISBN *</label>
                    <input
                      type="text"
                      value={sellFormData.isbn}
                      onChange={(e) => setSellFormData({ ...sellFormData, isbn: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="Enter ISBN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Book Title *</label>
                    <input
                      type="text"
                      value={sellFormData.title}
                      onChange={(e) => setSellFormData({ ...sellFormData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="Enter book title"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Author *</label>
                    <input
                      type="text"
                      value={sellFormData.author}
                      onChange={(e) => setSellFormData({ ...sellFormData, author: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Edition</label>
                    <input
                      type="text"
                      value={sellFormData.edition}
                      onChange={(e) => setSellFormData({ ...sellFormData, edition: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="e.g., 2nd Edition"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Price *</label>
                    <input
                      type="number"
                      value={sellFormData.price}
                      onChange={(e) => setSellFormData({ ...sellFormData, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Condition *</label>
                    <select
                      value={sellFormData.condition}
                      onChange={(e) => setSellFormData({ ...sellFormData, condition: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      required
                    >
                      <option value="good">Good</option>
                      <option value="like-new">Like New</option>
                      <option value="acceptable">Acceptable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">City</label>
                  <input
                    type="text"
                    value={sellFormData.city}
                    onChange={(e) => setSellFormData({ ...sellFormData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Description</label>
                  <textarea
                    value={sellFormData.description}
                    onChange={(e) => setSellFormData({ ...sellFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Describe the book's condition, any notes, defects, etc."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Book Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Preview:</p>
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-40 w-32 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg gap-2 transition"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  {loading ? "Listing..." : "List Book for Sale"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

            {/* Order Sub-tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveOrdersTab("incoming")}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeOrdersTab === "incoming"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                📥 Incoming (Seller)
              </button>
              <button
                onClick={() => setActiveOrdersTab("outgoing")}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeOrdersTab === "outgoing"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                📤 Outgoing (Buyer)
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : (
              <>
                {/* Incoming Orders */}
                {activeOrdersTab === "incoming" && (
                  <div className="space-y-4">
                    {incomingOrders.length === 0 ? (
                      <Card className="border-gray-100">
                        <CardContent className="pt-6 text-center text-gray-500">No incoming orders yet</CardContent>
                      </Card>
                    ) : (
                      incomingOrders.map((order) => (
                        <Card key={order.orderID} className="border-gray-100 hover:shadow-md transition">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Order #{order.orderID}</h3>
                                <p className="text-sm text-gray-600 mt-1">{order.bookTitle}</p>
                                <p className="text-sm text-gray-600">
                                  Buyer: <span className="font-medium">{order.buyerName}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600">
                                  ${order.totalPrice?.toFixed(2) ?? "0.00"}
                                </p>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-2 border ${getStatusColor(
                                    order.orderStatus,
                                  )}`}
                                >
                                  {getStatusIcon(order.orderStatus)}
                                  {order.orderStatus}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                              {order.orderStatus === "ACCEPTED" && (
                                <Button
                                  onClick={() => markAsDelivering(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                  <Package className="w-4 h-4" />
                                  Mark as Delivering
                                </Button>
                              )}
                              {order.orderStatus === "DELIVERING" && !order.sellerConfirmed && (
                                <Button
                                  onClick={() => confirmDeliverySeller(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Confirm Delivery
                                </Button>
                              )}
                              {order.orderStatus === "DELIVERING" && order.sellerConfirmed && !order.buyerConfirmed && (
                                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Waiting for buyer confirmation
                                </div>
                              )}
                              {order.orderStatus === "COMPLETED" && (
                                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Order completed
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* Outgoing Orders */}
                {activeOrdersTab === "outgoing" && (
                  <div className="space-y-4">
                    {outgoingOrders.length === 0 ? (
                      <Card className="border-gray-100">
                        <CardContent className="pt-6 text-center text-gray-500">No outgoing orders yet</CardContent>
                      </Card>
                    ) : (
                      outgoingOrders.map((order) => (
                        <Card key={order.orderID} className="border-gray-100 hover:shadow-md transition">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Order #{order.orderID}</h3>
                                <p className="text-sm text-gray-600 mt-1">{order.bookTitle}</p>
                                <p className="text-sm text-gray-600">
                                  Seller: <span className="font-medium">{order.sellerName}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600">
                                  ${order.totalPrice?.toFixed(2) ?? "0.00"}
                                </p>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-2 border ${getStatusColor(
                                    order.orderStatus,
                                  )}`}
                                >
                                  {getStatusIcon(order.orderStatus)}
                                  {order.orderStatus}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                              {order.orderStatus === "DELIVERING" && !order.buyerConfirmed && (
                                <Button
                                  onClick={() => confirmDeliveryBuyer(order.orderID)}
                                  disabled={updatingOrderId === order.orderID}
                                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Confirm Delivery
                                </Button>
                              )}
                              {order.orderStatus === "DELIVERING" && order.buyerConfirmed && !order.sellerConfirmed && (
                                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Waiting for seller confirmation
                                </div>
                              )}
                              {order.orderStatus === "COMPLETED" && (
                                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Order completed
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
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
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle>Edit Book</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Title</label>
                      <input
                        type="text"
                        value={editingBook.title}
                        onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Author</label>
                      <input
                        type="text"
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Price</label>
                      <input
                        type="number"
                        value={editingBook.price}
                        onChange={(e) => setEditingBook({ ...editingBook, price: Number.parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Condition</label>
                      <select
                        value={editingBook.condition}
                        onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      >
                        <option value="good">Good</option>
                        <option value="like-new">Like New</option>
                        <option value="acceptable">Acceptable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Description</label>
                    <textarea
                      value={editingBook.description}
                      onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setShowEditModal(false)} className="px-6">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateBook}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
