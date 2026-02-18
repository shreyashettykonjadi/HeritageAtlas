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
    const worldBounds = [
      [-85, -180],
      [85, 180],
    ]

    const map = L.map("map", {
      maxZoom: 8,
      minZoom: 2,
      worldCopyJump: false,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1.0,
    })

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        noWrap: true,
        bounds: worldBounds,
      }
    ).addTo(map)

    map.fitBounds(worldBounds)
    map.setMaxBounds(worldBounds)

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
