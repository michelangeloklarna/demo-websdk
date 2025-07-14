/**
 * Klarna utility functions for WebSDK integration
 */

/**
 * Processes a return URL by replacing placeholders with actual values from the payment request
 * @param returnUrl - The return URL template with placeholders
 * @param paymentRequest - The payment request object containing values to substitute
 * @returns The processed URL with placeholders replaced
 */
export function processReturnUrl(returnUrl: string, paymentRequest: any): string {
  if (!returnUrl || !paymentRequest) {
    return returnUrl
  }

  let processedUrl = returnUrl

  // Replace common placeholders that might be in the return URL
  const replacements: Record<string, string> = {
    "{{payment_request_id}}": paymentRequest.payment_request_id || "",
    "{{session_id}}": paymentRequest.session_id || "",
    "{{order_id}}": paymentRequest.order_id || "",
    "{{payment_status}}": paymentRequest.payment_status || "",
    "{{payment_method}}": paymentRequest.payment_method || "",
    "{{amount}}": paymentRequest.amount?.toString() || "",
    "{{currency}}": paymentRequest.currency || "",
    "{payment_request_id}": paymentRequest.payment_request_id || "",
    "{session_id}": paymentRequest.session_id || "",
    "{order_id}": paymentRequest.order_id || "",
    "{payment_status}": paymentRequest.payment_status || "",
    "{payment_method}": paymentRequest.payment_method || "",
    "{amount}": paymentRequest.amount?.toString() || "",
    "{currency}": paymentRequest.currency || "",
  }

  // Replace all placeholders
  Object.entries(replacements).forEach(([placeholder, value]) => {
    processedUrl = processedUrl.replace(new RegExp(placeholder, "g"), value)
  })

  return processedUrl
}

/**
 * Logger utility for Klarna operations
 */
export const klarnaLogger = {
  log: (message: string, data?: any) => {
    console.log(`[Klarna] ${message}`, data || "")
  },
  error: (message: string, error?: any) => {
    console.error(`[Klarna Error] ${message}`, error || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[Klarna Warning] ${message}`, data || "")
  },
}
