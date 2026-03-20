import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function useProgress() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async function () {
    if (!user) {
      setData([]);
      setError(false);
      return;
    }

    try {
      const response = await api.get("/progress");
      setData(response.data);
      setError(false);
    } catch (err) {
      if (err?.response?.status === 401 || err?.isExpectedAuthError) {
        setData([]);
        setError(false);
        return;
      }

      console.error("Failed to fetch progress", err);
      setError(true);
    }
  }, [user]);

  useEffect(function () {
    setLoading(true);
    refresh().finally(function () {
      setLoading(false);
    });
  }, [refresh]);

  return { data, loading, error, refresh };
}
