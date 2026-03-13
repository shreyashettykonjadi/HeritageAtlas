import { useEffect, useState, useRef, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import api from "../services/api"
import useProgress from "../hooks/useProgress"
import MapModeToggle from "../components/MapModeToggle"
import SidePanel from "../components/SidePanel"

export default function MapPage() {

  const [mapMode, setMapMode] = useState("categories")
  const [selectedSite, setSelectedSite] = useState(null)
  const [sites, setSites] = useState([])
  const [loadingSites, setLoadingSites] = useState(false)
  const { data: progressData, loading: loadingProgress } = useProgress()
  const mapRef = useRef(null)   
  const markersRef = useRef(null)

  const progressMap = useMemo(function () {
    const map = {};
    progressData.forEach(function (record) {
      if (record.site && record.site.slug) {
        map[record.site.slug] = record.status;
      }
    });
    return map;
  }, [progressData]);

  useEffect(function fetchSites() {
    async function load() {
      setLoadingSites(true);
      try {
        const response = await api.get("/sites/map");
        setSites(response.data);
      } catch (error) {
        console.error("Failed to fetch sites", error);
      } finally {
        setLoadingSites(false);
      }
    }

    load();
  }, [])

  useEffect(function () {   // Initialize map on first load with custom settings to restrict panning/zooming to world and prevent tile wrapping/repetition
    // defined bounds for the world
    const southWest = L.latLng(-85, -180)
    const northEast = L.latLng(85, 180)
    const bounds = L.latLngBounds(southWest, northEast)

    const map = L.map("map", {
      minZoom: 2,
      maxZoom: 8,
      maxBounds: bounds,         // Restrict panning to world
      maxBoundsViscosity: 1.0,   // "Solid" elastic bounce-back
      worldCopyJump: false,      // Disable jumping to cached world copies
    })

    // Fit to world view initially
    map.fitBounds(bounds)

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap & CARTO",
        noWrap: true,            // Stop tiles from repeating horizontally
        bounds: bounds,          // Tell tiles not to load outside world
      }
    ).addTo(map)

    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    return function () {
      map.remove()
    }
  }, [])

  useEffect(function () {   // Enable/disable map interactions based on whether a site is selected
    if (!mapRef.current) return

    if (selectedSite) {
      setMapInteractionState(mapRef.current, false)
    } else {
      setMapInteractionState(mapRef.current, true)
    }
  }, [selectedSite])

  useEffect(function () {   // Update markers whenever mapMode changes to different color coding or filtering based on user progress
    if (!markersRef.current) return
    markersRef.current.clearLayers()

    sites.forEach(function (site) {
      var color = null
      if (mapMode === "categories") {
        if (site.category === "Cultural") color = "#A16207"
        if (site.category === "Natural") color = "#166534"
        if (site.category === "Mixed") color = "#1E3A8A"
      }

      if (mapMode === "journey") {
        const siteStatus = progressMap[site.slug];
        if (siteStatus === "visited") color = "#5ac972"
        else if (siteStatus === "bucket") color = "#9333EA"
        else return
      }

      L.circleMarker([site.location.coordinates[1], site.location.coordinates[0]], {
        radius: 6,
        fillColor: color,
        color: "#ffffff",
        weight: 1,
        fillOpacity: 0.9,
      })
        .addTo(markersRef.current)
        .on("click", function () {
          setSelectedSite(site)
        })
    })
  }, [mapMode, progressMap, sites])

  function setMapInteractionState(map, isEnabled) {   // Enable/disable all map interactions (called when opening/closing side panel)
    if (!map) return

    if (isEnabled) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
      map.boxZoom.enable()
      map.keyboard.enable()
      map.touchZoom.enable()
      map.zoomControl.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
      map.touchZoom.disable()
      map.zoomControl.disable()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Header Controls */}
      <div className="flex-none flex items-center justify-between mb-4">
        <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />
      </div>

      {/* Map Card */}
      <div className="flex-1 min-h-0 relative rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(27,68,54,0.3)] border-[6px] border-[#FDF6E3] ring-1 ring-[#1B4436]/10"
           style={{ background: "#CDD2D4" }}>
        <div id="map" className="absolute inset-0"></div>
        
        {/* Subtle inner texture/vignette overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(27,68,54,0.1)] rounded-2xl z-400" />
      </div>

      {/* Overlay */}
      {selectedSite && (
        <div
          className="fixed inset-0 bg-[#1B4436]/20 backdrop-blur-[2px] z-900 transition-opacity duration-300"
          onClick={() => setSelectedSite(null)}
        />
      )}

      <SidePanel
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </div>
  )
}
