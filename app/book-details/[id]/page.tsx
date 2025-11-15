"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

interface Book {
  bookListingID: number
  title: string
  author?: string
  userName?: string
  price?: number
  city?: string
  description?: string
  isbn?: string
  edition?: string
  pages?: number
  publishedYear?: number
  type: "buy" | "borrow"
  photoURLs?: string
}

export default function BookDetailsPage() {
  const params = useParams()
  const bookId = params.id

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5279/api/Listings/${bookId}`)
        if (!res.ok) throw new Error("Failed to fetch book details")
        const data = await res.json()

        setBook({
          bookListingID: data.bookListingID,
          title: data.title,
          author: data.ownerName,
          userName: data.ownerName,
          price: data.price,
          city: data.city,
          description: data.description,
          isbn: data.isbn,
          edition: data.edition,
          pages: data.pages,
          publishedYear: data.publishedYear,
          type: data.isSellable ? "buy" : "borrow",
          photoURLs: data.photoURLs // ← make sure to set it
        })
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Server error")
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [bookId])

  if (loading) return <p className="p-8 text-center">Loading book details...</p>
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>
  if (!book) return <p className="p-8 text-center">Book not found.</p>

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/browse">
          <Button variant="outline" className="mb-6 bg-transparent">
            Back to Browse
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Cover */}
          <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
            {book.photoURLs ? (
              <img
                src={`http://localhost:5279/images/${book.photoURLs}`}
                alt={book.title}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-muted-foreground">Book Cover</p>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">By {book.author}</p>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">Seller: {book.userName}</p>
              <p className="text-sm text-muted-foreground">Location: {book.city}</p>
            </div>

            {book.description && (
              <div className="space-y-2 pb-6 border-b border-border">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border">
              {book.isbn && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">ISBN</p>
                  <p className="font-semibold">{book.isbn}</p>
                </div>
              )}
              {book.edition && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Edition</p>
                  <p className="font-semibold">{book.edition}</p>
                </div>
              )}
              {book.pages && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pages</p>
                  <p className="font-semibold">{book.pages}</p>
                </div>
              )}
              {book.publishedYear && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Published</p>
                  <p className="font-semibold">{book.publishedYear}</p>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-3xl font-bold text-primary">${book.price?.toFixed(2)}</p>
              </div>

              <Link href={`/checkout/${book.bookListingID}`}>
                <Button className="w-full bg-primary hover:bg-primary/90 py-6 text-lg">
                  {book.type === "buy" ? "Buy Now" : "Borrow Now"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
