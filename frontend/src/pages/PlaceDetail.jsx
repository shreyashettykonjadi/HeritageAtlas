import { useParams, Link } from "react-router-dom"
import api from "../services/api";
import { useEffect, useState } from "react"
import unescoSites from "../data/unesco"


export default function PlaceDetail() {
  const { id } = useParams()

  const [visited, setVisited] = useState(false);
  const [bucket, setBucket] = useState(false);
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(true);

  console.log("loadingProgress:", loadingProgress);

  useEffect(function fetchProgress() {
    async function load() {
      try {
        console.log("Fetching progress for:", id);    // Debug log to verify ID is correct

        const response = await api.get(`/${id}`);
        const data = response.data;

        console.log("Progress fetched:", data);// Debug log to verify data structure
        if (data) {
          setVisited(data.visited || false);
          setBucket(data.bucket || false);
          setRating(data.rating || null);
          setNotes(data.notes || "");
          setVisitDate(
            data.visitDate ? data.visitDate.split("T")[0] : ""
          );
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      } finally {
        console.log("Setting loadingProgress to false");
        setLoadingProgress(false);
      }
    }

    load();
  }, [id]);


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
      <div className="w-full h-[40vh] sm:h-[50vh] bg-linear-to-br from-[#1B4436] to-[#2C5E4F] relative shadow-lg">
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
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${categoryColors[site.category] || "bg-gray-100 text-gray-800"
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

          {/* Your Journey Section */}
          <div className="mt-10 pt-10 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Your Journey</h3>

            {loadingProgress ? (
              <p className="text-gray-400 text-sm">Loading progress...</p>
            ) : (
              <div className="space-y-6">
                {/* Checkboxes Row */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visited}
                      onChange={(e) => setVisited(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1B4436] focus:ring-[#1B4436] cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Mark as Visited</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bucket}
                      onChange={(e) => setBucket(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1B4436] focus:ring-[#1B4436] cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Add to Bucket List</span>
                  </label>
                </div>

                {/* Rating & Date Row */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">Rating</label>
                    <select
                      value={rating || ""}
                      onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436] min-w-[120px]"
                    >
                      <option value="">No rating</option>
                      <option value="1">1 — Poor</option>
                      <option value="2">2 — Fair</option>
                      <option value="3">3 — Good</option>
                      <option value="4">4 — Great</option>
                      <option value="5">5 — Amazing</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">Visit Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <span className="text-xs text-gray-400">{notes.length}/500</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Share your thoughts about this place..."
                    className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
