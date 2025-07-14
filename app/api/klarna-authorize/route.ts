import { NextRequest, NextResponse } from "next/server";

// Helper function to remove empty objects
function cleanObject(obj: any): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "object" && !Array.isArray(value)) {
        const cleanedValue = cleanObject(value);
        if (Object.keys(cleanedValue).length > 0) {
          acc[key] = cleanedValue;
        }
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as any);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔍 Klarna API Request Body:", JSON.stringify(body, null, 2));

    const {
      currency,
      orderSummary,
      cartItems,
      shippingAddress,
      billingAddress,
      useDifferentBilling,
    } = body;

    // Validate required fields
    if (!currency || !orderSummary || !cartItems || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountInMinorUnits = Math.round(orderSummary.total * 100);
    const {
      NEXT_PUBLIC_KLARNA_CLIENT_ID: clientId,
      NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID: partnerAccountId,
      KLARNA_API_TOKEN: apiToken,
    } = process.env;

    if (!clientId || !partnerAccountId || !apiToken) {
      console.error("Missing Klarna configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const paymentTransactionReference = `payment_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    const purchaseReference = `order_${Date.now()}`;

    const lineItems = cartItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: Math.round(item.price * 100),
      total_amount: Math.round(item.price * item.quantity * 100),
    }));

    lineItems.push({
      name: "Shipping",
      quantity: 1,
      unit_price: Math.round(orderSummary.shipping * 100),
      total_amount: Math.round(orderSummary.shipping * 100),
    });

    lineItems.push({
      name: "Tax",
      quantity: 1,
      unit_price: Math.round(orderSummary.tax * 100),
      total_amount: Math.round(orderSummary.tax * 100),
    });

    const customerBilling = useDifferentBilling
      ? billingAddress
      : shippingAddress;

    const paymentRequest = {
      currency: currency.toUpperCase(),
      request_payment_transaction: {
        amount: amountInMinorUnits,
        payment_transaction_reference: paymentTransactionReference,
      },
      supplementary_purchase_data: {
        purchase_reference: purchaseReference,
        line_items: lineItems,
        customer: {
          given_name: customerBilling.firstName,
          family_name: customerBilling.lastName,
          email: customerBilling.email,
          phone: customerBilling.phone,
          address: {
            street_address: customerBilling.address,
            ...(customerBilling.address2 && {
              street_address2: customerBilling.address2,
            }),
            postal_code: customerBilling.zip,
            city: customerBilling.city,
            region: customerBilling.state,
            country: customerBilling.country,
          },
          shipping: [
            {
              recipient: {
                given_name: shippingAddress.firstName,
                family_name: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
              },
              address: {
                street_address: shippingAddress.address,
                ...(shippingAddress.address2 && {
                  street_address2: shippingAddress.address2,
                }),
                postal_code: shippingAddress.zip,
                city: shippingAddress.city,
                region: shippingAddress.state,
                country: shippingAddress.country,
              },
            },
          ],
        },
      },
      step_up_config: {
        customer_interaction_config: {
          method: "HANDOVER",
          return_url:
            "https://checkoutshopper-test.adyen.com/checkoutshopper/checkoutPaymentReturn?result=success&payment_request_id={klarna.payment_request.id}&state={klarna.payment_request.state}&payment_token={klarna.payment_request.payment_token}&payment_request_reference={klarna.payment_request.payment_request_reference}",
        },
      },
    };

    const cleanedPaymentRequest = cleanObject(paymentRequest);

    console.log(
      "🛒 Klarna Authorize Request Body:",
      JSON.stringify(cleanedPaymentRequest, null, 2)
    );

    const klarnaApiUrl = `https://api-global.test.klarna.com/v2/accounts/${partnerAccountId}/payment/authorize`;

    try {
      const klarnaResponse = await fetch(klarnaApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiToken,
        },
        body: JSON.stringify(cleanedPaymentRequest),
      });

      if (!klarnaResponse.ok) {
        const errorData = await klarnaResponse.json();
        console.log(
          "❌ Klarna API Response:",
          JSON.stringify(errorData, null, 2)
        );
        return NextResponse.json(
          { error: "Payment authorization failed", details: errorData },
          { status: klarnaResponse.status }
        );
      }

      const klarnaData = await klarnaResponse.json();
      console.log(
        "✅ Klarna API Response:",
        JSON.stringify(klarnaData, null, 2)
      );
      return NextResponse.json(klarnaData);
    } catch (apiError) {
      console.error("Error calling Klarna API:", apiError);
      return NextResponse.json(
        { error: "Failed to communicate with Klarna API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in Klarna authorize endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
