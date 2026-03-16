import { Link } from "react-router-dom"

export default function Navbar({ user }) {
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
                className="text-[#1B4436] hover:underline"
              >
                Logout
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
