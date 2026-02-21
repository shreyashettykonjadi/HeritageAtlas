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
    <div className="flex flex-col bg-[#FAFAF8]">
      {/* Hero Section */}
      <div className="w-full h-[35vh] sm:h-[45vh] bg-linear-to-br from-[#1B4436] via-[#234D3F] to-[#2C5E4F] relative">
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-14">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all duration-200 font-medium text-sm tracking-wide bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full hover:bg-white/20 border border-white/10"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Map
            </Link>
            <div className="text-white/70 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              {site.country}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              {site.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 lg:px-12 -mt-8 relative z-10 pb-16">
        
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] border border-gray-100/80 overflow-hidden">
          <div className="p-6 sm:p-10">

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span
                className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${categoryColors[site.category] || "bg-gray-100 text-gray-800"}`}
              >
                {site.category}
              </span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-500 text-sm font-medium">
                UNESCO since {site.year}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-5 text-gray-600">
              <p className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
                Explore the timeless beauty of {site.name}, a testament to our shared human history and natural wonder
                located in the heart of {site.country}.
              </p>
              <p className="text-base leading-relaxed">
                This {site.category.toLowerCase()} site is recognized by UNESCO for its outstanding universal value.
                {site.description ||
                  ` As one of the world's most significant sites, ${site.name} offers a unique glimpse into the past. Visitors can experience the remarkable architecture, landscapes, and cultural traditions that have been preserved for generations.`}
              </p>
            </div>
          </div>

          {/* Your Journey Section - Distinct visual separation */}
          <div className="bg-linear-to-b from-gray-50/80 to-gray-50 border-t border-gray-100 p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#1B4436]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1B4436]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Journey</h3>
            </div>

            {loadingProgress ? (
              <div className="flex items-center gap-3 py-8">
                <div className="w-5 h-5 border-2 border-[#1B4436]/20 border-t-[#1B4436] rounded-full animate-spin" />
                <span className="text-gray-500 text-sm">Loading your progress...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Status Toggles */}
                <div className="flex flex-wrap gap-4">
                  <label className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 ${visited ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                    <input
                      type="checkbox"
                      checked={visited}
                      onChange={(e) => setVisited(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${visited ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {visited && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-medium transition-colors ${visited ? 'text-emerald-800' : 'text-gray-700'}`}>Visited</span>
                  </label>

                  <label className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 ${bucket ? 'bg-violet-50 border-violet-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                    <input
                      type="checkbox"
                      checked={bucket}
                      onChange={(e) => setBucket(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${bucket ? 'bg-violet-500 border-violet-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {bucket && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-medium transition-colors ${bucket ? 'text-violet-800' : 'text-gray-700'}`}>Bucket List</span>
                  </label>
                </div>

                {/* Rating & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Your Rating</label>
                    <select
                      value={rating || ""}
                      onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium transition-all duration-200 focus:outline-none focus:border-[#1B4436] focus:ring-4 focus:ring-[#1B4436]/10 hover:border-gray-300 appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Not rated</option>
                      <option value="1">⭐ Poor</option>
                      <option value="2">⭐⭐ Fair</option>
                      <option value="3">⭐⭐⭐ Good</option>
                      <option value="4">⭐⭐⭐⭐ Great</option>
                      <option value="5">⭐⭐⭐⭐⭐ Amazing</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium transition-all duration-200 focus:outline-none focus:border-[#1B4436] focus:ring-4 focus:ring-[#1B4436]/10 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Personal Notes</label>
                    <span className={`text-xs font-medium transition-colors ${notes.length > 450 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {notes.length}/500
                    </span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Write about your experience, memories, or plans for this place..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 resize-none transition-all duration-200 focus:outline-none focus:border-[#1B4436] focus:ring-4 focus:ring-[#1B4436]/10 hover:border-gray-300 placeholder:text-gray-400"
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
