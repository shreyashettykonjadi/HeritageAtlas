import { useState } from "react";
import ImageModal from "./ImageModal";

const FALLBACK_IMAGE_SRC = "/fallback.jpg";

function handleImageError(event) {
    const target = event.currentTarget;

    if (target.dataset.fallbackApplied === "true") {
        return;
    }

    target.dataset.fallbackApplied = "true";
    target.src = FALLBACK_IMAGE_SRC;
}

export default function ImageGallery({ mainImage, images }) {
    // Merge images so mainImage is always first, keeping unique values
    const allImages = Array.from(new Set([mainImage, ...(images || [])].filter(Boolean)));

    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    function openModal(index) {
        setCurrentIndex(index);
        setModalOpen(true);
    }

    function handleNavigate(direction) {
        if (direction === "prev") {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
        } else {
            setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
        }
    }

    if (allImages.length === 0) return null;

    // Single image fallback: Full hero only
    if (allImages.length === 1) {
        return (
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden cursor-pointer group">
                <img
                    src={allImages[0]}
                    alt="Site view main"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onClick={() => openModal(0)}
                    onError={handleImageError}
                />
                {modalOpen && (
                    <ImageModal
                        images={allImages}
                        currentIndex={currentIndex}
                        onClose={() => setModalOpen(false)}
                        onNavigate={handleNavigate}
                    />
                )}
            </div>
        );
    }

    // Multiple images: Hero + Grid Layout (Airbnb style)
    const heroImage = allImages[0];
    const gridImages = allImages.slice(1, 5); // Take max 4 images for the grid
    const remainingCount = Math.max(0, allImages.length - 5);

    return (
        <div className="w-full h-64 sm:h-80 lg:h-96 grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden cursor-pointer group/container bg-gray-100">

            {/* Left Box (Hero) */}
            <div className="relative h-full overflow-hidden group/item" onClick={() => openModal(0)}>
                <img
                    src={heroImage}
                    alt="Hero view"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105"
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover/container:opacity-100 opacity-0 group-hover/item:opacity-0" />
            </div>

            {/* Right Box (Grid) */}
            <div className={`hidden md:grid gap-2 h-full ${gridImages.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${gridImages.length > 2 ? "grid-rows-2" : "grid-rows-1"}`}>
                {gridImages.map((img, idx) => {
                    const absoluteIndex = idx + 1;
                    const isLast = idx === gridImages.length - 1;
                    const displayOverlay = isLast && remainingCount > 0;

                    return (
                        <div key={idx} className="relative h-full overflow-hidden group/item" onClick={() => openModal(absoluteIndex)}>
                            <img
                                src={img}
                                alt={`Gallery view ${absoluteIndex}`}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105"
                                onError={handleImageError}
                            />

                            {/* Dim inactive grid items on hover */}
                            <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover/container:opacity-100 opacity-0 group-hover/item:opacity-0" />

                            {/* Show "+X more" overlay on the last mapped image if remaining images exist */}
                            {displayOverlay && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-colors duration-300 hover:bg-black/50">
                                    <span className="text-white text-lg font-semibold tracking-wide shadow-sm">
                                        +{remainingCount} more
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {modalOpen && (
                <ImageModal
                    images={allImages}
                    currentIndex={currentIndex}
                    onClose={() => setModalOpen(false)}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
}
