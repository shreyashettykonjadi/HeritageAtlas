import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const categoryColors = {
  Cultural: "bg-amber-50 text-amber-900 border-amber-200",
  Natural: "bg-emerald-50 text-emerald-900 border-emerald-200",
  Mixed: "bg-indigo-50 text-indigo-900 border-indigo-200",
};

function JourneyCard({ record }) {
  const { site, rating, visitDate } = record;
  const image = site.mainImage || (site.images && site.images[0]) || null;

  return (
    <Link
      to={`/place/${site.slug}`}
      className="group bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={site.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#1B4436]/10 to-[#1B4436]/5">
            <svg className="w-10 h-10 text-[#1B4436]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-sm ${categoryColors[site.category] || "bg-gray-100 text-gray-800"}`}
        >
          {site.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1B4436] transition-colors">
          {site.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{site.country}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          {rating && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}/5
            </span>
          )}
          {visitDate && (
            <span className="text-xs text-gray-400">
              {new Date(visitDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

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

  useEffect(function fetchProgress() {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get("/progress");
        const data = response.data;

        setVisited(data.filter(function (r) { return r.status === "visited"; }));
        setBucket(data.filter(function (r) { return r.status === "bucket"; }));
      } catch (err) {
        console.error("Failed to fetch journey data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
              return <JourneyCard key={record._id} record={record} />;
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
              return <JourneyCard key={record._id} record={record} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
