"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentRequestId: string | null
    sessionId: string | null
    status: string | null
  }>({
    paymentRequestId: null,
    sessionId: null,
    status: null,
  })

  useEffect(() => {
    // Extract payment details from URL parameters
    const paymentRequestId = searchParams.get("payment_request_id")
    const sessionId = searchParams.get("session_id")
    const status = searchParams.get("status")

    setPaymentDetails({
      paymentRequestId,
      sessionId,
      status,
    })

    // Log the payment completion for debugging
    console.log("Payment completed:", {
      paymentRequestId,
      sessionId,
      status,
    })
  }, [searchParams])

  const getStatusColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "text-green-600"
      case "DECLINED":
        return "text-red-600"
      case "PENDING":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusMessage = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "Your payment has been successfully processed!"
      case "DECLINED":
        return "Your payment was declined. Please try again."
      case "PENDING":
        return "Your payment is being processed. You will receive a confirmation shortly."
      default:
        return "Payment status unknown. Please contact support if you have concerns."
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {paymentDetails.status?.toUpperCase() === "APPROVED"
              ? "✅ Payment Confirmed"
              : "⚠️ Payment Update"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className={`text-lg font-medium ${getStatusColor(paymentDetails.status)}`}>
              {getStatusMessage(paymentDetails.status)}
            </p>
          </div>

          {paymentDetails.paymentRequestId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Payment Request ID:</span>{" "}
                  {paymentDetails.paymentRequestId}
                </p>
                {paymentDetails.sessionId && (
                  <p>
                    <span className="font-medium">Session ID:</span> {paymentDetails.sessionId}
                  </p>
                )}
                <p>
                  <span className="font-medium">Status:</span> {paymentDetails.status}
                </p>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {paymentDetails.status?.toUpperCase() === "APPROVED"
                ? "Thank you for your purchase! You will receive a confirmation email shortly."
                : "If you have any questions about your payment, please contact our support team."}
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
              {paymentDetails.status?.toUpperCase() === "DECLINED" && (
                <Link href="/">
                  <Button>Try Again</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
