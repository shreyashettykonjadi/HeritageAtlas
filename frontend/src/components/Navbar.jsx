import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#F9E4C5] border-b border-[#DDAD8A]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold text-[#1B4436]">
          HeritageAtlas
        </Link>

        <Link
          to="/my-journey"
          className="text-[#1B4436] hover:underline"
        >
          My Journey
        </Link>
      </div>
    </nav>
  )
}
