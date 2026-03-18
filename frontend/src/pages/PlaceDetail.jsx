import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getCategoryBadge } from "../constants/categories"
import useSite from "../hooks/useSite"
import useSiteProgress from "../hooks/useSiteProgress"
import ProgressSection from "../components/ProgressSection"


export default function PlaceDetail() {
  const { slug } = useParams()
  const { user, requireAuth } = useAuth()
  const { site, loading: loadingSite, error: siteError } = useSite(slug);
  const progress = useSiteProgress(slug);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function handleStatusChange(newStatus) {
    // Auth-gate: prompt login when user tries to mark visited/bucket
    const reason = newStatus === "visited" ? "visited" : "bucket";
    const isAuthed = requireAuth(reason, function () {
      // This runs after successful auth
      applyStatusChange(newStatus);
    });

    if (isAuthed) {
      applyStatusChange(newStatus);
    }
  }

  function applyStatusChange(newStatus) {
    const next = progress.status === newStatus ? "none" : newStatus;
    if (next === "bucket" && progress.status === "visited" && (progress.rating || progress.visitDate || progress.notes.trim())) {
      setShowConfirmModal(true);
    } else {
      progress.setStatus(next);
    }
  }

  function handleConfirmSwitch() {
    progress.setStatus("bucket");
    progress.setRating(null);
    progress.setVisitDate("");
    progress.setNotes("");
    setShowConfirmModal(false);
  }

  function handleSave() {
    const isAuthed = requireAuth("save", function () {
      progress.save();
    });

    if (isAuthed) {
      progress.save();
    }
  }

  if (loadingSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#1B4436]/20 border-t-[#1B4436] rounded-full animate-spin" />
        <span className="mt-4 text-gray-500 text-sm">Loading site...</span>
      </div>
    )
  }

  if (siteError || !site) {
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
                className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${getCategoryBadge(site.category)}`}
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

          {/* Your Journey Section */}
          <ProgressSection
            status={progress.status}
            onStatusChange={handleStatusChange}
            rating={progress.rating}
            notes={progress.notes}
            visitDate={progress.visitDate}
            setRating={progress.setRating}
            setNotes={progress.setNotes}
            setVisitDate={progress.setVisitDate}
            loadingProgress={progress.loading}
            onSave={handleSave}
            isSaving={progress.isSaving}
            saveState={progress.saveState}
            isDirty={progress.isDirty}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Remove visit details?</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Switching to Bucket List will remove your visit details. Continue?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
