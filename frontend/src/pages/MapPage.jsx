import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import unescoSites from "../data/unesco"
import MapModeToggle from "../components/MapModeToggle"

export default function MapPage() {

  const [mapMode, setMapMode] = useState("categories")
  const markersRef = useRef(null)

  useEffect(function () {

    const map = L.map("map").setView([20, 0], 2)

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


  useEffect(function () {

    if (!markersRef.current) return

    markersRef.current.clearLayers()

    unescoSites.forEach(function (site) {

      var color = "#5B758C"

      if (mapMode === "categories") {
        if (site.category === "Cultural") color = "#8B5E3C"
        if (site.category === "Natural") color = "#2E7D32"
        if (site.category === "Mixed") color = "#6D4C41"
      }

      if (mapMode === "journey") {
        if (site.visited) color = "#1B4436"
        else color = "#B0BEC5"
      }

      L.circleMarker([site.lat, site.lng], {
        radius: 6,
        fillColor: color,
        color: "#ffffff",
        weight: 1,
        fillOpacity: 0.9,
      })
        .addTo(markersRef.current)
        .bindPopup(
          "<strong>" + site.name + "</strong><br/>" + site.country
        )

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
    </div>
  )
}
