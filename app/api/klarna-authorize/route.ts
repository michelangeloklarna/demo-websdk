import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { currency, locale, orderSummary, cartItems, shippingAddress, billingAddress } =
      await request.json()

    // Validate required fields
    if (!currency || !orderSummary || !cartItems || !shippingAddress) {
      return NextResponse.json(
        {
          error: "Missing required fields: currency, orderSummary, cartItems, and shippingAddress",
        },
        { status: 400 }
      )
    }

    // Log the locale for debugging
    console.log("Payment request with locale:", locale)

    // Convert amount to minor units (cents) - use frontend calculated total
    const amountInMinorUnits = Math.round(orderSummary.total * 100)

    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID
    const partnerAccountId = process.env.NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID
    const apiToken = process.env.KLARNA_API_TOKEN

    if (!clientId || !partnerAccountId || !apiToken) {
      console.error("Missing Klarna configuration")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Generate unique payment transaction reference
    const paymentTransactionReference = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const purchaseReference = `order_${Date.now()}`

    // Convert cart items to Klarna line items format
    const lineItems = cartItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: Math.round(item.price * 100), // Convert to minor units
      total_amount: Math.round(item.price * item.quantity * 100), // Convert to minor units
    }))

    // Add shipping and tax as line items using frontend calculated values
    lineItems.push({
      name: "Shipping",
      quantity: 1,
      unit_price: Math.round(orderSummary.shipping * 100), // Use frontend shipping amount
      total_amount: Math.round(orderSummary.shipping * 100),
    })

    lineItems.push({
      name: "Tax",
      quantity: 1,
      unit_price: Math.round(orderSummary.tax * 100), // Use frontend tax amount
      total_amount: Math.round(orderSummary.tax * 100),
    })

    // Prepare the payment request for Klarna API
    const paymentRequest = {
      currency: currency.toUpperCase(),
      request_payment_transaction: {
        amount: amountInMinorUnits,
        payment_transaction_reference: paymentTransactionReference,
      },
      supplementary_purchase_data: {
        purchase_reference: purchaseReference,
        line_items: lineItems,
        shipping: [
          {
            recipient: {
              given_name: shippingAddress.firstName || "Customer",
              family_name: shippingAddress.lastName || "Name",
              email: shippingAddress.email || "customer@example.com",
              phone: shippingAddress.phone || "555-123-4567",
            },
            address: {
              street_address: shippingAddress.address || "",
              ...(shippingAddress.address2 &&
                shippingAddress.address2.trim() !== "" && {
                  street_address2: shippingAddress.address2,
                }),
              postal_code: shippingAddress.zip || "",
              city: shippingAddress.city || "",
              region: shippingAddress.state || "",
              country: "US",
            },
          },
        ],
        billing_address: {
          given_name: billingAddress.firstName || "Customer",
          family_name: billingAddress.lastName || "Name",
          email: billingAddress.email || "customer@example.com",
          phone: billingAddress.phone || "555-123-4567",
          street_address: billingAddress.address || "",
          ...(billingAddress.address2 &&
            billingAddress.address2.trim() !== "" && { street_address2: billingAddress.address2 }),
          postal_code: billingAddress.zip || "",
          city: billingAddress.city || "",
          region: billingAddress.state || "",
          country: "US",
        },
      },
      step_up_config: {
        customer_interaction_config: {
          method: "HANDOVER",
          return_url:
            "https://checkoutshopper-test.adyen.com/checkoutshopper/checkoutPaymentReturn?result=success&payment_request_id={klarna.payment_request.id}&state={klarna.payment_request.state}&payment_token={klarna.payment_request.payment_token}&payment_request_reference={klarna.payment_request.payment_request_reference}",
        },
      },
    }

    console.log("Klarna payment request:", JSON.stringify(paymentRequest, null, 2))

    // Call actual Klarna API
    const klarnaApiUrl = `https://api-global.test.klarna.com/v2/accounts/${partnerAccountId}/payment/authorize`

    try {
      const klarnaResponse = await fetch(klarnaApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiToken,
        },
        body: JSON.stringify(paymentRequest),
      })

      if (!klarnaResponse.ok) {
        const errorData = await klarnaResponse.json()
        console.error("Klarna API error:", errorData)
        return NextResponse.json(
          { error: "Payment authorization failed", details: errorData },
          { status: klarnaResponse.status }
        )
      }

      const klarnaData = await klarnaResponse.json()
      console.log("Klarna API response:", JSON.stringify(klarnaData, null, 2))
      return NextResponse.json(klarnaData)
    } catch (apiError) {
      console.error("Error calling Klarna API:", apiError)
      return NextResponse.json({ error: "Failed to communicate with Klarna API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in Klarna authorize endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
