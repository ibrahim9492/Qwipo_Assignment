import axios from "axios"

// Use VITE_API_BASE_URL if provided; else default to same origin
const baseURL = import.meta.env.VITE_API_BASE_URL || (typeof window !== "undefined" ? `${window.location.origin}` : "")

export const api = axios.create({
  baseURL, // expects server deployed to same domain root; else set VITE_API_BASE_URL to server URL
  headers: { "Content-Type": "application/json" },
})

// helper to build query string
export function toQuery(params) {
  const usp = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      usp.set(k, String(v))
    }
  })
  const s = usp.toString()
  return s ? `?${s}` : ""
}
