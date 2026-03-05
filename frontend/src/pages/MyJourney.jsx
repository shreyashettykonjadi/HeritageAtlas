import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import JourneyCard from "../components/JourneyCard";
import ConfirmModal from "../components/ui/ConfirmModal";

function SectionHeader({ title, count, icon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xl">{icon}</span>
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      <span className="ml-auto text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
        {count}
      </span>
    </div>
  );
}

export default function MyJourney() {
  const [visited, setVisited] = useState([]);
  const [bucket, setBucket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState(null);
  const navigate = useNavigate();

  async function fetchProgressData() {
    try {
      const response = await api.get("/progress");
      const data = response.data;

      setVisited(data.filter(function (r) { return r.status === "visited"; }));
      setBucket(data.filter(function (r) { return r.status === "bucket"; }));
    } catch (err) {
      console.error("Failed to fetch journey data", err);
      setError(true);
    }
  }

  useEffect(function () {
    setLoading(true);
    setError(false);
    fetchProgressData().finally(function () { setLoading(false); });
  }, []);

  function handleEdit(slug) {
    navigate(`/place/${slug}`);
  }

  function handleDeleteRequest(slug) {
    setDeleteSlug(slug);
  }

  async function handleDeleteConfirm() {
    if (!deleteSlug) return;

    try {
      await api.delete(`/progress/${deleteSlug}`);
      setDeleteSlug(null);
      await fetchProgressData();
    } catch (err) {
      console.error("Failed to delete progress", err);
      setDeleteSlug(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteSlug(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#1B4436]/20 border-t-[#1B4436] rounded-full animate-spin" />
        <span className="mt-4 text-gray-500 text-sm">Loading your journey...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-6 text-sm">We couldn't load your journey data. Please try again.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#1B4436] text-white rounded-xl font-medium hover:bg-[#153429] transition-colors"
        >
          Return to Map
        </Link>
      </div>
    );
  }

  const isEmpty = visited.length === 0 && bucket.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-full bg-[#1B4436]/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#1B4436]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Your journey awaits</h1>
        <p className="text-gray-500 mb-8 text-sm max-w-sm">
          Start exploring UNESCO World Heritage Sites on the map and mark places you've visited or want to visit.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#1B4436] text-white rounded-xl font-medium hover:bg-[#153429] transition-colors"
        >
          Explore the Map
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Journey</h1>
      <p className="text-gray-500 text-sm mb-10">
        {visited.length} visited · {bucket.length} on your list
      </p>

      {/* Visited Section */}
      {visited.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Visited" count={visited.length} icon="✓" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visited.map(function (record) {
              return (
                <JourneyCard
                  key={record._id}
                  record={record}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Bucket List Section */}
      {bucket.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Bucket List" count={bucket.length} icon="★" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bucket.map(function (record) {
              return (
                <JourneyCard
                  key={record._id}
                  record={record}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteSlug !== null}
        title="Remove from journey"
        message="This will remove the site and all associated progress data from your journey. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
