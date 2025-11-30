"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Package, CheckCircle2, Clock, AlertCircle } from "lucide-react"

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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    author: "",
    price: "",
    condition: "0",
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
          orderStatus: order.status || order.orderStatus || "Pending",
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          buyerConfirmed: order.buyerConfirmed || false,
          sellerConfirmed: order.sellerConfirmed || false,
        }
      })
      setIncomingOrders(mappedOrders.filter((order: Order) => order.orderStatus !== "COMPLETED"))
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
          orderStatus: order.status || order.orderStatus || "Pending",
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          buyerConfirmed: order.buyerConfirmed || false,
          sellerConfirmed: order.sellerConfirmed || false,
        }
      })
      setSoldOrders(mappedOrders.filter((order: Order) => order.orderStatus === "COMPLETED"))
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Server error")
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
      formData.append("isbn", newBook.isbn)
      formData.append("title", newBook.title)
      formData.append("author", newBook.author)
      formData.append("price", newBook.price)
      formData.append("condition", newBook.condition)
      formData.append("edition", newBook.edition)
      formData.append("description", newBook.description)
      formData.append("city", newBook.city)
      formData.append("categoryID", newBook.categoryID.toString())
      formData.append("isSellable", "true")
      formData.append("isSwappable", "false")
      formData.append("quantity", newBook.quantity)
      if (photoFile) {
        formData.append("photoFile", photoFile)
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
      setNewBook({
        isbn: "",
        title: "",
        author: "",
        price: "",
        condition: "0",
        edition: "",
        description: "",
        photoURLs: "",
        quantity: "1",
        city: "",
        categoryID: 1,
      })
      setPhotoFile(null)
      setShowForm(false)
      await fetchMyBooks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to add book")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (book: OrgBook) => {
    setEditingBook({ ...book })
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
        availableQuantity: editingBook.availableQuantity || 0,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Organization Dashboard</h1>
          <p className="text-gray-600">Manage your book collection and orders</p>
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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {["books", "incoming", "sold"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "books" | "incoming" | "sold")}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "books" && "📚 My Books"}
              {tab === "incoming" && "📥 Incoming Orders"}
              {tab === "sold" && "✓ Sold Books"}
            </button>
          ))}
        </div>

        {/* Add Book Form */}
        {showForm && (
          <Card className="mb-8 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Book to Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddBook} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      ISBN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                      placeholder="978-0-7432-7356-5"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Book Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      placeholder="Enter book title"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newBook.author}
                      onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      placeholder="Enter author name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBook.price}
                      onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newBook.condition}
                      onChange={(e) => setNewBook({ ...newBook, condition: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Edition</label>
                    <input
                      type="text"
                      value={newBook.edition}
                      onChange={(e) => setNewBook({ ...newBook, edition: e.target.value })}
                      placeholder="1st Edition"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">City</label>
                  <input
                    type="text"
                    value={newBook.city}
                    onChange={(e) => setNewBook({ ...newBook, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Description</label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    placeholder="Enter book description"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Book Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {photoFile && <p className="text-sm text-gray-600 mt-2">Selected: {photoFile.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Book"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && activeTab === "books" && (
          <Button onClick={() => setShowForm(true)} className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        )}

        {/* My Books Tab */}
        {activeTab === "books" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading books...</div>
            ) : books.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No books in collection yet</p>
                <p className="text-sm mt-1">Add your first book to get started</p>
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Condition</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {books.map((book) => (
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
                        <td className="px-6 py-4 font-semibold text-indigo-600">${book.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {book.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-medium">{book.availableQuantity}</span>
                          <span className="text-gray-500">/{book.quantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button onClick={() => handleEditClick(book)} variant="outline" size="sm" className="gap-2">
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteBook(book.bookListingID)}
                              variant="outline"
                              size="sm"
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
        )}

        {/* Incoming Orders Tab */}
        {activeTab === "incoming" && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading incoming orders...</div>
            ) : incomingOrders.length === 0 ? (
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
                        <p className="text-sm text-gray-500 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">${(order.totalPrice || 0).toFixed(2)}</p>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-2 border ${getStatusColor(order.orderStatus)}`}
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

        {/* Sold Books Tab */}
        {activeTab === "sold" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading sold orders...</div>
            ) : soldOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No sold books yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Book Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {soldOrders.map((order) => (
                      <tr key={order.orderID} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono text-gray-700">#{order.orderID}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{order.bookTitle}</td>
                        <td className="px-6 py-4 text-gray-700">{order.buyerName}</td>
                        <td className="px-6 py-4 font-semibold text-indigo-600">${order.totalPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                            <CheckCircle2 className="w-4 h-4" />
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Author</label>
                      <input
                        type="text"
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingBook.price}
                        onChange={(e) => setEditingBook({ ...editingBook, price: Number.parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Condition</label>
                      <input
                        type="text"
                        value={editingBook.condition}
                        onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Available Stock</label>
                    <input
                      type="number"
                      value={editingBook.availableQuantity}
                      onChange={(e) => setEditingBook({ ...editingBook, availableQuantity: Number.parseInt(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                    <Button onClick={() => setShowEditModal(false)} variant="outline" className="px-6">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateBook}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
