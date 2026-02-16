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
    <div className="h-screen w-full">
      <div id="map" className="h-full w-full"></div>
    </div>
  )
}
