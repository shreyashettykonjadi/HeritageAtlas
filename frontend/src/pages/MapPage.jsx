import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import unescoSites from "../data/unesco"
import MapModeToggle from "../components/MapModeToggle"
import SidePanel from "../components/SidePanel"

export default function MapPage() {

  const [mapMode, setMapMode] = useState("categories")
  const [selectedSite, setSelectedSite] = useState(null)
  const mapRef = useRef(null)
  const markersRef = useRef(null)

  useEffect(function () {
  const map = L.map("map", {
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true,
  }).setView([20, 0], 2)

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap & CARTO",
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

  useEffect(function () {   // Update markers whenever mapMode changes to different color coding
    if (!markersRef.current) return
    markersRef.current.clearLayers()

    unescoSites.forEach(function (site) {
      var color = null
      if (mapMode === "categories") {
        if (site.category === "Cultural") color = "#A16207"
        if (site.category === "Natural") color = "#166534"
        if (site.category === "Mixed") color = "#1E3A8A"
      }

      if (mapMode === "journey") {
        if (site.visited) color = "#5ac972"
        else if (site.bucket) color = "#9333EA"
        else return
      }

      L.circleMarker([site.lat, site.lng], {
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
  }, [mapMode])

  function setMapInteractionState(map, isEnabled) {
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

  function setMapInteractionState(map, isEnabled) {
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
    <div className="h-full w-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Header Controls */}
      <div className="flex-none flex items-center justify-between mb-4">
        <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />
      </div>

      {/* Map Card */}
      <div className="flex-1 w-full min-h-0 relative rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(27,68,54,0.25)] border-4 border-[#FDF6E3]/60 ring-1 ring-[#1B4436]/5">
        <div id="map" className="h-full w-full bg-[#E5E0D8]"></div>
      </div>

      {/* Overlay */}
      {selectedSite && (
        <div
          className="fixed inset-0 bg-[#1B4436]/20 backdrop-blur-[2px] z-[900] transition-opacity duration-300"
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
