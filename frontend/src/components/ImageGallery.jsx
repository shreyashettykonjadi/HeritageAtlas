import { useState } from "react";
import ImageModal from "./ImageModal";

const FALLBACK_IMAGE_SRC = "/fallback.jpg";
const INITIAL_LOAD = 4;

function optimizeWikiImage(url) {
    if (typeof url === "string" && url.includes("upload.wikimedia.org")) {
        return url.includes("?") ? url + "&width=800" : url + "?width=800";
    }
    return url;
}

function handleImageError(event) {
    const target = event.currentTarget;

    if (target.dataset.fallbackApplied === "true") {
        return;
    }

    target.dataset.fallbackApplied = "true";
    target.src = FALLBACK_IMAGE_SRC;
}

function ImageSkeleton() {
    return (
        <div className="w-full h-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl" />
    );
}

export default function ImageGallery({ mainImage, images, isLoading = false }) {
    // Merge images so mainImage is always first, keeping unique values. Also optimize Wikimedia sizes.
    const allImages = Array.from(new Set([mainImage, ...(images || [])].filter(Boolean))).map(optimizeWikiImage);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

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

    function handleImageLoad(index) {
        setLoadedImages((prev) => new Set([...prev, index]));
    }

    if (allImages.length === 0 && isLoading) {
        return (
            <div className="w-full h-[420px] rounded-xl overflow-hidden">
                <ImageSkeleton />
            </div>
        );
    }

    if (allImages.length === 0) return null;

    // Single image fallback: Full hero only
    if (allImages.length === 1) {
        return (
            <div className="w-full h-[420px] rounded-xl overflow-hidden cursor-pointer group bg-gray-100">
                {!loadedImages.has(0) && isLoading && <ImageSkeleton />}
                <img
                    src={allImages[0]}
                    alt="Site view main"
                    className="w-full h-full object-cover transition hover:scale-105"
                    onClick={() => openModal(0)}
                    onError={handleImageError}
                    onLoad={() => handleImageLoad(0)}
                    loading="eager"
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

    const heroImage = allImages[0];
    const galleryImages = allImages.slice(1, visibleCount + 1);
    const unshownCount = allImages.length - 1 - visibleCount;

    return (
        <div className="space-y-4">
            {/* HERO */}
            <div 
                className="w-full h-[420px] cursor-pointer rounded-xl overflow-hidden group relative bg-gray-100"
                onClick={() => openModal(0)}
            >
                {!loadedImages.has(0) && <ImageSkeleton />}
                <img
                    src={heroImage}
                    alt="Hero view"
                    className="w-full h-full object-cover transition hover:scale-105"
                    onError={handleImageError}
                    onLoad={() => handleImageLoad(0)}
                    loading="eager"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            {/* FLEXIBLE GRID */}
            {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => {
                        const absoluteIndex = idx + 1;

                        return (
                            <div
                                key={absoluteIndex}
                                className="aspect-square overflow-hidden rounded-xl cursor-pointer group relative bg-gray-100"
                                onClick={() => openModal(absoluteIndex)}
                            >
                                {!loadedImages.has(absoluteIndex) && <ImageSkeleton />}
                                <img
                                    src={img}
                                    alt={`Gallery view ${absoluteIndex}`}
                                    className="w-full h-full object-cover transition hover:scale-105"
                                    onError={handleImageError}
                                    onLoad={() => handleImageLoad(absoluteIndex)}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* LOAD MORE BUTTON */}
            {unshownCount > 0 && (
                <button 
                    onClick={() => setVisibleCount((v) => v + 4)}
                    className="w-full py-3.5 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors active:scale-[0.99]"
                >
                    Load More ({unshownCount})
                </button>
            )}

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
