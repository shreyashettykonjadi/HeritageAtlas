import { Link } from "react-router-dom";
import { getCategoryBadge } from "../constants/categories";
import { isValidSlug, toSafeSlugSegment } from "../utils/slug";

export default function JourneyCard({ record, onEdit, onDelete }) {
  const { site, rating, visitDate } = record;
  const image = site.mainImage || (site.images && site.images[0]) || null;
  const safeSlugSegment = toSafeSlugSegment(site?.slug);
  const placePath = safeSlugSegment ? `/place/${safeSlugSegment}` : "/";

  return (
    <Link
      to={placePath}
      className="group relative bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      {/* Actions Container - Hover reveals */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
        <button
          onClick={function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isValidSlug(site?.slug)) {
              return;
            }

            onEdit(site.slug.trim());
          }}
          className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg backdrop-blur-[2px] shadow-sm transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isValidSlug(site?.slug)) {
              return;
            }

            onDelete(site.slug.trim());
          }}
          className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-lg backdrop-blur-[2px] shadow-sm transition-colors"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

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
          className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${getCategoryBadge(site.category)}`}
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
