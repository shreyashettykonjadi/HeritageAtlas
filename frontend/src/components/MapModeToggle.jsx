export default function MapModeToggle({ mapMode, setMapMode }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-lg overflow-hidden border border-[#DDAD8A]">
        <button
          onClick={function () { setMapMode("categories") }}
          className={
            "px-4 py-2 text-sm font-medium transition-colors " +
            (mapMode === "categories"
              ? "bg-[#1B4436] text-white"
              : "bg-[#F9E4C5] text-[#1B4436]")
          }
        >
          Categories
        </button>

        <button
          onClick={function () { setMapMode("journey") }}
          className={
            "px-4 py-2 text-sm font-medium transition-colors " +
            (mapMode === "journey"
              ? "bg-[#1B4436] text-white"
              : "bg-[#F9E4C5] text-[#1B4436]")
          }
        >
          My Journey
        </button>
      </div>
    </div>
  )
}
