"use client"

import React, { useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

// Generic Klarna Component Wrapper - handles mounting any Klarna presentation component
const KlarnaComponent = ({
  paymentPresentation,
  componentPath,
  containerId,
  componentName,
  className = "min-h-[20px]",
}: {
  paymentPresentation: any
  componentPath: string // e.g., "icon.component", "header.component", "subheader.enriched.component"
  containerId: string
  componentName: string
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const componentRef = useRef<any>(null)
  const mountAttempted = useRef(false)

  // Helper to get nested component from path
  const getComponent = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  const logInfo = useCallback(() => {
    // Logging is disabled
  }, [])

  useEffect(() => {
    mountAttempted.current = false

    if (!paymentPresentation) {
      logInfo()
      return
    }

    if (!containerRef.current) {
      logInfo()
      return
    }

    if (mountAttempted.current) {
      logInfo()
      return
    }

    const component = getComponent(paymentPresentation, componentPath)
    if (!component) {
      logInfo()
      return
    }

    if (componentRef.current) {
      try {
        componentRef.current.unmount()
        componentRef.current = null
      } catch {
        logInfo()
      }
    }

    logInfo()

    try {
      mountAttempted.current = true
      containerRef.current.innerHTML = ""
      const componentInstance = component()
      logInfo()

      if (componentInstance.mount) {
        componentInstance.mount(`#${containerId}`)
        logInfo()
      } else if (componentInstance.htmlElement) {
        containerRef.current.appendChild(componentInstance.htmlElement)
        logInfo()

        const originalUnmount = componentInstance.unmount
        componentInstance.unmount = () => {
          try {
            if (componentInstance.htmlElement?.parentNode) {
              componentInstance.htmlElement.parentNode.removeChild(componentInstance.htmlElement)
            }
            originalUnmount?.call(componentInstance)
          } catch {
            logInfo()
          }
        }
      } else {
        throw new Error("Component has neither mount method nor htmlElement property")
      }

      componentRef.current = componentInstance
    } catch {
      mountAttempted.current = false
      logInfo()
    }

    return () => {
      if (componentRef.current) {
        try {
          componentRef.current.unmount()
          componentRef.current = null
        } catch {
          logInfo()
        }
      }
    }
  }, [componentName, componentPath, containerId, paymentPresentation, logInfo])

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
  (props: { paymentPresentation: any }) => (
    <KlarnaComponent
      paymentPresentation={props.paymentPresentation}
      componentPath="subheader.enriched.component"
      containerId="klarna-enriched-subheader-container"
      componentName="Enriched Subheader"
      className="min-h-[40px] text-sm text-muted-foreground leading-relaxed klarna-enriched-subheader flex items-start"
    />
  ),
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.paymentPresentation === nextProps.paymentPresentation
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
  paymentMethod?: string
}

export const KlarnaContent = React.memo(({
  isLoading,
  staggeredLoading,
  useStaticKlarna,
  klarnaPresentation,
  showSubheader = true,
  paymentMethod,
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
})

// Klarna enriched subheader for expanded state
export const KlarnaExpandedContent = React.memo(({
  isLoading,
  staggeredLoading,
  klarnaPresentation,
  paymentMethod,
}: Pick<KlarnaContentProps, 'isLoading' | 'staggeredLoading' | 'klarnaPresentation' | 'paymentMethod'>) => {
  const PAYMENT_METHODS = { KLARNA: 'klarna' } // Import this from constants in real implementation
  
  return (
    <div
      className={`transition-opacity duration-200 px-4 pb-2 ${
        paymentMethod === PAYMENT_METHODS.KLARNA
          ? "opacity-100"
          : "opacity-0 pointer-events-none absolute -z-10"
      }`}
    >
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
})

KlarnaIcon.displayName = "KlarnaIcon"
KlarnaHeader.displayName = "KlarnaHeader"
KlarnaShortSubheader.displayName = "KlarnaShortSubheader"
KlarnaEnrichedSubheader.displayName = "KlarnaEnrichedSubheader"
KlarnaContent.displayName = "KlarnaContent"
KlarnaExpandedContent.displayName = "KlarnaExpandedContent" 
