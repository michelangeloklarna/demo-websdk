"use client"

import { useState, useEffect, useCallback } from "react"
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

// Global SDK manager to prevent custom element conflicts
class KlarnaSDKManager {
  private static instance: KlarnaSDKManager | null = null
  private sdk: any = null
  private isLoading = false
  private error: Error | null = null
  private loadPromise: Promise<any> | null = null
  private presentations: Map<string, any> = new Map()
  private loggers: Set<Function> = new Set()

  static getInstance(): KlarnaSDKManager {
    if (!KlarnaSDKManager.instance) {
      KlarnaSDKManager.instance = new KlarnaSDKManager()
    }
    return KlarnaSDKManager.instance
  }

  addLogger(logger: Function) {
    this.loggers.add(logger)
  }

  removeLogger(logger: Function) {
    this.loggers.delete(logger)
  }

  private log(
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    data?: any
  ) {
    this.loggers.forEach(logger => {
      try {
        logger(type, title, message, data)
      } catch (e) {
        // Ignore logger errors
      }
    })
  }

  async loadSDK(locale: string = "en-US"): Promise<any> {
    // If already loaded, return existing SDK
    if (this.sdk) {
      this.log("info", "SDK Already Loaded", "Returning existing SDK instance")
      return this.sdk
    }

    // If already loading, return the same promise
    if (this.loadPromise) {
      this.log("info", "SDK Loading In Progress", "Waiting for existing load promise")
      return this.loadPromise
    }

    this.isLoading = true
    this.error = null
    this.log("info", "SDK Loading Started", "Beginning Klarna WebSDK initialization")

    this.loadPromise = this.performSDKLoad(locale)

    try {
      this.sdk = await this.loadPromise
      this.log("success", "SDK Loaded Successfully", "Klarna SDK ready for use")
      return this.sdk
    } catch (error) {
      this.error = error as Error
      this.log("error", "SDK Load Failed", "Failed to load Klarna SDK", error)
      throw error
    } finally {
      this.isLoading = false
      this.loadPromise = null
    }
  }

  private async performSDKLoad(locale: string): Promise<any> {
    try {
      // Check for existing custom elements and handle conflicts
      this.handleCustomElementConflicts()

      // Dynamic import with retry logic
      this.log("info", "Dynamic Import", "Loading Klarna WebSDK from CDN")

      const importKlarna = new Function(
        'return import("https://js.klarna.com/web-sdk/v2/klarna.mjs")'
      )
      const module = await Promise.race([
        importKlarna(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Klarna SDK load timeout")), 15000)
        ),
      ])

      const KlarnaSDK = module?.KlarnaSDK || module?.default || module

      if (!KlarnaSDK || typeof KlarnaSDK !== "function") {
        throw new Error(
          `KlarnaSDK not found. Available exports: ${Object.keys(module || {}).join(", ")}`
        )
      }

      // Initialize SDK with error handling
      const config = {
        clientId: process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID || "klarna_test_client_***",
        products: ["PAYMENT"],
        partnerAccountId:
          process.env.NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID || "krn:partner:global:account:***",
        locale,
        environment: process.env.NODE_ENV === "production" ? "production" : "playground",
        region: "na",
        lazy: true,
        preload: true,
      }

      this.log("info", "SDK Initialization", "Initializing Klarna SDK", config)

      let klarna
      try {
        klarna = await KlarnaSDK(config)
      } catch (initError) {
        // Handle custom element registry conflicts during initialization
        if (this.isCustomElementError(initError)) {
          this.log(
            "warning",
            "Custom Element Conflict During Init",
            "Attempting recovery",
            initError
          )

          // Try to clear conflicts and retry once
          this.handleCustomElementConflicts()

          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 100))
          klarna = await KlarnaSDK(config)
        } else {
          throw initError
        }
      }

      if (!klarna || typeof klarna !== "object") {
        throw new Error(`Invalid SDK structure: expected object, got ${typeof klarna}`)
      }

      this.log("success", "SDK Initialized", "Klarna SDK ready", {
        hasPayment: !!klarna.Payment,
        methods: Object.keys(klarna),
      })

      return klarna
    } catch (error) {
      this.log("error", "SDK Load Error", "Failed to load SDK", error)
      throw error
    }
  }

  private isCustomElementError(error: any): boolean {
    return (
      error instanceof DOMException &&
      error.name === "NotSupportedError" &&
      error.message.includes("CustomElementRegistry")
    )
  }

  private handleCustomElementConflicts() {
    // Log known custom elements that might conflict
    if (typeof window !== "undefined" && window.customElements) {
      const knownKlarnaElements = [
        "test-drive-badge",
        "klarna-placement",
        "klarna-payment-view",
        "klarna-express-button",
      ]

      knownKlarnaElements.forEach(elementName => {
        try {
          // Check if element is already defined
          if (window.customElements.get(elementName)) {
            this.log(
              "warning",
              "Custom Element Exists",
              `Custom element '${elementName}' already defined`
            )
          }
        } catch (e) {
          // Ignore errors when checking
        }
      })
    }
  }

  async getPresentation(amount: number, currency: string, locale: string): Promise<any> {
    if (!this.sdk) {
      throw new Error("SDK not loaded. Call loadSDK() first.")
    }

    const key = `${amount}-${currency}-${locale}`

    // Return cached presentation if available
    if (this.presentations.has(key)) {
      this.log("info", "Presentation Cache Hit", "Using cached presentation")
      return this.presentations.get(key)
    }

    try {
      const presentationConfig = {
        amount: Math.round(amount * 100), // Convert to minor units
        currency,
        locale,
      }

      this.log("info", "Creating Presentation", "Getting payment presentation", presentationConfig)

      let presentation: any

      // Try different presentation methods
      if (this.sdk.Payment && typeof this.sdk.Payment.presentation === "function") {
        presentation = await this.sdk.Payment.presentation(presentationConfig)
      } else if (typeof this.sdk.presentation === "function") {
        presentation = await this.sdk.presentation(presentationConfig)
      } else {
        throw new Error("No presentation method available")
      }

      if (presentation) {
        // Cache the presentation
        this.presentations.set(key, presentation)
        this.log("success", "Presentation Created", "Payment presentation ready")

        // Debug: Log presentation structure
        const hasIcon = !!presentation?.icon?.component
        const hasHeader = !!presentation?.header?.component
        const hasShortSubheader = !!presentation?.subheader?.short?.component
        const hasEnrichedSubheader = !!presentation?.subheader?.enriched?.component

        this.log("info", "Presentation Structure", "Available components", {
          icon: hasIcon,
          header: hasHeader,
          shortSubheader: hasShortSubheader,
          enrichedSubheader: hasEnrichedSubheader,
          keys: Object.keys(presentation || {}),
        })
      }

      return presentation
    } catch (error) {
      if (this.isCustomElementError(error)) {
        this.log(
          "warning",
          "Custom Element Conflict in Presentation",
          "Attempting to use cached presentation",
          error
        )

        // Try to return any cached presentation as fallback
        const cachedPresentation = Array.from(this.presentations.values())[0]
        if (cachedPresentation) {
          this.log(
            "info",
            "Using Fallback Presentation",
            "Using cached presentation due to conflict"
          )
          return cachedPresentation
        }
      }

      this.log("error", "Presentation Error", "Failed to create presentation", error)
      throw error
    }
  }

  // Clear all caches and reset
  reset() {
    this.log("info", "SDK Reset", "Clearing all caches and resetting manager")
    this.presentations.clear()
    this.sdk = null
    this.error = null
    this.loadPromise = null
    this.isLoading = false
  }

  getSDK() {
    return this.sdk
  }

  getError() {
    return this.error
  }

  getIsLoading() {
    return this.isLoading
  }
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

  const manager = KlarnaSDKManager.getInstance()

  const log = useCallback(
    (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => {
      if (title.includes("Presentation") || title.includes("Amount")) {
        console.log(`[useKlarna] ${type}: ${title} - ${message}`, data || "")
      }
      onLog?.(type, title, message, data)
    },
    [onLog]
  )

  const loadSDK = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const sdk = await manager.loadSDK(locale)
      setKlarnaSDK(sdk)
    } catch (err) {
      const error = err as Error
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [locale, manager])

  // Update presentation when amount/currency/locale changes
  const updatePresentation = useCallback(async () => {
    if (!klarnaSDK || amount <= 0) return

    try {
      setIsLoading(true)
      const presentation = await manager.getPresentation(amount, currency, locale)
      setKlarnaPresentation(presentation)
      log("success", "Presentation Updated", "Presentation updated successfully")
    } catch (err) {
      const error = err as Error
      log("error", "Presentation Update Error", error.message, error)
    } finally {
      setIsLoading(false)
    }
  }, [klarnaSDK, amount, currency, locale, manager, log])

  // Retry function
  const retry = useCallback(() => {
    log("info", "Retry Initiated", "Retrying SDK initialization")
    loadSDK()
  }, [loadSDK, log])

  useEffect(() => {
    if (onLog) {
      manager.addLogger(onLog)
    }
    return () => {
      if (onLog) {
        manager.removeLogger(onLog)
      }
    }
  }, [manager, onLog])

  // Load SDK on mount - call presentation function immediately for better UX
  useEffect(() => {
    if (loadOnMount) {
      loadSDK()
    }
  }, [loadOnMount, loadSDK])

  // Update presentation when dependencies change
  useEffect(() => {
    if (klarnaSDK && amount > 0) {
      updatePresentation()
    }
  }, [klarnaSDK, amount, currency, locale, updatePresentation])

  return {
    klarnaSDK,
    klarnaPresentation,
    isLoading,
    error,
    retry,
  }
}
