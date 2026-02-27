import { useParams, Link } from "react-router-dom"
import api from "../services/api";
import { useEffect, useState } from "react"
import unescoSites from "../data/unesco"
import ProgressSection from "../components/ProgressSection"


export default function PlaceDetail() {
  const { id } = useParams()

  const [status, setStatus] = useState("none");
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [initialData, setInitialData] = useState(null);

  

  console.log("loadingProgress:", loadingProgress);

  useEffect(function fetchProgress() {
    async function load() {
      try {
        console.log("Fetching progress for:", id);    // Debug log to verify ID is correct

        const response = await api.get(`/${id}`);
        const data = response.data;

        console.log("Progress fetched:", data);// Debug log to verify data structure
        if (data) {
          const snapshot = {
            status: data.status || "none",
            rating: data.rating || null,
            notes: data.notes || "",
            visitDate: data.visitDate ? data.visitDate.split("T")[0] : "",
          };
          setStatus(snapshot.status);
          setRating(snapshot.rating);
          setNotes(snapshot.notes);
          setVisitDate(snapshot.visitDate);
          setInitialData(snapshot);
        } else {
          setInitialData({ status: "none", rating: null, notes: "", visitDate: "" });
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
        setInitialData({ status: "none", rating: null, notes: "", visitDate: "" });
      } finally {
        console.log("Setting loadingProgress to false");
        setLoadingProgress(false);
      }
    }

    load();
  }, [id]);

  function handleStatusChange(newStatus) {
    const next = status === newStatus ? "none" : newStatus;
    if (next === "bucket" && status === "visited" && (rating || visitDate || notes.trim())) {
      setShowConfirmModal(true);
    } else {
      setStatus(next);
    }
  }

  function handleConfirmSwitch() {
    setStatus("bucket");
    setRating(null);
    setVisitDate("");
    setNotes("");
    setShowConfirmModal(false);
  }

  async function handleSave() {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setSaveState("saving");

    try {
      await api.post("/", {
        placeId: id,
        status,
        rating,
        notes,
        visitDate,
      });

      setInitialData({ status, rating, notes, visitDate });
      setSaveState("success");
      setTimeout(function () {
        setSaveState("idle");
      }, 2000);
    } catch (error) {
      console.error("Failed to save progress", error);
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }


  const isDirty =
    initialData !== null &&
    (
      status !== initialData.status ||
      rating !== initialData.rating ||
      notes !== initialData.notes ||
      visitDate !== initialData.visitDate
    );

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

          {/* Your Journey Section */}
          <ProgressSection
            status={status}
            onStatusChange={handleStatusChange}
            rating={rating}
            notes={notes}
            visitDate={visitDate}
            setRating={setRating}
            setNotes={setNotes}
            setVisitDate={setVisitDate}
            loadingProgress={loadingProgress}
            onSave={handleSave}
            isSaving={isSaving}
            saveState={saveState}
            isDirty={isDirty}
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
