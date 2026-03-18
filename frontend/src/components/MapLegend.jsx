import { buildMarkerSVG } from "../utils/markerFactory";

function MarkerSample({ category, status, danger }) {
    var svg = buildMarkerSVG(category, { status: status || null, danger: danger || false });
    return (
        <span
            className="inline-flex w-[16px] h-[16px] shrink-0 items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

function LegendRow({ label, children }) {
    return (
        <div className="flex items-center gap-2.5">
            {children}
            <span className="text-[11px] font-medium text-gray-700">{label}</span>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4 first:mt-0">
            {children}
        </p>
    );
}

export default function MapLegend({ mapMode, showDanger }) {
    return (
        <div className="absolute bottom-5 left-5 z-[500] pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/80 px-4 py-3.5 min-w-[170px]">

                {/* Categories — always shown */}
                <SectionTitle>Category</SectionTitle>
                <div className="flex flex-col gap-2">
                    <LegendRow label="Cultural (Diamond)">
                        <MarkerSample category="Cultural" />
                    </LegendRow>
                    <LegendRow label="Natural (Circle)">
                        <MarkerSample category="Natural" />
                    </LegendRow>
                    <LegendRow label="Mixed (Square)">
                        <MarkerSample category="Mixed" />
                    </LegendRow>
                </div>

                {/* Status — journey mode only */}
                {mapMode === "journey" && (
                    <>
                        <SectionTitle>Status (Color overrides)</SectionTitle>
                        <div className="flex flex-col gap-2">
                            <LegendRow label="Visited (Blue)">
                                <MarkerSample category="Natural" status="visited" />
                            </LegendRow>
                            <LegendRow label="Bucket List (Pink)">
                                <MarkerSample category="Natural" status="bucket" />
                            </LegendRow>
                        </div>
                    </>
                )}

                {/* Danger — when toggle is on */}
                {showDanger && (
                    <>
                        <SectionTitle>In Danger</SectionTitle>
                        <div className="flex flex-col gap-2">
                            <LegendRow label="Red Indicator">
                                <MarkerSample category="Cultural" danger />
                            </LegendRow>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
