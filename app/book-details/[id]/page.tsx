"use client"

import { useParams } from "next/navigation"
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
  description: string
  isbn: string
  pages: number
  publishedYear: number
}

export default function BookDetailsPage() {
  const params = useParams()
  const bookId = params.id

  // Mock book data - in a real app, fetch based on bookId
  const book: Book = {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    seller: "John Doe",
    price: 12.99,
    location: "New York, NY",
    type: "buy",
    description: "A classic novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    isbn: "978-0743273565",
    pages: 180,
    publishedYear: 1925,
  }

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
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-muted-foreground">Book Cover</p>
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">By {book.author}</p>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">Seller: {book.seller}</p>
              <p className="text-sm text-muted-foreground">Location: {book.location}</p>
            </div>

            <div className="space-y-2 pb-6 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base leading-relaxed">{book.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">ISBN</p>
                <p className="font-semibold">{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pages</p>
                <p className="font-semibold">{book.pages}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Published</p>
                <p className="font-semibold">{book.publishedYear}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                <p className="font-semibold">{book.type === "buy" ? "For Sale" : "For Lending"}</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-3xl font-bold text-primary">${(book.price * 1.1).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">Includes 10% service fee</p>
              </div>

              <Link href={`/checkout/${book.id}`}>
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
