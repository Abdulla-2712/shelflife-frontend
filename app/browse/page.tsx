"use client"

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

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "title" | "author" | "price" | "location">("all")
  const [successMessage, setSuccessMessage] = useState("")

  const books: Book[] = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      seller: "John Doe",
      price: 12.99,
      location: "New York, NY",
      type: "buy",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      seller: "Jane Smith",
      price: 14.99,
      location: "Los Angeles, CA",
      type: "borrow",
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      seller: "City Library",
      price: 10.99,
      location: "Chicago, IL",
      type: "buy",
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      seller: "Book Club",
      price: 9.99,
      location: "Boston, MA",
      type: "borrow",
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      seller: "Mike Johnson",
      price: 11.99,
      location: "Seattle, WA",
      type: "buy",
    },
    {
      id: 6,
      title: "Brave New World",
      author: "Aldous Huxley",
      seller: "Community Center",
      price: 13.99,
      location: "Denver, CO",
      type: "borrow",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Books</h1>

        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search by title, author..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter By</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="price">Price</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="bg-secondary h-40 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-sm text-muted-foreground">Book Cover</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                <p className="text-sm text-muted-foreground mb-4">Seller: {book.seller}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-primary">${(book.price * 1.1).toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">{book.location}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/checkout/${book.id}`} className="flex-1">
                    <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm">
                      {book.type === "buy" ? "Buy" : "Borrow"}
                    </Button>
                  </Link>
                  <Link href={`/book-details/${book.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
