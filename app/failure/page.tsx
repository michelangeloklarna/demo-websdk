"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function FailureContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentRequestId: string | null
    sessionId: string | null
    status: string | null
    error: string | null
  }>({
    paymentRequestId: null,
    sessionId: null,
    status: null,
    error: null,
  })

  useEffect(() => {
    // Extract payment details from URL parameters
    const paymentRequestId = searchParams.get("payment_request_id")
    const sessionId = searchParams.get("session_id")
    const status = searchParams.get("status")
    const error = searchParams.get("error")

    setPaymentDetails({
      paymentRequestId,
      sessionId,
      status,
      error,
    })

    // Log the payment failure for debugging
    console.log("Payment failed:", {
      paymentRequestId,
      sessionId,
      status,
      error,
    })
  }, [searchParams])

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">❌ Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">
              We were unable to process your payment.
            </p>
            <p className="text-gray-600 mt-2">
              {paymentDetails.error ||
                "Please try again or contact support if the problem persists."}
            </p>
          </div>

          {paymentDetails.paymentRequestId && (
            <div className="bg-red-50 p-4 rounded-lg">
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
                {paymentDetails.error && (
                  <p>
                    <span className="font-medium">Error:</span> {paymentDetails.error}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">Common reasons for payment failure:</p>
            <ul className="text-sm text-gray-600 text-left max-w-md mx-auto">
              <li>• Insufficient funds</li>
              <li>• Card declined by bank</li>
              <li>• Network connection issues</li>
              <li>• Expired payment session</li>
            </ul>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button>Try Again</Button>
              </Link>
              <Link href="/support">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailureContent />
    </Suspense>
  )
}
