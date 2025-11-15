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
  totalPrice: number
  orderStatus: string
  orderDate: string
}

export default function OrgDashboardPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"books" | "sold">("books")
  const [books, setBooks] = useState<OrgBook[]>([])
  const [soldOrders, setSoldOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

  // Decode JWT token to get user ID
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    console.log("Token found:", token ? "Yes" : "No")
    
    if (!token) {
      setError("No authentication token found. Please login.")
      return
    }

    try {
      // Decode JWT token (format: header.payload.signature)
      const payload = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      console.log("Decoded JWT payload:", decodedPayload)
      
      // Extract user ID from token (adjust the key based on your JWT structure)
      // Common keys: sub, userId, id, nameid
      const uid = decodedPayload.sub || decodedPayload.userId || decodedPayload.id || decodedPayload.nameid
      console.log("Extracted user ID:", uid)
      
      if (uid) {
        setUserId(parseInt(uid))
      } else {
        console.error("Available keys in token:", Object.keys(decodedPayload))
        setError("User ID not found in token. Check console for available keys.")
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

  const fetchSoldOrders = async () => {
    if (!userId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:5279/api/User/${userId}/orders/incoming`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      // Filter for completed/sold orders
      setSoldOrders(data.filter((order: Order) => 
        order.orderStatus === "Completed" || order.orderStatus === "Delivered"
      ))
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
        price: parseFloat(newBook.price),
        condition: newBook.condition,
        edition: newBook.edition,
        description: newBook.description,
        photoURLs: newBook.photoURLs,
        city: newBook.city,
        categoryID: newBook.categoryID,
        isSellable: true,
        isSwappable: false,
        quantity: parseInt(newBook.quantity) || 1,
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

      const res = await fetch(
        `http://localhost:5279/api/User/${userId}/listings/${editingBook.bookListingID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateDto),
        }
      )

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
      const res = await fetch(
        `http://localhost:5279/api/User/${userId}/listings/${bookId}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error("Failed to delete book")

      await fetchMyBooks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to delete book")
    } finally {
      setLoading(false)
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
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
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
                <label className="block text-sm font-medium mb-2">Quantity <span className="text-red-500">*</span></label>
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
                        <div className="flex gap-2" >
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

        {activeTab === "sold" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading sold orders...</div>
            ) : soldOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No sold books yet.
              </div>
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

        {showEditModal && editingBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Edit Book</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ISBN *</label>
                    <input
                      type="text"
                      value={editingBook.isbn}
                      onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Book Title *</label>
                    <input
                      type="text"
                      value={editingBook.title}
                      onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Author *</label>
                    <input
                      type="text"
                      value={editingBook.author}
                      onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingBook.price}
                      onChange={(e) => setEditingBook({ ...editingBook, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition *</label>
                    <select
                      value={editingBook.condition}
                      onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
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
                      value={editingBook.edition || ""}
                      onChange={(e) => setEditingBook({ ...editingBook, edition: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={editingBook.city || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, city: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingBook.description || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Photo URL</label>
                  <input
                    type="text"
                    value={editingBook.photoURLs || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, photoURLs: e.target.value })}
                    placeholder="Enter photo filename"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={editingBook.quantity}
                      onChange={(e) => setEditingBook({ ...editingBook, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={editingBook.availabilityStatus}
                      onChange={(e) => setEditingBook({ ...editingBook, availabilityStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingBook(null)
                      setError("")
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpdateBook}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}