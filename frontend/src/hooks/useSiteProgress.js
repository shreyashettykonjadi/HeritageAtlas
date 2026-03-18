import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function useSiteProgress(slug) {
  const { user } = useAuth();
  const [status, setStatus] = useState("none");
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [initialData, setInitialData] = useState(null);

  useEffect(function () {
    if (!slug) return;

    // If not logged in, skip fetch and show empty state
    if (!user) {
      setInitialData({ status: "none", rating: null, notes: "", visitDate: "" });
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const response = await api.get(`/progress/${slug}`);
        const data = response.data;

        if (data) {
          const snapshot = {
            status: data.status || "none",
            rating: data.rating || null,
            notes: data.notes || "",
            visitDate: data.visitDate ? data.visitDate.split("T")[0] : "",
          };
          setStatus(snapshot.status);
          setRating(snapshot.rating);
          setNotes(snapshot.notes);
          setVisitDate(snapshot.visitDate);
          setInitialData(snapshot);
        } else {
          setInitialData({ status: "none", rating: null, notes: "", visitDate: "" });
        }
      } catch (err) {
        setInitialData({ status: "none", rating: null, notes: "", visitDate: "" });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, user]);

  const isDirty =
    initialData !== null &&
    (
      status !== initialData.status ||
      rating !== initialData.rating ||
      notes !== initialData.notes ||
      visitDate !== initialData.visitDate
    );

  async function save() {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setSaveState("saving");

    try {
      await api.post("/progress", {
        placeId: slug,
        status,
        rating,
        notes,
        visitDate,
      });

      setInitialData({ status, rating, notes, visitDate });
      setSaveState("success");
      setTimeout(function () {
        setSaveState("idle");
      }, 2000);
    } catch (err) {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    status,
    setStatus,
    rating,
    setRating,
    notes,
    setNotes,
    visitDate,
    setVisitDate,
    loading,
    isSaving,
    saveState,
    isDirty,
    save,
  };
}
