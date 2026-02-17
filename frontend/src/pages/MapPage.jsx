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

  useEffect(function () {   // Initialize map on component mount
    const map = L.map("map").setView([20, 0], 2)
    mapRef.current = map

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    return function () {
      map.remove()
    }
  }, [])

  useEffect(function () {   // Disable map interactions when side panel is open
    if (!mapRef.current) return

    if (selectedSite) {
      mapRef.current.dragging.disable()
      mapRef.current.scrollWheelZoom.disable()
      mapRef.current.doubleClickZoom.disable()
    } else {
      mapRef.current.dragging.enable()
      mapRef.current.scrollWheelZoom.enable()
      mapRef.current.doubleClickZoom.enable()
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


  return (
    <div className="px-6 pb-10">
      <div className="max-w-7xl mx-auto mt-6">
        <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />
        <div className="h-[75vh] rounded-2xl overflow-hidden shadow-lg">
          <div id="map" className="h-full w-full"></div>
        </div>
      </div>
      {selectedSite && (
        <div
          className="fixed inset-0 bg-black/30 z-[900]"
          onClick={function () {
            setSelectedSite(null)
          }}
        />
      )}

      <SidePanel
        site={selectedSite}
        onClose={function () {
          setSelectedSite(null)
        }}
      />
    </div>
  )
}
