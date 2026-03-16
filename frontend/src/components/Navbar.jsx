import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await api.post("/auth/logout")
      setUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Failed to logout", error)
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

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/my-journey"
                className="text-[#1B4436] hover:underline"
              >
                My Journey
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-[#1B4436] hover:underline"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#1B4436] hover:underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-[#1B4436] hover:underline"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
