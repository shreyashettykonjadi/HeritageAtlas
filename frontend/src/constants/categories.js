/**
 * Atlas-style category and status representation system.
 *
 * Visual Encoding Map:
 *   - SHAPE encodes Category (Diamond = Cultural, Circle = Natural, Square = Mixed)
 *   - COLOR encodes Status (Base = No Status, Blue = Visited, Pink = Bucket List)
 *   - INDICATOR encodes Danger (Red inner dot)
 */

export const CATEGORY_COLORS = {
    Cultural: {
        badge: "bg-yellow-50 text-yellow-800 border border-yellow-300",
        marker: "#C9A227",
        label: "Cultural",
        shape: "diamond",
    },
    Natural: {
        badge: "bg-emerald-50 text-emerald-800 border border-emerald-200",
        marker: "#2E7D32",
        label: "Natural",
        shape: "circle",
    },
    Mixed: {
        badge: "bg-orange-50 text-orange-800 border border-orange-200",
        marker: "#F57C00",
        label: "Mixed",
        shape: "square",
    },
};

export const JOURNEY_COLORS = {
    visited: { marker: "#2563EB", label: "Visited" },      // Strong Blue
    bucket: { marker: "#E11D48", label: "Bucket List" },  // Distinct Pink
};

export const DANGER_COLOR = "#DC2626";

export const DEFAULT_BADGE = "bg-gray-100 text-gray-800 border border-gray-200";

export function getCategoryBadge(category) {
    return CATEGORY_COLORS[category]?.badge || DEFAULT_BADGE;
}

export function getCategoryShape(category) {
    return CATEGORY_COLORS[category]?.shape || "circle";
}
