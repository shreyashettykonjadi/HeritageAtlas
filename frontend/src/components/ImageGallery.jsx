import { useState } from "react";
import ImageModal from "./ImageModal";
import { getDisplayImageUrl, getImageAlt } from "../utils/image";

const FALLBACK_IMAGE_SRC = "/fallback.jpg";
const INITIAL_LOAD = 4;

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

function SitePlaceholder() {
  return (
    <div className="w-full h-[420px] rounded-xl overflow-hidden bg-linear-to-br from-[#1B4436]/12 via-white to-[#E8F0EB] flex items-center justify-center border border-[#1B4436]/10">
      <div className="text-center px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#1B4436]/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v8.25M3 16.5A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5M3 16.5l4.5-4.5a2.25 2.25 0 013.182 0L15 16.5m0 0l2.157-2.157a2.25 2.25 0 013.182 0L21 16.5m-6-9.75h.008v.008H15V6.75z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#1B4436]/70">Image unavailable</p>
        <p className="text-xs text-[#1B4436]/45 mt-1">UNESCO hero image will appear here when available</p>
      </div>
    </div>
  );
}

function normalizeImageEntry(entry) {
  const url = getDisplayImageUrl(entry);
  if (!url) {
    return null;
  }

  return {
    url,
    alt: getImageAlt(entry, "Heritage site image"),
  };
}

export default function ImageGallery({ site, mainImage, images, isLoading = false }) {
  const heroImage = normalizeImageEntry(site?.mainImage || mainImage);
  const galleryEntries = (site?.galleryImages || images || [])
    .map((entry) => {
      const url = getDisplayImageUrl(entry, { preferThumbnail: true });
      if (!url) {
        return null;
      }

      return {
        url,
        alt: getImageAlt(entry, "Heritage site image"),
      };
    })
    .filter(Boolean)
    .filter((entry) => entry.url !== heroImage?.url);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

  const modalImages = [
    ...(heroImage ? [heroImage] : []),
    ...galleryEntries,
  ];

  function openModal(index) {
    setCurrentIndex(index);
    setModalOpen(true);
  }

  function handleNavigate(direction) {
    if (direction === "prev") {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : modalImages.length - 1));
    } else {
      setCurrentIndex((prev) => (prev < modalImages.length - 1 ? prev + 1 : 0));
    }
  }

  function handleImageLoad(index) {
    setLoadedImages((prev) => new Set([...prev, index]));
  }

  if (!heroImage && galleryEntries.length === 0 && isLoading) {
    return (
      <div className="w-full h-[420px] rounded-xl overflow-hidden">
        <ImageSkeleton />
      </div>
    );
  }

  if (!heroImage && galleryEntries.length === 0) {
    return <SitePlaceholder />;
  }

  const galleryImages = galleryEntries.slice(0, visibleCount);
  const unshownCount = galleryEntries.length - visibleCount;

  return (
    <div className="space-y-4">
      {heroImage ? (
        <div
          className="w-full h-[420px] cursor-pointer rounded-xl overflow-hidden group relative bg-gray-100"
          onClick={() => openModal(0)}
        >
          {!loadedImages.has(0) && <ImageSkeleton />}
          <img
            src={heroImage.url}
            alt={heroImage.alt}
            className="w-full h-full object-cover transition hover:scale-105"
            onError={handleImageError}
            onLoad={() => handleImageLoad(0)}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      ) : (
        <SitePlaceholder />
      )}

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {galleryImages.map((image, idx) => {
            const absoluteIndex = heroImage ? idx + 1 : idx;

            return (
              <div
                key={`${image.url}-${absoluteIndex}`}
                className="aspect-square overflow-hidden rounded-xl cursor-pointer group relative bg-gray-100"
                onClick={() => openModal(absoluteIndex)}
              >
                {!loadedImages.has(absoluteIndex) && <ImageSkeleton />}
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover transition hover:scale-105"
                  onError={handleImageError}
                  onLoad={() => handleImageLoad(absoluteIndex)}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      )}

      {unshownCount > 0 && (
        <button
          onClick={() => setVisibleCount((value) => value + 4)}
          className="w-full py-3.5 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors active:scale-[0.99]"
        >
          Load More ({unshownCount})
        </button>
      )}

      {modalOpen && (
        <ImageModal
          images={modalImages.map((image) => image.url)}
          currentIndex={currentIndex}
          onClose={() => setModalOpen(false)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
