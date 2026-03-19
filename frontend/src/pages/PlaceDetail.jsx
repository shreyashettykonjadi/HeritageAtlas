import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getCategoryBadge } from "../constants/categories"
import useSite from "../hooks/useSite"
import useSiteProgress from "../hooks/useSiteProgress"
import ProgressSection from "../components/ProgressSection"
import ImageGallery from "../components/ImageGallery"


export default function PlaceDetail() {
  const { slug } = useParams()
  const { user, requireAuth } = useAuth()
  const { site, loading: loadingSite, error: siteError } = useSite(slug);
  const progress = useSiteProgress(slug);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fallbackText = `${site?.name} is a UNESCO World Heritage site in ${site?.country} known for its ${site?.category?.toLowerCase()} significance.`;
  const cleanDescription = site?.shortDescription ||
    (site?.description ? (site.description.length > 350 ? site.description.substring(0, 350).replace(/\s+\S*$/, "") + "..." : site.description) : null) ||
    fallbackText;

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
      {/* Header Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-6 w-full">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Map
        </Link>
        <div className="text-gray-500 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          {site.country}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-8">
          {site.name}
        </h1>

        <ImageGallery mainImage={site.mainImage} images={site.images} />
      </div>

      {/* Content Container */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 lg:px-12 relative z-10 pb-16">

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
            <div className="max-w-2xl px-1">
              <p className="text-lg text-gray-700 font-normal leading-[1.8] tracking-wide mb-5">
                {cleanDescription}
              </p>

              <a
                href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(site.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                title="Search on Wikipedia"
              >
                Learn more on Wikipedia
                <svg className="ml-1.5 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
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
