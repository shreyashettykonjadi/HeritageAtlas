export default function ProgressSection({
  visited,
  bucket,
  rating,
  notes,
  visitDate,
  setVisited,
  setBucket,
  setRating,
  setNotes,
  setVisitDate,
  loadingProgress,
  onSave,
  isSaving,
  saveState,
}) {

  function getButtonLabel() {
    switch (saveState) {
      case "saving":
        return (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        );
      case "success":
        return "✓ Saved";
      case "error":
        return "Retry Save";
      default:
        return "Save Changes";
    }
  }
  return (
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

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${isSaving ? 'bg-[#1B4436]/60 cursor-not-allowed' : 'bg-[#1B4436] hover:bg-[#153429] active:scale-[0.98]'} ${saveState === 'success' ? 'bg-emerald-600 hover:bg-emerald-600' : ''} ${saveState === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {getButtonLabel()}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
