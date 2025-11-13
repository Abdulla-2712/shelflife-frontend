"use client"

import { Button } from "@/components/ui/button"

interface Book {
  id: number
  title: string
  author: string
  seller: string
  price: number
  location: string
  type: "buy" | "borrow"
}

interface PurchaseModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (book: Book) => void
}

export default function PurchaseModal({ book, isOpen, onClose, onConfirm }: PurchaseModalProps) {
  if (!isOpen || !book) return null

  const serviceFee = book.price * 0.1
  const total = book.price + serviceFee

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">{book.type === "buy" ? "Purchase Book" : "Borrow Book"}</h2>

        {/* Book Details */}
        <div className="bg-secondary rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
          <p className="text-sm text-muted-foreground mb-4">Seller: {book.seller}</p>
          <p className="text-sm text-muted-foreground">{book.location}</p>
        </div>

        {/* Pricing */}
        <div className="space-y-2 mb-6 pb-6 border-b border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Book Price:</span>
            <span className="font-medium">${book.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee (10%):</span>
            <span className="font-medium">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {book.type === "buy"
            ? "You will receive this book within 3-5 business days."
            : "You can borrow this book for 14 days."}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={() => onConfirm(book)} className="flex-1 bg-primary hover:bg-primary/90">
            {book.type === "buy" ? "Confirm Purchase" : "Confirm Borrow"}
          </Button>
        </div>
      </div>
    </div>
  )
}
