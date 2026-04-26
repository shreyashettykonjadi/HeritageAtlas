import { useEffect, useState } from "react";
import api from "../services/api";
import { toSafeSlugSegment } from "../utils/slug";

export default function useSite(slug) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(function () {
    const safeSlugSegment = toSafeSlugSegment(slug);
    if (!safeSlugSegment) {
      setSite(null);
      setError(true);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get(`/sites/${safeSlugSegment}`);
        setSite(response.data);
      } catch (err) {
        console.error("Failed to fetch site", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  return { site, loading, error };
}
