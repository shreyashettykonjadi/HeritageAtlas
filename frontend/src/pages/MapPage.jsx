import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export default function MapPage() {

  useEffect(function () { // Initialize the map when the component mounts
    const map = L.map("map").setView([20, 0], 2)

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map)

    return function () {   // Cleanup function to remove the map instance when the component unmounts
      map.remove()
    }
  }, [])

  return (
  <div className="px-6 pb-10">
    <div className="max-w-7xl mx-auto mt-6">
      <div className="h-[75vh] rounded-2xl overflow-hidden shadow-lg">
        <div id="map" className="h-full w-full"></div>
      </div>
    </div>
  </div>
)
}
