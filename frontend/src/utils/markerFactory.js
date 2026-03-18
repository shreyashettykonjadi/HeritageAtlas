import L from "leaflet";
import { CATEGORY_COLORS, JOURNEY_COLORS, DANGER_COLOR } from "../constants/categories";

/**
 * SVG shape paths. Designed for a 16x16 viewBox.
 * Using a slightly larger canvas so shapes don't clip with strokes.
 */
function getShapeMarkup(shape, fill, stroke, strokeWidth) {
    // Center is (8, 8)
    switch (shape) {
        case "diamond":
            return '<path d="M8 1 L15 8 L8 15 L1 8 Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"/>';
        case "square":
            return '<rect x="2" y="2" width="12" height="12" rx="1.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"/>';
        case "circle":
        default:
            return '<circle cx="8" cy="8" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"/>';
    }
}

/**
 * Build an SVG marker string.
 *
 * @param {string} category  - "Cultural" | "Natural" | "Mixed"
 * @param {object} opts
 * @param {string} opts.status  - "visited" | "bucket" | null
 * @param {boolean} opts.danger - red dot overlay
 */
export function buildMarkerSVG(category, opts) {
    var status = opts && opts.status || null;
    var danger = opts && opts.danger || false;

    var categoryDef = CATEGORY_COLORS[category];
    var shape = categoryDef ? categoryDef.shape : "circle";

    // If status is present, override category color with status color
    var color = categoryDef ? categoryDef.marker : "#6B7280";
    if (status && JOURNEY_COLORS[status]) {
        color = JOURNEY_COLORS[status].marker;
    }

    // Consistent white stroke for clarity
    var stroke = "#ffffff";
    var strokeWidth = 1.5;

    var shapeMarkup = getShapeMarkup(shape, color, stroke, strokeWidth);

    // Small red center dot for danger (offset slightly to top right to act as a badge, or center)
    // A clear dot in the center of the shape is usually best, but some shapes might look odd. 
    // Let's use a center dot.
    var dangerDot = "";
    if (danger) {
        dangerDot = '<circle cx="8" cy="8" r="2.5" fill="' + DANGER_COLOR + '" stroke="#fff" stroke-width="0.5"/>';
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' + shapeMarkup + dangerDot + '</svg>';
}

/**
 * Create a Leaflet DivIcon.
 */
export function createMarkerIcon(category, opts) {
    var svg = buildMarkerSVG(category, opts);

    return L.divIcon({
        html: svg,
        className: "heritage-svg-marker",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}
