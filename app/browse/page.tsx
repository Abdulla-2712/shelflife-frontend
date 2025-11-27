"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface Book {
  bookListingID: number
  title: string
  author: string
  ownerName: string  // Changed from userName to ownerName
  price: number
  city: string
  photoURLs?: string
}

interface ApiResponse {
  data: Book[]
  pagination: any
}

export default function BrowsePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "title" | "author" | "price" | "city">("all")

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:5279/api/Listings")
        if (!res.ok) throw new Error("Failed to fetch books")
        const data: ApiResponse = await res.json()
        setBooks(data.data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Server error")
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const filteredBooks = books.filter((book) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()

    switch (filterType) {
      case "title":
        return book.title.toLowerCase().includes(term)
      case "author":
        return book.author.toLowerCase().includes(term)
      case "price":
        return book.price.toString().includes(term)
      case "city":
        return book.city?.toLowerCase().includes(term)
      default:
        return (
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.city?.toLowerCase().includes(term)
        )
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Books</h1>

        {loading && <p>Loading books...</p>}
        {error && (
          <p className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </p>
        )}

        {/* Search & Filter */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                placeholder="Search by title, author, city..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter By</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="price">Price</option>
                <option value="city">City</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.bookListingID}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Book Cover */}
              <div className="bg-secondary h-60 flex items-center justify-center">
                {book.photoURLs ? (
                  <img
                    src={`http://localhost:5279/images/${book.photoURLs}`}
                    alt={book.title}
                    className="h-full w-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-muted-foreground">Book Cover</p>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                <p className="text-sm text-muted-foreground mb-4">Seller: {book.ownerName}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-primary">${book.price}</span>
                  <span className="text-xs text-muted-foreground">{book.city}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/checkout/${book.bookListingID}`} className="flex-1">
                    <Button className="flex-1 bg-primary">Buy</Button>
                  </Link>

                  <Link href={`/book-details/${book.bookListingID}`} className="flex-1">
                    <Button variant="outline" className="w-full">Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredBooks.length === 0 && <p>No books found.</p>}
      </div>
    </div>
  )
}