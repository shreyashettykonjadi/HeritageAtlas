import { useEffect } from "react";

const FALLBACK_IMAGE_SRC = "/fallback.jpg";

function handleImageError(event) {
    const target = event.currentTarget;

    if (target.dataset.fallbackApplied === "true") {
        return;
    }

    target.dataset.fallbackApplied = "true";
    target.src = FALLBACK_IMAGE_SRC;
}

export default function ImageModal({ images, currentIndex, onClose, onNavigate }) {
    // Navigation keybindings (ES6 native event listeners)
    useEffect(function () {
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onNavigate("prev");
            if (e.key === "ArrowRight") onNavigate("next");
        }
        window.addEventListener("keydown", handleKeyDown);
        return function () {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, onNavigate]);

    // Prevent scroll when modal is open
    useEffect(function () {
        document.body.style.overflow = "hidden";
        return function () {
            document.body.style.overflow = "auto";
        };
    }, []);

    if (!images || images.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 z-9999 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Header: Counter + Close Button */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 pointer-events-none z-50">
                <span className="text-white/60 text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
                    {currentIndex + 1} / {images.length}
                </span>
                <button
                    onClick={onClose}
                    className="p-2 text-white/50 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10 pointer-events-auto"
                    title="Close gallery (ESC)"
                >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Main Image Container */}
            <div className="flex items-center justify-center w-full h-full pointer-events-none">
                <img
                    src={images[currentIndex]}
                    alt={`Gallery view ${currentIndex + 1}`}
                    className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain select-none"
                    draggable="false"
                    onError={handleImageError}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Navigation Controls */}
            {images.length > 1 && (
                <>
                    {/* LEFT ARROW */}
                    <button
                        onClick={function (e) { 
                            e.stopPropagation(); 
                            onNavigate("prev"); 
                        }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all border border-transparent hover:border-white/20 backdrop-blur-md pointer-events-auto hover:scale-110 duration-200"
                        title="Previous image (← arrow)"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* RIGHT ARROW */}
                    <button
                        onClick={function (e) { 
                            e.stopPropagation(); 
                            onNavigate("next"); 
                        }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all border border-transparent hover:border-white/20 backdrop-blur-md pointer-events-auto hover:scale-110 duration-200"
                        title="Next image (→ arrow)"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Bottom: Keyboard hints */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-wider pointer-events-none">
                <span className="inline-block bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                    Use ← → arrows to navigate • ESC to close
                </span>
            </div>
        </div>
    );
}
