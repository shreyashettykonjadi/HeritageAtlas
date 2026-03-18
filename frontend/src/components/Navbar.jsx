import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout, requireAuth } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await logout()
      navigate("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 left-0 w-full h-16 z-50 bg-[#FBF3E4]/90 backdrop-blur-md border-b border-[#DDAD8A]/40 shadow-sm">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight text-[#1B4436]">
          HeritageAtlas
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/my-journey"
                className="text-sm font-medium text-[#1B4436] hover:text-[#153429] px-3 py-2 rounded-lg hover:bg-[#1B4436]/5 transition-colors"
              >
                My Journey
              </Link>

              <div className="w-px h-5 bg-[#1B4436]/15" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#1B4436] hover:text-[#153429] px-3 py-2 rounded-lg hover:bg-[#1B4436]/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-[#1B4436] hover:bg-[#153429] px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
