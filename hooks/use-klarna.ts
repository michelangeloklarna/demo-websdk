"use client"

import { useState, useEffect } from "react"
import type { KlarnaSDK } from "@/types"

interface UseKlarnaOptions {
  amount: number
  currency?: string
  locale?: string
  loadOnMount?: boolean
  onLog?: (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    data?: any
  ) => void
}

interface UseKlarnaReturn {
  klarnaSDK: KlarnaSDK | null
  klarnaPresentation: any
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export function useKlarna({
  amount,
  currency = "USD",
  locale = "en-US",
  loadOnMount = true,
  onLog,
}: UseKlarnaOptions): UseKlarnaReturn {
  const [klarnaSDK, setKlarnaSDK] = useState<KlarnaSDK | null>(null)
  const [klarnaPresentation, setKlarnaPresentation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const log = (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    data?: any
  ) => {
    if (onLog) {
      onLog(type, title, message, data)
    }
    // Fallback to console if no logger provided
    const consoleMethod = type === "error" ? "error" : type === "warning" ? "warn" : "log"
    console[consoleMethod](`[Klarna SDK] ${title}: ${message}`, data || "")
  }

  const loadKlarnaSDK = async () => {
    try {
      setIsLoading(true)
      setError(null)

      log("info", "SDK Loading Started", "Beginning Klarna WebSDK initialization process")

      // Use dynamic import with eval to avoid webpack processing
      log("info", "Dynamic Import", "Loading Klarna WebSDK from CDN", {
        url: "https://js.klarna.com/web-sdk/v2/klarna.mjs",
        method: "Dynamic Import",
      })

      // Add timeout and retry logic for better performance
      const importKlarna = new Function(
        'return import("https://js.klarna.com/web-sdk/v2/klarna.mjs")'
      )
      const module = await Promise.race([
        importKlarna(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Klarna SDK load timeout")), 10000)
        ),
      ])

      log("info", "Module Imported", "Raw module imported successfully", {
        moduleKeys: Object.keys(module || {}),
        hasKlarnaSDK: !!module?.KlarnaSDK,
        hasDefault: !!module?.default,
        moduleType: typeof module,
      })

      // Try different export patterns
      const KlarnaSDK = module?.KlarnaSDK || module?.default || module

      if (!KlarnaSDK || typeof KlarnaSDK !== "function") {
        throw new Error(
          `KlarnaSDK not found or invalid. Available exports: ${Object.keys(module || {}).join(", ")}`
        )
      }

      log("success", "SDK Module Loaded", "Klarna WebSDK module successfully imported", {
        moduleType: typeof KlarnaSDK,
        hasKlarnaSDK: !!KlarnaSDK,
      })

      // Initialize SDK with optimized configuration
      const config = {
        clientId: process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID || "klarna_test_client_***",
        products: ["PAYMENT"],
        partnerAccountId:
          process.env.NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID || "krn:partner:global:account:***",
        locale,
        // Add environment configuration to help with SDK loading
        environment: process.env.NODE_ENV === "production" ? "production" : "playground",
        // Add region configuration
        region: "na", // North America
        // Add performance optimizations
        lazy: true, // Enable lazy loading
        preload: true, // Preload resources
      }

      log("info", "SDK Initialization", "Initializing Klarna SDK with configuration", config)

      const klarna = await KlarnaSDK(config)

      log("success", "SDK Initialized", "Klarna SDK instance created successfully", {
        sdkType: typeof klarna,
        sdkKeys: Object.keys(klarna || {}),
        hasPaymentMethod: !!klarna?.Payment,
        availableMethods: klarna
          ? Object.keys(klarna).filter(key => typeof klarna[key] === "object")
          : [],
      })

      // Check if SDK has the expected structure
      if (!klarna || typeof klarna !== "object") {
        throw new Error(`Invalid SDK structure: expected object, got ${typeof klarna}`)
      }

      // Get Payment Presentation element - amount must be in cents
      const presentationConfig = {
        amount: Math.round(amount * 100), // Convert to minor units (cents)
        currency: currency,
        locale,
      }

      log(
        "info",
        "Payment Presentation",
        "Requesting payment presentation data with Klarna Network Distribution format",
        presentationConfig
      )

      let presentation: any
      if (klarna.Payment && typeof klarna.Payment.presentation === "function") {
        try {
          presentation = await klarna.Payment.presentation(presentationConfig)

          // Detailed console logging for presentation results
          console.group("🎨 Klarna Payment Presentation Results")
          console.log("📋 Full Presentation Object:", presentation)
          console.log("📋 Presentation Type:", typeof presentation)
          console.log("📋 Presentation Keys:", Object.keys(presentation || {}))

          if (presentation) {
            console.log("🎯 Instruction:", presentation.instruction)

            // Log icon details
            if (presentation.icon) {
              console.log("🖼️ Icon Object:", presentation.icon)
              console.log("🖼️ Icon Type:", typeof presentation.icon)
              console.log("🖼️ Icon Keys:", Object.keys(presentation.icon))
              console.log(
                "🖼️ Has Icon Component:",
                typeof presentation.icon.component === "function"
              )
            }

            // Log header details
            if (presentation.header) {
              console.log("📰 Header Object:", presentation.header)
              console.log("📰 Header Type:", typeof presentation.header)
              console.log("📰 Header Keys:", Object.keys(presentation.header))
              console.log(
                "📰 Has Header Component:",
                typeof presentation.header.component === "function"
              )
            }

            // Log subheader details
            if (presentation.subheader) {
              console.log("📝 Subheader Object:", presentation.subheader)
              console.log("📝 Subheader Type:", typeof presentation.subheader)
              console.log("📝 Subheader Keys:", Object.keys(presentation.subheader))

              if (presentation.subheader.short) {
                console.log("📝 Short Subheader:", presentation.subheader.short)
                console.log(
                  "📝 Has Short Component:",
                  typeof presentation.subheader.short.component === "function"
                )
              }

              if (presentation.subheader.enriched) {
                console.log("📝 Enriched Subheader:", presentation.subheader.enriched)
                console.log("📝 Enriched Type:", typeof presentation.subheader.enriched)
                console.log("📝 Enriched Keys:", Object.keys(presentation.subheader.enriched))
                console.log(
                  "📝 Has Enriched Component:",
                  typeof presentation.subheader.enriched.component === "function"
                )

                // Try to create enriched component to see what we get
                if (typeof presentation.subheader.enriched.component === "function") {
                  try {
                    const enrichedInstance = presentation.subheader.enriched.component()
                    console.log("🔍 Enriched Instance Created:", enrichedInstance)
                    console.log("🔍 Enriched Instance Type:", typeof enrichedInstance)
                    console.log("🔍 Enriched Instance Keys:", Object.keys(enrichedInstance || {}))
                    console.log("🔍 Has Mount Method:", !!enrichedInstance?.mount)
                    console.log("🔍 Has htmlElement:", !!enrichedInstance?.htmlElement)
                    if (enrichedInstance?.htmlElement) {
                      console.log("🔍 htmlElement Type:", typeof enrichedInstance.htmlElement)
                      console.log("🔍 htmlElement Tag:", enrichedInstance.htmlElement.tagName)
                      console.log("🔍 htmlElement Content:", enrichedInstance.htmlElement.outerHTML)
                    }
                  } catch (error) {
                    console.log("❌ Error creating enriched instance:", error)
                  }
                }
              } else {
                console.log("❌ No enriched subheader in presentation.subheader")
              }
            }

            // Log payment button details
            if (presentation.paymentButton) {
              console.log("🔘 Payment Button Object:", presentation.paymentButton)
              console.log("🔘 Payment Button Type:", typeof presentation.paymentButton)
              console.log("🔘 Payment Button Keys:", Object.keys(presentation.paymentButton))
              console.log(
                "🔘 Has Payment Button Component:",
                typeof presentation.paymentButton.component === "function"
              )
            }

            // Log any additional properties
            const knownKeys = ["instruction", "icon", "header", "subheader", "paymentButton"]
            const additionalKeys = Object.keys(presentation).filter(key => !knownKeys.includes(key))
            if (additionalKeys.length > 0) {
              console.log("🔍 Additional Properties:", additionalKeys)
              additionalKeys.forEach(key => {
                console.log(`🔍 ${key}:`, presentation[key])
              })
            }
          }
          console.groupEnd()

          // Validate the response structure according to guidelines
          const isValidPresentation =
            presentation &&
            typeof presentation === "object" &&
            presentation.instruction &&
            presentation.icon &&
            presentation.header &&
            presentation.subheader &&
            presentation.paymentButton

          if (isValidPresentation) {
            log("success", "Presentation Retrieved", "Valid payment presentation data received", {
              instruction: presentation.instruction,
              hasIcon: !!presentation.icon,
              hasHeader: !!presentation.header,
              hasShortSubheader: !!presentation.subheader?.short,
              hasEnrichedSubheader: !!presentation.subheader?.enriched,
              hasPaymentButton: !!presentation.paymentButton,
              presentationKeys: Object.keys(presentation || {}),
            })
          } else {
            console.warn("⚠️ Invalid Presentation Structure")
            console.log("Expected properties: instruction, icon, header, subheader, paymentButton")
            console.log("Received:", presentation)

            log(
              "warning",
              "Invalid Presentation",
              "Received presentation data doesn't match expected structure",
              {
                presentationKeys: Object.keys(presentation || {}),
                presentationType: typeof presentation,
              }
            )
          }
        } catch (presentationError) {
          console.error("❌ Klarna Presentation Error:", presentationError)
          console.log("🔧 Presentation Config Used:", presentationConfig)

          log("error", "Presentation Error", "Failed to get payment presentation", {
            error:
              presentationError instanceof Error
                ? presentationError.message
                : String(presentationError),
          })
          throw presentationError
        }
      } else if (typeof klarna.presentation === "function") {
        // Try direct method if Payment object doesn't exist
        try {
          presentation = await klarna.presentation(presentationConfig)

          // Console logging for direct method
          console.group("🎨 Klarna Direct Presentation Results")
          console.log("📋 Full Presentation Object (Direct):", presentation)
          console.log("📋 Presentation Type:", typeof presentation)
          console.log("📋 Presentation Keys:", Object.keys(presentation || {}))
          console.groupEnd()

          log(
            "success",
            "Presentation Retrieved",
            "Payment presentation data received via direct method",
            {
              instruction: presentation?.instruction,
              hasIcon: !!presentation?.icon,
              hasHeader: !!presentation?.header,
              hasSubheader: !!presentation?.subheader,
              hasPaymentButton: !!presentation?.paymentButton,
              presentationKeys: Object.keys(presentation || {}),
            }
          )
        } catch (presentationError) {
          console.error("❌ Klarna Direct Presentation Error:", presentationError)

          log(
            "error",
            "Direct Presentation Error",
            "Failed to get payment presentation via direct method",
            {
              error:
                presentationError instanceof Error
                  ? presentationError.message
                  : String(presentationError),
            }
          )
          throw presentationError
        }
      } else {
        // Log available methods for debugging
        const availableMethods = Object.keys(klarna).map(key => ({
          key,
          type: typeof klarna[key],
          isFunction: typeof klarna[key] === "function",
          hasNestedMethods:
            typeof klarna[key] === "object" && klarna[key] ? Object.keys(klarna[key]) : [],
        }))

        console.group("🔍 Klarna SDK Structure Analysis")
        console.log("📋 Available Methods:", availableMethods)
        console.log("🔍 Looking for: klarna.Payment.presentation")
        console.log("❌ Payment.presentation method not found")
        console.groupEnd()

        log(
          "warning",
          "Payment Method Not Found",
          "Expected Payment.presentation method not found",
          {
            availableMethods,
            suggestedFix: "Check Klarna SDK documentation for correct method signature",
          }
        )

        // Create mock presentation following Klarna Network Distribution format
        presentation = {
          instruction: "SHOW_KLARNA",
          icon: {
            component: (options = {}) => ({
              mount: (selector: string) => {
                log("info", "Mock Icon Mount", `Icon component would mount to ${selector}`, options)
                return {
                  unmount: () =>
                    log("info", "Mock Icon Unmount", `Icon unmounted from ${selector}`),
                }
              },
            }),
          },
          header: {
            component: () => ({
              mount: (selector: HTMLElement) => {
                log("info", "Mock Header Mount", `Header component mounting to container`)

                // Create a mock header element
                const headerElement = document.createElement("div")
                headerElement.innerHTML = `<span style="font-weight: 600; color: #1f2937;">Pay with Klarna</span>`
                selector.appendChild(headerElement)

                return {
                  unmount: () => {
                    log("info", "Mock Header Unmount", `Header unmounted from container`)
                    if (headerElement.parentNode) {
                      headerElement.parentNode.removeChild(headerElement)
                    }
                  },
                }
              },
            }),
          },
          subheader: {
            short: {
              component: () => ({
                mount: (selector: HTMLElement) => {
                  log("info", "Mock Short Subheader Mount", `Short subheader mounting to container`)

                  // Create a mock short subheader element
                  const shortElement = document.createElement("div")
                  shortElement.innerHTML = `<span style="font-size: 12px; color: #6b7280;">Buy now, pay later</span>`
                  selector.appendChild(shortElement)

                  return {
                    unmount: () => {
                      log(
                        "info",
                        "Mock Short Subheader Unmount",
                        `Short subheader unmounted from container`
                      )
                      if (shortElement.parentNode) {
                        shortElement.parentNode.removeChild(shortElement)
                      }
                    },
                  }
                },
              }),
            },
            enriched: {
              component: () => {
                console.log("🎭 MOCK: Creating enriched subheader component")
                log("info", "Mock Enriched Component", "Creating mock enriched subheader component")

                return {
                  mount: (selector: HTMLElement | string) => {
                    console.log(
                      "🎭 MOCK: Mounting enriched subheader to",
                      selector,
                      typeof selector
                    )
                    log(
                      "info",
                      "Mock Enriched Subheader Mount",
                      `Enriched subheader mounting to container`
                    )

                    // Handle both string selector and direct element
                    let targetElement: HTMLElement
                    if (typeof selector === "string") {
                      targetElement = document.querySelector(selector) as HTMLElement
                      console.log("🎭 MOCK: Found element by selector:", targetElement)
                    } else {
                      targetElement = selector
                      console.log("🎭 MOCK: Using direct element:", targetElement)
                    }

                    if (!targetElement) {
                      console.error("🎭 MOCK: No target element found for enriched subheader!")
                      throw new Error(`Could not find target element: ${selector}`)
                    }

                    // Create a mock enriched subheader element
                    const enrichedElement = document.createElement("div")
                    enrichedElement.innerHTML = `
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #2563eb;">
                        <span>💰</span>
                        <span>Pay in 4 interest-free payments of $${(25).toFixed(2)}</span>
                      </div>
                      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        Split your purchase into 4 equal payments, no interest or fees when you pay on time.
                      </div>
                    `
                    targetElement.appendChild(enrichedElement)
                    console.log("🎭 MOCK: Enriched element added to DOM")

                    return {
                      unmount: () => {
                        console.log("🎭 MOCK: Unmounting enriched subheader")
                        log(
                          "info",
                          "Mock Enriched Subheader Unmount",
                          `Enriched subheader unmounted from container`
                        )
                        if (enrichedElement.parentNode) {
                          enrichedElement.parentNode.removeChild(enrichedElement)
                        }
                      },
                    }
                  },
                }
              },
            },
          },
          paymentButton: {
            component: (config = {}) => ({
              mount: (selector: string) => {
                log(
                  "info",
                  "Mock Payment Button Mount",
                  `Payment button would mount to ${selector}`,
                  config
                )
                return {
                  unmount: () =>
                    log(
                      "info",
                      "Mock Payment Button Unmount",
                      `Payment button unmounted from ${selector}`
                    ),
                }
              },
            }),
          },
        }

        console.group("🎭 Mock Presentation Created")
        console.log("📋 Mock Presentation Object:", presentation)
        console.log("🎯 Mock Instruction:", presentation.instruction)
        console.groupEnd()

        log("info", "Mock Presentation Created", "Created mock presentation for demo purposes", {
          instruction: presentation.instruction,
        })
      }

      setKlarnaSDK(klarna)
      setKlarnaPresentation(presentation)

      // Log successful completion with local variables
      log("info", "Loading Complete", "Klarna SDK loading process finished successfully", {
        success: true,
        hasSDK: !!klarna,
        hasPresentation: !!presentation,
        sdkType: typeof klarna,
        presentationType: typeof presentation,
        presentationInstruction: presentation?.instruction,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load Klarna SDK")

      log("error", "SDK Error", "Failed to initialize Klarna SDK", {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      })

      setError(error)

      // Log failed completion
      log("info", "Loading Complete", "Klarna SDK loading process finished with errors", {
        success: false,
        hasSDK: false,
        hasPresentation: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (amount > 0 && loadOnMount) {
      loadKlarnaSDK()
    }
  }, [amount, currency, locale, loadOnMount])

  const retry = () => {
    if (amount > 0) {
      log("info", "Retry Initiated", "Retrying Klarna SDK initialization", {
        amount,
        currency,
        locale,
      })
      loadKlarnaSDK()
    }
  }

  return {
    klarnaSDK,
    klarnaPresentation,
    isLoading,
    error,
    retry,
  }
}
