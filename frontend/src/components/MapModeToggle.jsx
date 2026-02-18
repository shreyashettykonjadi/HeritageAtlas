export default function MapModeToggle({ mapMode, setMapMode }) {
  return (
    <div className="inline-flex bg-[#F0DBC3] p-1 rounded-xl shadow-sm border border-[#DDAD8A]/30">
      <button
        onClick={() => setMapMode("categories")}
        className={`
          px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200
          ${
            mapMode === "categories"
              ? "bg-[#1B4436] text-[#F9E4C5] shadow-md"
              : "text-[#5B758C] hover:text-[#1B4436] hover:bg-[#DDAD8A]/10"
          }
        `}
      >
        Categories
      </button>

      <button
        onClick={() => setMapMode("journey")}
        className={`
          px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200
          ${
            mapMode === "journey"
              ? "bg-[#1B4436] text-[#F9E4C5] shadow-md"
              : "text-[#5B758C] hover:text-[#1B4436] hover:bg-[#DDAD8A]/10"
          }
        `}
      >
        My Journey
      </button>
    </div>
  )
}
