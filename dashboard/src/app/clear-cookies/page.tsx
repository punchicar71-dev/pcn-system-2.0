'use client'

import { useEffect } from 'react'

export default function ClearCookies() {
  useEffect(() => {
    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      const eqPos = c.indexOf('=')
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
    })

    // Clear localStorage
    localStorage.clear()
    sessionStorage.clear()

    // Redirect
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Clearing Cookies...</h1>
        <p className="text-gray-600">You will be redirected to the login page.</p>
      </div>
    </div>
  )
}
