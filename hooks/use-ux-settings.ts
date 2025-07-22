import { useState, useEffect } from "react"
import { PAYMENT_METHODS } from "@/lib/constants"

const PAYMENT_METHODS_LIST = [
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.KLARNA,
  PAYMENT_METHODS.PAYPAL,
  PAYMENT_METHODS.BANK,
]

interface UXSettings {
  paymentOrder: string[]
  defaultPayment: string
  showOtherSubheader: boolean
  showKlarnaSubheader: boolean
  staggeredLoading: boolean
  useStaticKlarna: boolean
  paymentMethodsVisible: boolean
}

export function useUXSettings() {
  const [hydrated, setHydrated] = useState(false)
  const [settings, setSettings] = useState<UXSettings>({
    paymentOrder: PAYMENT_METHODS_LIST,
    defaultPayment: PAYMENT_METHODS.CARD,
    showOtherSubheader: true,
    showKlarnaSubheader: true,
    staggeredLoading: true,
    useStaticKlarna: false,
    paymentMethodsVisible: false,
  })

  // Hydrate state from localStorage on client only
  useEffect(() => {
    const storedOrder = localStorage.getItem("paymentOrder")
    const storedDefault = localStorage.getItem("defaultPayment")
    const storedOther = localStorage.getItem("showOtherSubheader")
    const storedKlarna = localStorage.getItem("showKlarnaSubheader")
    const storedStaggered = localStorage.getItem("staggeredLoading")
    const storedStaticKlarna = localStorage.getItem("useStaticKlarna")

    setSettings(prev => ({
      ...prev,
      paymentOrder: storedOrder ? JSON.parse(storedOrder) : prev.paymentOrder,
      defaultPayment: storedDefault || prev.defaultPayment,
      showOtherSubheader: storedOther !== null ? storedOther === "true" : prev.showOtherSubheader,
      showKlarnaSubheader:
        storedKlarna !== null ? storedKlarna === "true" : prev.showKlarnaSubheader,
      staggeredLoading:
        storedStaggered !== null ? storedStaggered === "true" : prev.staggeredLoading,
      useStaticKlarna:
        storedStaticKlarna !== null ? storedStaticKlarna === "true" : prev.useStaticKlarna,
    }))
    setHydrated(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("paymentOrder", JSON.stringify(settings.paymentOrder))
      localStorage.setItem("defaultPayment", settings.defaultPayment)
      localStorage.setItem("showOtherSubheader", settings.showOtherSubheader.toString())
      localStorage.setItem("showKlarnaSubheader", settings.showKlarnaSubheader.toString())
      localStorage.setItem("staggeredLoading", settings.staggeredLoading.toString())
      localStorage.setItem("useStaticKlarna", settings.useStaticKlarna.toString())
    }
  }, [settings, hydrated])

  // Handle staggered loading animation
  useEffect(() => {
    if (settings.staggeredLoading) {
      const timer = setTimeout(() => {
        setTimeout(() => {
          setSettings(prev => ({ ...prev, paymentMethodsVisible: true }))
        }, 100)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setSettings(prev => ({ ...prev, paymentMethodsVisible: true }))
    }
  }, [settings.staggeredLoading])

  const updateSetting = <K extends keyof UXSettings>(key: K, value: UXSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const movePayment = (idx: number, dir: -1 | 1) => {
    const newOrder = [...settings.paymentOrder]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= newOrder.length) return
    ;[newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]]
    updateSetting("paymentOrder", newOrder)
  }

  return {
    ...settings,
    hydrated,
    updateSetting,
    movePayment,
  }
}
