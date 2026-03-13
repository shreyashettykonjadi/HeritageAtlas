import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

export default function useProgress() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async function () {
    try {
      const response = await api.get("/progress");
      setData(response.data);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch progress", err);
      setError(true);
    }
  }, []);

  useEffect(function () {
    setLoading(true);
    refresh().finally(function () {
      setLoading(false);
    });
  }, [refresh]);

  return { data, loading, error, refresh };
}
