export default function MapModeToggle({ mapMode, setMapMode, showDanger, setShowDanger, dangerCount }) {
  return (
    <div className="flex items-center gap-3">
      {/* Categories / Journey toggle */}
      <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={function () { setMapMode("categories") }}
          className={
            "px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors " +
            (mapMode === "categories"
              ? "bg-[#1B4436] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700")
          }
        >
          Categories
        </button>

        <button
          onClick={function () { setMapMode("journey") }}
          className={
            "px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors " +
            (mapMode === "journey"
              ? "bg-[#1B4436] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700")
          }
        >
          My Journey
        </button>
      </div>

      {/* Danger toggle */}
      <button
        onClick={function () { setShowDanger(!showDanger) }}
        className={
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors " +
          (showDanger
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300")
        }
        title="Show World Heritage in Danger"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        In Danger
        {dangerCount > 0 && (
          <span className={
            "ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full " +
            (showDanger ? "bg-red-200 text-red-800" : "bg-gray-100 text-gray-500")
          }>
            {dangerCount}
          </span>
        )}
      </button>
    </div>
  )
}
