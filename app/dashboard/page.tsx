"use client"

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
  totalPrice: number
  orderStatus: string
  orderDate: string
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"my-books" | "sell" | "orders">("my-books")
  const [myBooks, setMyBooks] = useState<UserBook[]>([])
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([])
  const [outgoingOrders, setOutgoingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingBook, setEditingBook] = useState<UserBook | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
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
    if (activeTab === "my-books") fetchMyBooks()
    if (activeTab === "orders") fetchOrders()
  }, [activeTab, userId])

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

  const fetchOrders = async () => {
    if (!userId) return
    setLoading(true)
    setError("")
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch(`http://localhost:5279/api/User/${userId}/orders/incoming`),
        fetch(`http://localhost:5279/api/User/${userId}/orders/outgoing`)
      ])
      
      if (!incomingRes.ok || !outgoingRes.ok) throw new Error("Failed to fetch orders")
      
      const incoming = await incomingRes.json()
      const outgoing = await outgoingRes.json()
      
      setIncomingOrders(incoming)
      setOutgoingOrders(outgoing)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Server error")
    } finally {
      setLoading(false)
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
        availabilityStatus: editingBook.availabilityStatus || "Available"
      }

      console.log("Updating book with data:", updateDto)

      const res = await fetch(
        `http://localhost:5279/api/User/${userId}/listings/${editingBook.bookListingID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateDto)
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
        price: parseFloat(sellFormData.price),
        condition: sellFormData.condition,
        edition: sellFormData.edition,
        description: sellFormData.description,
        photoURLs: sellFormData.photoURLs,
        city: sellFormData.city,
        categoryID: sellFormData.categoryID,
        isSellable: sellFormData.isSellable,
        isSwappable: sellFormData.isSwappable,
        quantity: 1
      }

      const res = await fetch(`http://localhost:5279/api/User/${userId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDto)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to create listing")
      }

      // Reset form
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {["my-books", "sell", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "my-books" ? "My Books" : tab === "sell" ? "Sell a Book" : "My Orders"}
            </button>
          ))}
        </div>

        {/* My Books */}
        {activeTab === "my-books" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">My Books</h2>
              <p className="text-muted-foreground mt-1">Books you have uploaded</p>
            </div>
            {loading ? (
              <div className="p-8 text-center">Loading books...</div>
            ) : myBooks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No books uploaded yet. Start by selling a book!
              </div>
            ) : (
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
                      <td className="px-6 py-4">{book.title}</td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">{book.isbn}</td>
                      <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{book.availabilityStatus}</td>
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
            )}
          </div>
        )}

        {/* Sell Tab */}
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
                {loading ? "Creating..." : "List Book"}
              </Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Incoming Orders (As Seller)</h3>
                {incomingOrders.length === 0 ? (
                  <p className="text-muted-foreground mb-8">No incoming orders yet.</p>
                ) : (
                  <div className="space-y-4 mb-8">
                    {incomingOrders.map((order) => (
                      <div key={order.orderID} className="border border-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{order.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">Buyer: {order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">${order.totalPrice.toFixed(2)}</span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-4">Outgoing Orders (As Buyer)</h3>
                {outgoingOrders.length === 0 ? (
                  <p className="text-muted-foreground">No outgoing orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {outgoingOrders.map((order) => (
                      <div key={order.orderID} className="border border-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{order.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">Seller: {order.sellerName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">${order.totalPrice.toFixed(2)}</span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author *</label>
                  <input
                    type="text"
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ISBN *</label>
                  <input
                    type="text"
                    value={editingBook.isbn}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Edition</label>
                  <input
                    type="text"
                    value={editingBook.edition || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, edition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price {editingBook.isSellable && "*"}</label>
                  <input
                    type="number"
                    value={editingBook.price || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                    step="0.01"
                    disabled={!editingBook.isSellable}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition *</label>
                  <select
                    value={editingBook.condition}
                    onChange={(e) => setEditingBook({ ...editingBook, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  >
                    <option value="good">Good</option>
                    <option value="like-new">Like New</option>
                    <option value="acceptable">Acceptable</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={editingBook.city || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, city: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editingBook.availabilityStatus}
                    onChange={(e) => setEditingBook({ ...editingBook, availabilityStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingBook.isSellable}
                    onChange={(e) => setEditingBook({ ...editingBook, isSellable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Sellable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingBook.isSwappable}
                    onChange={(e) => setEditingBook({ ...editingBook, isSwappable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Swappable</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingBook.description || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  rows={4}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingBook(null); setError(""); }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBook} disabled={loading}>
                  {loading ? "Updating..." : "Update Book"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}