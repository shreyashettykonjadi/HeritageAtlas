import { useParams, Link } from "react-router-dom"
import unescoSites from "../data/unesco"

export default function PlaceDetail() {
  const { id } = useParams()
  const site = unescoSites.find(function (s) {
    return s.id === id
  })

  // Handle case where site is not found
  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Site Not Found</h1>
        <p className="text-gray-600 mb-8">The heritage site you are looking for does not exist in our database.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#1B4436] text-white rounded-xl font-medium hover:bg-[#153429] transition-colors"
        >
          Return to Map
        </Link>
      </div>
    )
  }

  const categoryColors = {
    Cultural: "bg-amber-50 text-amber-900 border-amber-200",
    Natural: "bg-emerald-50 text-emerald-900 border-emerald-200",
    Mixed: "bg-indigo-50 text-indigo-900 border-indigo-200",
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <div className="w-full h-[40vh] sm:h-[50vh] bg-gradient-to-br from-[#1B4436] to-[#2C5E4F] relative shadow-lg">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-16 max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors font-medium text-sm tracking-wide bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/30 w-fit"
          >
            ← Back to Map
          </Link>
          <div className="text-white/80 text-sm font-bold tracking-widest uppercase mb-2 ml-1">
            {site.country}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            {site.name}
          </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                categoryColors[site.category] || "bg-gray-100 text-gray-800"
              }`}
            >
              {site.category} Heritage
            </span>
            <span className="text-gray-400 text-sm font-medium">
              Inscribed {site.year}
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-lg prose-slate max-w-none text-gray-600 leading-relaxed">
            <p className="text-xl text-gray-500 font-light mb-8 leading-normal">
              Explore the timeless beauty of {site.name}, a testament to our shared human history and natural wonder 
              located in the heart of {site.country}.
            </p>
            <p>
              This {site.category.toLowerCase()} site is recognized by UNESCO for its outstanding universal value. 
              {site.description ||
                `As one of the world's most significant sites, ${site.name} offers a unique glimpse into the past. 
                Visitors can experience the remarkable architecture, landscapes, and cultural traditions that have 
                been preserved for generations. Whether you are a history buff or a nature lover, this destination 
                promises an unforgettable journey.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
