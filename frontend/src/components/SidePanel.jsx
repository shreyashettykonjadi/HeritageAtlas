import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SidePanel({ site, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(function animateEntrance() {
    if (site) {
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [site])

  function handleClose() {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  function handleViewDetails() {
    setIsVisible(false)
    setTimeout(function () {
      onClose()
      navigate(`/place/${site.id}`)
    }, 300)
  }

  if (!site) return null


  const categoryColors = {
    Cultural: "bg-amber-50 text-amber-900 border border-amber-200",
    Natural: "bg-emerald-50 text-emerald-900 border border-emerald-200",
    Mixed: "bg-indigo-50 text-indigo-900 border border-indigo-200",
  }

  const categoryColor = categoryColors[site.category] || "bg-gray-50 text-gray-900 border-gray-200"

  return (
    <>
      {/* Backdrop for mobile (optional relative to design, but good for focus) */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-999 transition-opacity duration-300 sm:hidden
          ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={handleClose}
      />

      <aside
        className={`
          fixed z-1000 bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          w-full bottom-0 left-0 rounded-t-3xl border-t border-gray-100
          sm:top-4 sm:right-4 sm:left-auto sm:bottom-4
          sm:h-[calc(100vh-2rem)] sm:w-100 
          sm:rounded-2xl sm:border
          overflow-hidden
          ${isVisible ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-[110%]"}
        `}
        aria-labelledby="panel-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full relative">
          
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/80 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors backdrop-blur-sm border border-gray-200/50 shadow-sm"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Hero / Cover (Use map placeholder or gradient if no image) */}
          <div className="h-32 bg-linear-to-br from-[#1B4436] to-[#2C5E4F] relative shrink-0">
            <div className="absolute bottom-4 left-6 text-white/90 text-xs font-medium tracking-widest uppercase opacity-80">
              Unesco World Heritage
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 pt-6">
            <div className="space-y-1 mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase ${categoryColor}`}>
                  {site.category}
                </span>
                <span className="text-sm text-gray-500 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {site.country}
                </span>
              </div>
              
              <h2 id="panel-title" className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {site.name}
              </h2>
            </div>

            <div className="prose prose-sm prose-p:text-gray-600 prose-headings:text-gray-800">
              <p className="leading-relaxed">
                Explore this magnificent {site.category.toLowerCase()} UNESCO World Heritage site located in {site.country}. 
                Experience the rich history and breathtaking cultural significance that makes {site.name} unique.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleViewDetails}
              className="w-full flex justify-center items-center px-5 py-3.5 
                text-sm font-semibold rounded-xl text-white bg-[#1B4436] hover:bg-[#153429] 
                shadow-lg shadow-emerald-900/10 transition-all transform active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4436]"
            >
              View Full Details
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}
