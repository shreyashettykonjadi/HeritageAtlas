import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getDisplayImageUrl, getImageAlt } from "../utils/image";

const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS = 8;
const MIN_SEARCH_CHARS = 1;
const MIN_EMPTY_STATE_CHARS = 2;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const requestRef = useRef(null);
  const isPlaceDetailPage = location.pathname.startsWith("/place/");

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (query.trim().length < MIN_SEARCH_CHARS) {
      setDebouncedQuery("");
      setResults([]);
      setLoading(false);
      setError("");
      setActiveIndex(-1);
      return undefined;
    }

    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      return undefined;
    }

    const controller = new AbortController();
    requestRef.current?.abort?.();
    requestRef.current = controller;

    let ignore = false;

    async function searchSites() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/sites/search", {
          params: {
            q: debouncedQuery,
            limit: MAX_RESULTS,
          },
          signal: controller.signal,
        });

        if (ignore) return;

        const nextResults = Array.isArray(response.data?.sites) ? response.data.sites : [];
        setResults(nextResults);
        setOpen(true);
        setActiveIndex(nextResults.length > 0 ? 0 : -1);
      } catch (err) {
        if (controller.signal.aborted || ignore) return;
        setResults([]);
        setOpen(true);
        setActiveIndex(-1);
        setError("Search failed");
      } finally {
        if (!ignore && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    searchSites();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  function openResult(site) {
    if (!site?.slug) {
      return;
    }

    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setActiveIndex(-1);
    navigate(`/place/${site.slug}`);
  }

  function handleKeyDown(event) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      if (results.length > 0) {
        setOpen(true);
      }
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (!open || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex >= 0 ? activeIndex : 0];
      if (selected) {
        openResult(selected);
      }
    }
  }

  const shouldRenderSearch = !isPlaceDetailPage;
  const showDropdown = open && (loading || results.length > 0 || error || debouncedQuery.length >= MIN_EMPTY_STATE_CHARS);
  const showEmptyState = !loading && !error && debouncedQuery.length >= MIN_EMPTY_STATE_CHARS && results.length === 0;

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-[#FBF3E4]/90 backdrop-blur-md border-b border-[#DDAD8A]/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 md:h-16 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#1B4436]">
            HeritageAtlas
          </Link>

          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-[#1B4436] hover:text-[#153429] px-3 py-2 rounded-lg hover:bg-[#1B4436]/5 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {shouldRenderSearch && (
          <div ref={containerRef} className="relative w-full md:max-w-xl lg:max-w-2xl">
            <div className="relative">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  if (query.trim() || results.length > 0) {
                    setOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search UNESCO sites..."
                className="w-full rounded-2xl border border-[#DDAD8A]/60 bg-white/85 px-4 py-3 pr-11 text-sm text-[#1B4436] shadow-sm outline-none transition focus:border-[#1B4436]/40 focus:ring-2 focus:ring-[#1B4436]/10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1B4436]/20 border-t-[#1B4436]" />
                ) : (
                  <svg className="h-4 w-4 text-[#1B4436]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.1-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
                  </svg>
                )}
              </div>
            </div>

            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-[#DDAD8A]/40 bg-white shadow-[0_18px_60px_-18px_rgba(0,0,0,0.24)] max-h-[60vh] overflow-y-auto">
                {error ? (
                  <div className="px-4 py-3 text-sm text-red-600">{error}</div>
                ) : loading ? (
                  <div className="px-4 py-4 text-sm text-gray-500">Searching...</div>
                ) : showEmptyState ? (
                  <div className="px-4 py-4 text-sm text-gray-500">No sites found</div>
                ) : (
                  results.map((site, index) => {
                    const thumbnail = getDisplayImageUrl(site?.mainImage);
                    const alt = getImageAlt(site?.mainImage, site?.name);
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={site._id || site.slug || `${site.name}-${index}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openResult(site)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? "bg-[#1B4436]/6" : "hover:bg-[#1B4436]/4"
                        }`}
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#1B4436]/5">
                          {thumbnail ? (
                            <img src={thumbnail} alt={alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                          ) : (
                            <div className="h-full w-full" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-[#1B4436]">{site.name}</div>
                          <div className="truncate text-xs text-gray-500">
                            {site.country || "Unknown country"}
                            {site.category ? ` · ${site.category}` : ""}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/my-journey"
                className="text-sm font-medium text-[#1B4436] hover:text-[#153429] px-3 py-2 rounded-lg hover:bg-[#1B4436]/5 transition-colors"
              >
                My Journey
              </Link>

              <div className="w-px h-5 bg-[#1B4436]/15" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#1B4436] hover:text-[#153429] px-3 py-2 rounded-lg hover:bg-[#1B4436]/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-[#1B4436] hover:bg-[#153429] px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
