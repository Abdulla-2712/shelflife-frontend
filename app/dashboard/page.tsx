"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface UserBook {
  id: number
  title: string
  author: string
  isbn: string
  price: number
  condition: "Sellable" | "donatable"
  edition: string
  description: string
  status: "available" | "in-progress" | "sold"
  picture?: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"my-books" | "sell" | "orders">("my-books")
  const [myBooks, setMyBooks] = useState<UserBook[]>([])
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
    picture: "",
  })

  const handleEditBook = (book: UserBook) => {
    setEditingBook(book)
    setShowEditModal(true)
  }

  const handleUpdateBook = () => {
    if (editingBook) {
      setMyBooks(myBooks.map((book) => (book.id === editingBook.id ? editingBook : book)))
      setShowEditModal(false)
      setEditingBook(null)
    }
  }

  const handleAddBook = () => {
    if (sellFormData.title && sellFormData.author && sellFormData.isbn) {
      const newBook: UserBook = {
        id: Date.now(),
        title: sellFormData.title,
        author: sellFormData.author,
        isbn: sellFormData.isbn,
        price: Number.parseFloat(sellFormData.price) || 0,
        condition: sellFormData.condition as "like-new" | "good" | "fair" | "poor",
        edition: sellFormData.edition,
        description: sellFormData.description,
        status: "available",
        picture: sellFormData.picture,
      }
      setMyBooks([...myBooks, newBook])
      setSellFormData({
        isbn: "",
        title: "",
        author: "",
        price: "",
        condition: "good",
        edition: "",
        description: "",
        picture: "",
      })
      setActiveTab("my-books")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("my-books")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "my-books"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Books
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "sell"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Sell a Book
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "orders"
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
              <p className="text-muted-foreground mt-1">Books you have uploaded</p>
            </div>
            {myBooks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No books uploaded yet. Start by selling a book!</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
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
                    <tr key={book.id} className="border-b border-border hover:bg-secondary transition">
                      <td className="px-6 py-4">{book.title}</td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">{book.isbn}</td>
                      <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            book.status === "available"
                              ? "bg-green-100 text-green-800"
                              : book.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditBook(book)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showEditModal && editingBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Book</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ISBN</label>
                    <input
                      type="text"
                      value={editingBook.isbn}
                      onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ISBN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Book Title</label>
                    <input
                      type="text"
                      value={editingBook.title}
                      onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Book Title"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <input
                      type="text"
                      value={editingBook.author}
                      onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Author Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Edition</label>
                    <input
                      type="text"
                      value={editingBook.edition}
                      onChange={(e) => setEditingBook({ ...editingBook, edition: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 2nd Edition"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="number"
                      value={editingBook.price}
                      onChange={(e) =>
                        setEditingBook({ ...editingBook, price: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                      value={editingBook.condition}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          condition: e.target.value as "like-new" | "good" | "fair" | "poor",
                        })
                      }
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingBook.description}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe the book condition, notes, etc."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingBook(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdateBook}>
                    Update Book
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Sell a Book</h2>
            <div className="bg-secondary p-4 rounded-lg mb-6 border border-border">
              <p className="text-sm font-medium">⚠️ Note: A 10% service fee will be added to your listed price.</p>
            </div>
            <form
              className="space-y-4 max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault()
                handleAddBook()
              }}
            >
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
                    <option value="like-new">Donatable</option>
                    <option value="good">Sellable</option>
                  </select>
                </div>
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
                <label className="block text-sm font-medium mb-2">Book Picture</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setSellFormData({
                          ...sellFormData,
                          picture: reader.result as string,
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  accept="image/*"
                />
                {sellFormData.picture && (
                  <div className="mt-4">
                    <img
                      src={sellFormData.picture || "/placeholder.svg"}
                      alt="Preview"
                      className="h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <Button type="submit" className="bg-primary hover:bg-primary/90 w-full md:w-auto">
                List Book
              </Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            <div className="space-y-4">
              {[
                { id: 1, book: "The Great Gatsby", status: "Getting from seller", date: "2024-10-15" },
                { id: 2, book: "To Kill a Mockingbird", status: "In delivery", date: "2024-10-10" },
                { id: 3, book: "1984", status: "Delivered", date: "2024-10-05" },
              ].map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{order.book}</h3>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "In delivery"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.status === "Delivered" && (
                      <Button variant="outline" size="sm">
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
