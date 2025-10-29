"use client"

import { useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now()
    const toast = { id, message, type }
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
