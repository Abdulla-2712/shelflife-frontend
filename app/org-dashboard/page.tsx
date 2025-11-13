"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface OrgBook {
  id: number
  isbn: string
  title: string
  author: string
  price: number
  condition: string
  edition: string
  description: string
  picture?: string
  quantity: number
  lendPrice: number
  status?: "available" | "in-progress" | "sold"
}

export default function OrgDashboardPage() {
  const [activeTab, setActiveTab] = useState<"books" | "sold">("books")
  const [books, setBooks] = useState<OrgBook[]>([
    {
      id: 1,
      isbn: "978-0-7432-7356-5",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 12.99,
      condition: "Good",
      edition: "1st Edition",
      description: "A classic American novel about wealth and love.",
      quantity: 5,
      lendPrice: 2.99,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    author: "",
    price: "",
    condition: "",
    edition: "",
    description: "",
    picture: "",
    quantity: "",
    lendPrice: "",
  })

  const [editingBook, setEditingBook] = useState<OrgBook | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<OrgBook | null>(null)

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBook.isbn && newBook.title && newBook.author && newBook.price && newBook.condition && newBook.lendPrice) {
      setBooks([
        ...books,
        {
          id: books.length + 1,
          isbn: newBook.isbn,
          title: newBook.title,
          author: newBook.author,
          price: Number.parseFloat(newBook.price),
          condition: newBook.condition,
          edition: newBook.edition,
          description: newBook.description,
          picture: newBook.picture,
          quantity: Number.parseInt(newBook.quantity) || 1,
          lendPrice: Number.parseFloat(newBook.lendPrice),
        },
      ])
      setNewBook({
        isbn: "",
        title: "",
        author: "",
        price: "",
        condition: "",
        edition: "",
        description: "",
        picture: "",
        quantity: "",
        lendPrice: "",
      })
      setShowForm(false)
    }
  }

  const handleEditClick = (book: OrgBook) => {
    setEditingBook(book)
    setEditFormData({ ...book })
    setShowEditModal(true)
  }

  const handleUpdateBook = () => {
    if (editFormData) {
      setBooks(books.map((book) => (book.id === editFormData.id ? editFormData : book)))
      setShowEditModal(false)
      setEditingBook(null)
      setEditFormData(null)
    }
  }

  const soldBooks: OrgBook[] = [
    {
      id: 101,
      isbn: "978-0-547-92807-6",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      price: 14.99,
      condition: "Excellent",
      edition: "Illustrated Edition",
      description: "A fantasy adventure classic.",
      quantity: 1,
      lendPrice: 3.99,
      status: "sold",
    },
    {
      id: 102,
      isbn: "978-1-451-67380-1",
      title: "Fahrenheit 451",
      author: "Ray Bradbury",
      price: 10.99,
      condition: "Good",
      edition: "2nd Edition",
      description: "A dystopian novel about censorship.",
      quantity: 2,
      lendPrice: 2.49,
      status: "sold",
    },
  ]

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEdit) {
          setEditFormData({ ...editFormData!, picture: reader.result as string })
        } else {
          setNewBook({ ...newBook, picture: reader.result as string })
        }
      }
      reader.readAsDataURL(file)
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
                    <option value="">Select condition</option>
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
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Enter book description"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePictureUpload(e)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {newBook.picture && (
                  <img
                    src={newBook.picture || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-4 h-40 w-32 object-cover rounded-lg border border-input"
                  />
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lend Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBook.lendPrice}
                    onChange={(e) => setNewBook({ ...newBook, lendPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Book
              </Button>
            </form>
          </div>
        )}

        {activeTab === "books" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ISBN</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Condition</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-border hover:bg-secondary transition">
                    <td className="px-6 py-4 text-sm">{book.isbn}</td>
                    <td className="px-6 py-4">{book.title}</td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{book.condition}</td>
                    <td className="px-6 py-4">{book.quantity}</td>
                    <td className="px-6 py-4">
                      <Button onClick={() => handleEditClick(book)} variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sold" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ISBN</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Condition</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Quantity Sold</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {soldBooks.map((book) => (
                  <tr key={book.id} className="border-b border-border hover:bg-secondary transition">
                    <td className="px-6 py-4 text-sm">{book.isbn}</td>
                    <td className="px-6 py-4">{book.title}</td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{book.condition}</td>
                    <td className="px-6 py-4">{book.quantity}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Sold
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showEditModal && editFormData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-6">Edit Book</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ISBN</label>
                    <input
                      type="text"
                      value={editFormData.isbn}
                      onChange={(e) => setEditFormData({ ...editFormData, isbn: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Book Title</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <input
                      type="text"
                      value={editFormData.author}
                      onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: Number.parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                      value={editFormData.condition}
                      onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                      value={editFormData.edition}
                      onChange={(e) => setEditFormData({ ...editFormData, edition: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePictureUpload(e, true)}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {editFormData.picture && (
                    <img
                      src={editFormData.picture || "/placeholder.svg"}
                      alt="Preview"
                      className="mt-4 h-40 w-32 object-cover rounded-lg border border-input"
                    />
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: Number.parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lend Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.lendPrice}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, lendPrice: Number.parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditFormData(null)
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleUpdateBook} className="flex-1 bg-primary hover:bg-primary/90">
                    Update
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
