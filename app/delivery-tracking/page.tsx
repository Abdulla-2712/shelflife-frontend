"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function DeliveryTrackingPage() {
  const [deliveryStatus, setDeliveryStatus] = useState<"getting" | "in-delivery" | "delivered">("getting")

  const stages = [
    { id: "getting", label: "Getting from seller", description: "Seller is preparing your book" },
    { id: "in-delivery", label: "In delivery", description: "Your book is on its way" },
    { id: "delivered", label: "Delivered", description: "Book has arrived" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Delivery Tracking</h1>

        <div className="bg-card border border-border rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Order: The Great Gatsby</h2>
            <p className="text-muted-foreground mb-6">Order ID: #12345 | Placed: Oct 15, 2024</p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      deliveryStatus === stage.id ||
                      (
                        (deliveryStatus === "in-delivery" && stage.id === "getting") ||
                          (deliveryStatus === "delivered" && stage.id !== "delivered")
                      )
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={`w-1 h-12 mt-2 ${
                        deliveryStatus === stage.id ||
                        (
                          (deliveryStatus === "in-delivery" && stage.id === "getting") ||
                            (deliveryStatus === "delivered" && stage.id !== "delivered")
                        )
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status Controls */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Current Status:{" "}
              <span className="font-semibold text-foreground">
                {stages.find((s) => s.id === deliveryStatus)?.label}
              </span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={deliveryStatus === stage.id ? "default" : "outline"}
                  onClick={() => setDeliveryStatus(stage.id as any)}
                  className={deliveryStatus === stage.id ? "bg-primary hover:bg-primary/90" : ""}
                >
                  {stage.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Confirm Delivery */}
          {deliveryStatus === "delivered" && (
            <div className="mt-8 p-4 bg-secondary rounded-lg border border-border">
              <p className="font-medium mb-4">Book has been delivered. Please confirm receipt:</p>
              <Button className="bg-primary hover:bg-primary/90">Confirm Delivery</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
