import { useEffect, useState, useRef, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import api from "../services/api"
import useProgress from "../hooks/useProgress"
import { createMarkerIcon } from "../utils/markerFactory"
import MapModeToggle from "../components/MapModeToggle"
import MapLegend from "../components/MapLegend"
import SidePanel from "../components/SidePanel"

export default function MapPage() {

  var [mapMode, setMapMode] = useState("categories")
  var [showDanger, setShowDanger] = useState(false)
  var [selectedSite, setSelectedSite] = useState(null)
  var [sites, setSites] = useState([])
  var [loadingSites, setLoadingSites] = useState(false)
  var { data: progressData } = useProgress()
  var mapRef = useRef(null)
  var markersRef = useRef(null)

  var progressMap = useMemo(function () {
    var map = {};
    progressData.forEach(function (record) {
      if (record.site && record.site.slug) {
        map[record.site.slug] = record.status;
      }
    });
    return map;
  }, [progressData]);

  var dangerCount = useMemo(function () {
    return sites.filter(function (s) { return s.danger; }).length;
  }, [sites]);

  useEffect(function fetchSites() {
    async function load() {
      setLoadingSites(true);
      try {
        var response = await api.get("/sites/map");
        setSites(response.data);
      } catch (error) {
        console.error("Failed to fetch sites", error);
      } finally {
        setLoadingSites(false);
      }
    }
    load();
  }, [])

  useEffect(function initMap() {
    var southWest = L.latLng(-85, -180)
    var northEast = L.latLng(85, 180)
    var bounds = L.latLngBounds(southWest, northEast)

    var map = L.map("map", {
      minZoom: 2,
      maxZoom: 8,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
      zoomControl: false,
    })

    map.fitBounds(bounds)
    L.control.zoom({ position: "topright" }).addTo(map)

    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        noWrap: true,
        bounds: bounds,
        maxZoom: 19,
      }
    ).addTo(map)

    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    return function () { map.remove() }
  }, [])

  useEffect(function toggleInteractions() {
    if (!mapRef.current) return
    if (selectedSite) {
      setMapInteraction(mapRef.current, false)
    } else {
      setMapInteraction(mapRef.current, true)
    }
  }, [selectedSite])

  useEffect(function renderMarkers() {
    if (!markersRef.current) return
    markersRef.current.clearLayers()

    sites.forEach(function (site) {
      var status = null;

      if (mapMode === "journey") {
        var siteStatus = progressMap[site.slug];
        if (siteStatus === "visited") {
          status = "visited";
        } else if (siteStatus === "bucket") {
          status = "bucket";
        } else {
          return; // not in user's journey
        }
      }

      // Danger filter: when on, only show endangered sites
      if (showDanger && !site.danger) return;

      var icon = createMarkerIcon(site.category, {
        status: status,
        danger: showDanger && site.danger,
      });

      var coords = [site.location.coordinates[1], site.location.coordinates[0]];

      L.marker(coords, { icon: icon })
        .addTo(markersRef.current)
        .on("click", function () { setSelectedSite(site) })
    })
  }, [mapMode, progressMap, sites, showDanger])

  function setMapInteraction(map, enabled) {
    if (!map) return
    var methods = ["dragging", "scrollWheelZoom", "doubleClickZoom", "boxZoom", "keyboard", "touchZoom"];
    methods.forEach(function (m) {
      if (enabled) map[m].enable();
      else map[m].disable();
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

      <div className="flex-none flex items-center justify-between mb-4">
        <MapModeToggle
          mapMode={mapMode}
          setMapMode={setMapMode}
          showDanger={showDanger}
          setShowDanger={setShowDanger}
          dangerCount={dangerCount}
        />
        <span className="text-xs font-medium text-gray-400 tracking-wide">
          {sites.length > 0 ? sites.length + " sites" : ""}
        </span>
      </div>

      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
        <div id="map" className="absolute inset-0" />
        <MapLegend mapMode={mapMode} showDanger={showDanger} />
      </div>

      {selectedSite && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[900] transition-opacity duration-300"
          onClick={function () { setSelectedSite(null) }}
        />
      )}

      <SidePanel
        site={selectedSite}
        onClose={function () { setSelectedSite(null) }}
      />
    </div>
  )
}
