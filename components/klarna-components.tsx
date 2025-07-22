"use client"

import React, { useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import type { KlarnaPresentation, KlarnaComponent } from "@/types"

// Generic Klarna Component Wrapper - handles mounting any Klarna presentation component
const KlarnaComponent = ({
  paymentPresentation,
  componentPath,
  containerId,
  componentName,
  className = "min-h-[20px]",
  onMountError,
}: {
  paymentPresentation: KlarnaPresentation
  componentPath: string // e.g., "icon.component", "header.component", "subheader.enriched.component"
  containerId: string
  componentName: string
  className?: string
  onMountError?: () => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const componentRef = useRef<KlarnaComponent | null>(null)
  const mountAttempted = useRef(false)

  // Helper to get nested component from path with fallback paths
  const getComponent = (obj: any, path: string) => {
    // Try the primary path first
    const primaryComponent = path.split(".").reduce((current, key) => current?.[key], obj)
    if (primaryComponent) {
      return primaryComponent
    }

    // For enriched subheader, try alternative paths
    if (path === "subheader.enriched.component") {
      const alternatives = [
        "subheader.enriched",
        "enrichedSubheader.component",
        "enrichedSubheader",
        "enriched.component",
        "enriched",
      ]

      for (const altPath of alternatives) {
        const component = altPath.split(".").reduce((current, key) => current?.[key], obj)
        if (component) {
          console.log(`[KlarnaComponent] Found component at alternative path: ${altPath}`)
          return component
        }
      }
    }

    return null
  }

  const logInfo = useCallback(
    (message: string, data?: any) => {
      // Only log for enriched subheader and only when there are actual issues or successes
      if (componentName.includes("Enriched")) {
        if (message.includes("not found") || message.includes("Error")) {
          console.warn(`[KlarnaEnrichedSubheader] ${message}`, data || "")
        } else if (
          message.includes("mounted successfully") ||
          message.includes("Attempting to mount")
        ) {
          console.log(`[KlarnaEnrichedSubheader] ${message}`, data || "")
        }
      }
    },
    [componentName]
  )

  useEffect(() => {
    mountAttempted.current = false

    if (!paymentPresentation) {
      logInfo("No payment presentation available")
      return
    }

    if (!containerRef.current) {
      logInfo("No container ref available")
      return
    }

    if (mountAttempted.current) {
      logInfo("Mount already attempted")
      return
    }

    const component = getComponent(paymentPresentation, componentPath)
    if (!component) {
      logInfo(`Component not found at path: ${componentPath}`, paymentPresentation)
      onMountError?.()
      return
    }

    if (componentRef.current) {
      try {
        componentRef.current.unmount()
        componentRef.current = null
      } catch {
        logInfo("Error during unmount")
      }
    }

    logInfo(`Attempting to mount ${componentName}`)

    try {
      mountAttempted.current = true
      containerRef.current.innerHTML = ""
      const componentInstance = component()
      logInfo(`Component instance created for ${componentName}`)

      if (componentInstance.mount) {
        componentInstance.mount(`#${containerId}`)
        logInfo(`${componentName} mounted successfully`)
      } else if (componentInstance.htmlElement) {
        containerRef.current.appendChild(componentInstance.htmlElement)
        logInfo(`${componentName} HTML element appended successfully`)

        const originalUnmount = componentInstance.unmount
        componentInstance.unmount = () => {
          try {
            if (componentInstance.htmlElement?.parentNode) {
              componentInstance.htmlElement.parentNode.removeChild(componentInstance.htmlElement)
            }
            originalUnmount?.call(componentInstance)
          } catch {
            logInfo("Error during unmount")
          }
        }
      } else {
        throw new Error("Component has neither mount method nor htmlElement property")
      }

      componentRef.current = componentInstance
    } catch (error) {
      mountAttempted.current = false
      logInfo(`Error mounting ${componentName}:`, error)
      onMountError?.()
    }

    return () => {
      if (componentRef.current) {
        try {
          componentRef.current.unmount()
          componentRef.current = null
        } catch {
          logInfo("Error during unmount")
        }
      }
    }
  }, [componentName, componentPath, containerId, paymentPresentation, logInfo, onMountError])

  return <div id={containerId} ref={containerRef} className={className} />
}

// Specific component wrappers for better type safety and consistency
export const KlarnaIcon = React.memo((props: { paymentPresentation: any }) => (
  <KlarnaComponent
    paymentPresentation={props.paymentPresentation}
    componentPath="icon.component"
    containerId="klarna-icon-container"
    componentName="Icon"
    className="w-9 h-9 flex items-center justify-center flex-shrink-0 [&>*]:max-w-full [&>*]:max-h-full [&>*]:w-auto [&>*]:h-auto [&>*]:object-contain"
  />
))

export const KlarnaHeader = React.memo((props: { paymentPresentation: any }) => (
  <KlarnaComponent
    paymentPresentation={props.paymentPresentation}
    componentPath="header.component"
    containerId="klarna-header-container"
    componentName="Header"
    className="flex items-center text-sm font-medium leading-tight min-h-[16px]"
  />
))

export const KlarnaShortSubheader = React.memo((props: { paymentPresentation: any }) => (
  <KlarnaComponent
    paymentPresentation={props.paymentPresentation}
    componentPath="subheader.short.component"
    containerId="klarna-short-subheader-container"
    componentName="Short Subheader"
    className="flex items-center text-xs text-muted-foreground leading-tight min-h-[12px]"
  />
))

export const KlarnaEnrichedSubheader = React.memo(
  (props: { paymentPresentation: any; showFallback?: boolean }) => {
    const [hasFailed, setHasFailed] = React.useState(false)

    // Check if enriched component exists
    const hasEnrichedComponent = React.useMemo(() => {
      if (!props.paymentPresentation) {
        return false
      }

      const paths = [
        "subheader.enriched.component",
        "subheader.enriched",
        "enrichedSubheader.component",
        "enrichedSubheader",
        "enriched.component",
        "enriched",
      ]

      return paths.some(path => {
        const component = path
          .split(".")
          .reduce((current, key) => current?.[key], props.paymentPresentation)
        return !!component
      })
    }, [props.paymentPresentation])

    // Show fallback if component failed to mount or doesn't exist
    if (!hasEnrichedComponent || (hasFailed && props.showFallback !== false)) {
      return (
        <div className="min-h-[40px] text-sm text-muted-foreground leading-relaxed flex items-start">
          <div>Pay in 4 interest-free installments or pay later with Klarna. No hidden fees.</div>
        </div>
      )
    }

    return (
      <KlarnaComponent
        paymentPresentation={props.paymentPresentation}
        componentPath="subheader.enriched.component"
        containerId="klarna-enriched-subheader-container"
        componentName="Enriched Subheader"
        className="min-h-[40px] text-sm text-muted-foreground leading-relaxed klarna-enriched-subheader flex items-start"
        onMountError={() => setHasFailed(true)}
      />
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.paymentPresentation === nextProps.paymentPresentation &&
      prevProps.showFallback === nextProps.showFallback
    )
  }
)

// Improved Klarna loading placeholder
export const KlarnaLoadingPlaceholder = () => (
  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
    <div className="relative">
      <div className="w-9 h-9 bg-gradient-to-r from-pink-100 to-pink-200 rounded-sm animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
    </div>
  </div>
)

// Klarna content component that handles loading states and rendering
interface KlarnaContentProps {
  isLoading: boolean
  staggeredLoading: boolean
  useStaticKlarna: boolean
  klarnaPresentation: any
  showSubheader?: boolean
}

export const KlarnaContent = React.memo(
  ({
    isLoading,
    staggeredLoading,
    useStaticKlarna,
    klarnaPresentation,
    showSubheader = true,
  }: KlarnaContentProps) => {
    return (
      <>
        {/* Icon */}
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 min-w-[36px]">
          {useStaticKlarna ? (
            <Image
              src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.png"
              alt="Klarna"
              width={36}
              height={36}
              className="object-contain w-9 h-9"
            />
          ) : (
            <>
              {isLoading && staggeredLoading && <KlarnaLoadingPlaceholder />}
              {isLoading && !staggeredLoading && <Skeleton className="w-9 h-9 rounded" />}
              {!isLoading && klarnaPresentation && (
                <div className={staggeredLoading ? "animate-fade-in" : ""}>
                  <KlarnaIcon paymentPresentation={klarnaPresentation} />
                </div>
              )}
              {!isLoading && !klarnaPresentation && (
                <div className="w-9 h-9 bg-gradient-to-r from-pink-100 to-pink-200 rounded-sm flex items-center justify-center text-pink-600 text-xs font-medium">
                  K
                </div>
              )}
            </>
          )}
        </div>

        {/* Header and Subheader */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center text-sm font-medium leading-tight min-h-[20px]">
            {useStaticKlarna ? (
              <span className="text-sm font-medium">Klarna</span>
            ) : (
              <>
                {isLoading && staggeredLoading && (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[16px] w-[52px]" />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                  </div>
                )}
                {isLoading && !staggeredLoading && <Skeleton className="h-[16px] w-[52px]" />}
                {!isLoading && klarnaPresentation && (
                  <div className={staggeredLoading ? "animate-fade-in" : ""}>
                    <KlarnaHeader paymentPresentation={klarnaPresentation} />
                  </div>
                )}
                {!isLoading && !klarnaPresentation && (
                  <span className="text-sm font-medium">Klarna</span>
                )}
              </>
            )}
          </div>

          {showSubheader && (
            <div className="flex items-center text-xs text-muted-foreground leading-tight mt-0.5 min-h-[16px]">
              {isLoading && staggeredLoading && (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[12px] w-[120px]" />
                  <div className="w-1 h-1 bg-pink-300 rounded-full animate-pulse delay-100" />
                </div>
              )}
              {isLoading && !staggeredLoading && <Skeleton className="h-[12px] w-[120px]" />}
              {!isLoading && klarnaPresentation && (
                <div className={staggeredLoading ? "animate-fade-in" : ""}>
                  <KlarnaShortSubheader paymentPresentation={klarnaPresentation} />
                </div>
              )}
              {!isLoading && !klarnaPresentation && (
                <span className="text-xs text-muted-foreground">Buy now, pay later</span>
              )}
            </div>
          )}
        </div>
      </>
    )
  }
)

// Pre-mounted enriched subheader that's always present but hidden
export const KlarnaPreMountedEnrichedSubheader = React.memo(
  ({ klarnaPresentation, isVisible }: { klarnaPresentation: any; isVisible: boolean }) => {
    // Always render the component but control visibility via CSS
    // The component is always mounted so Klarna SDK can initialize it
    return (
      <div className={`transition-all duration-200 ${isVisible ? "block" : "hidden"}`}>
        {klarnaPresentation && <KlarnaEnrichedSubheader paymentPresentation={klarnaPresentation} />}
      </div>
    )
  }
)

// Klarna enriched subheader for expanded state
export const KlarnaExpandedContent = React.memo(
  ({
    isLoading,
    staggeredLoading,
    klarnaPresentation,
  }: Pick<KlarnaContentProps, "isLoading" | "staggeredLoading" | "klarnaPresentation">) => {
    return (
      <div className="transition-opacity duration-200 px-4 pb-2 opacity-100">
        <div className="min-h-[40px] flex items-start">
          {isLoading && staggeredLoading && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-[16px] w-[300px]" />
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200" />
            </div>
          )}
          {isLoading && !staggeredLoading && <Skeleton className="h-[16px] w-[300px]" />}
          {!isLoading && klarnaPresentation && (
            <div className={staggeredLoading ? "animate-fade-in" : ""}>
              <KlarnaEnrichedSubheader paymentPresentation={klarnaPresentation} />
            </div>
          )}
          {!isLoading && !klarnaPresentation && (
            <div className="text-sm text-muted-foreground">
              Pay in 4 interest-free installments or pay later with Klarna
            </div>
          )}
        </div>
      </div>
    )
  }
)

// Enhanced pre-mounted enriched subheader manager
export const KlarnaEnrichedSubheaderManager = React.memo(
  ({
    klarnaPresentation,
    isVisible,
    isLoading,
    staggeredLoading,
  }: {
    klarnaPresentation: any
    isVisible: boolean
    isLoading: boolean
    staggeredLoading: boolean
  }) => {
    const [isInitialized, setIsInitialized] = React.useState(false)
    const [hasError, setHasError] = React.useState(false)
    const displayContainerRef = React.useRef<HTMLDivElement>(null)
    const hiddenContainerRef = React.useRef<HTMLDivElement>(null)
    const enrichedComponentRef = React.useRef<any>(null)

    // Initialize the enriched component in the hidden container
    React.useEffect(() => {
      if (!klarnaPresentation || !hiddenContainerRef.current || isInitialized) {
        return
      }

      console.log("[KlarnaEnrichedSubheaderManager] Initializing enriched subheader")

      // Try to get the enriched component
      const paths = [
        "subheader.enriched.component",
        "subheader.enriched",
        "enrichedSubheader.component",
        "enrichedSubheader",
        "enriched.component",
        "enriched",
      ]

      let enrichedComponent = null
      for (const path of paths) {
        enrichedComponent = path
          .split(".")
          .reduce((current, key) => current?.[key], klarnaPresentation)
        if (enrichedComponent) {
          console.log(`[KlarnaEnrichedSubheaderManager] Found enriched component at path: ${path}`)
          break
        }
      }

      if (!enrichedComponent) {
        console.warn("[KlarnaEnrichedSubheaderManager] No enriched component found")
        setHasError(true)
        setIsInitialized(true)
        return
      }

      try {
        // Create the component instance
        const componentInstance = enrichedComponent()

        if (componentInstance.mount && hiddenContainerRef.current) {
          // Mount to the hidden container first
          componentInstance.mount(hiddenContainerRef.current)
          console.log(
            "[KlarnaEnrichedSubheaderManager] Enriched component mounted to hidden container"
          )
        } else if (componentInstance.htmlElement && hiddenContainerRef.current) {
          hiddenContainerRef.current.appendChild(componentInstance.htmlElement)
          console.log(
            "[KlarnaEnrichedSubheaderManager] Enriched component HTML element added to hidden container"
          )
        } else {
          throw new Error("Component has no valid mounting method")
        }

        enrichedComponentRef.current = componentInstance
        setIsInitialized(true)
        setHasError(false)
      } catch (error) {
        console.error(
          "[KlarnaEnrichedSubheaderManager] Error initializing enriched component:",
          error
        )
        setHasError(true)
        setIsInitialized(true)
      }
    }, [klarnaPresentation, isInitialized])

    // Move the component between hidden and visible containers based on visibility
    React.useEffect(() => {
      if (!isInitialized || !enrichedComponentRef.current || hasError) {
        return
      }

      const component = enrichedComponentRef.current

      try {
        if (isVisible && displayContainerRef.current) {
          // Move to visible container
          if (
            component.htmlElement &&
            component.htmlElement.parentNode !== displayContainerRef.current
          ) {
            // Clear any existing content first
            displayContainerRef.current.innerHTML = ""
            displayContainerRef.current.appendChild(component.htmlElement)
            console.log(
              "[KlarnaEnrichedSubheaderManager] Moved enriched component to visible container"
            )
          }
        } else if (!isVisible && hiddenContainerRef.current) {
          // Move back to hidden container
          if (
            component.htmlElement &&
            component.htmlElement.parentNode !== hiddenContainerRef.current
          ) {
            hiddenContainerRef.current.appendChild(component.htmlElement)
            console.log(
              "[KlarnaEnrichedSubheaderManager] Moved enriched component to hidden container"
            )
          }
        }
      } catch (error) {
        console.error("[KlarnaEnrichedSubheaderManager] Error moving component:", error)
        setHasError(true)
      }
    }, [isVisible, isInitialized, hasError])

    // Cleanup
    React.useEffect(() => {
      return () => {
        if (enrichedComponentRef.current) {
          try {
            enrichedComponentRef.current.unmount?.()
            console.log("[KlarnaEnrichedSubheaderManager] Cleaned up enriched component")
          } catch (error) {
            console.error("[KlarnaEnrichedSubheaderManager] Error during cleanup:", error)
          }
          enrichedComponentRef.current = null
        }
      }
    }, [])

    // Error boundary-like behavior for rendering
    if (hasError) {
      return (
        <div
          className={`transition-all duration-200 ${
            isVisible ? "block opacity-100" : "hidden opacity-0"
          }`}
        >
          <div className="px-4 pb-2">
            <div className="min-h-[40px] flex items-start">
              <div className="text-sm text-muted-foreground leading-relaxed">
                Pay in 4 interest-free installments or pay later with Klarna. No hidden fees.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        {/* Hidden container for SDK initialization */}
        <div
          ref={hiddenContainerRef}
          className="fixed -top-[9999px] left-0 opacity-0 pointer-events-none"
          aria-hidden="true"
          id="klarna-enriched-hidden-container"
        />

        {/* Visible container */}
        <div
          className={`transition-all duration-200 ${
            isVisible ? "block opacity-100" : "hidden opacity-0"
          }`}
        >
          <div className="px-4 pb-2">
            <div className="min-h-[40px] flex items-start">
              {isLoading && staggeredLoading && (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[16px] w-[300px]" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200" />
                </div>
              )}
              {isLoading && !staggeredLoading && <Skeleton className="h-[16px] w-[300px]" />}
              {!isLoading && (
                <div className={staggeredLoading ? "animate-fade-in" : ""}>
                  <div
                    ref={displayContainerRef}
                    id="klarna-enriched-display-container"
                    className="min-h-[40px] text-sm text-muted-foreground leading-relaxed flex items-start"
                  >
                    {!isInitialized ? (
                      <div>
                        Pay in 4 interest-free installments or pay later with Klarna. No hidden
                        fees.
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }
)

KlarnaIcon.displayName = "KlarnaIcon"
KlarnaHeader.displayName = "KlarnaHeader"
KlarnaShortSubheader.displayName = "KlarnaShortSubheader"
KlarnaEnrichedSubheader.displayName = "KlarnaEnrichedSubheader"
KlarnaContent.displayName = "KlarnaContent"
KlarnaPreMountedEnrichedSubheader.displayName = "KlarnaPreMountedEnrichedSubheader"
KlarnaExpandedContent.displayName = "KlarnaExpandedContent"
KlarnaEnrichedSubheaderManager.displayName = "KlarnaEnrichedSubheaderManager"
