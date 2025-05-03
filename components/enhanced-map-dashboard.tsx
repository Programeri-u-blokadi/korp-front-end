"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Layers,
  MapPin,
  Users,
  Thermometer,
  Navigation,
  AlertCircle,
  Ambulance,
  Shield,
  Radio,
  Eye,
  EyeOff,
  PlusCircle,
  MessageSquare,
  Bell,
  Settings,
  Zap,
  Clock,
  Hexagon,
} from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { IncidentReportDialog } from "@/components/incident-report-dialog"
import { GeofenceCreator } from "@/components/geofence-creator"
import { CrowdDensityChart } from "@/components/crowd-density-chart"

// Mock data for demonstration
const securityPersonnel = [
  { id: 1, lat: 44.8125, lng: 20.4612, type: "security", name: "Guard A1", status: "active" },
  { id: 2, lat: 44.8145, lng: 20.4632, type: "security", name: "Guard B2", status: "active" },
  { id: 3, lat: 44.8165, lng: 20.4652, type: "security", name: "Guard C3", status: "break" },
  { id: 4, lat: 44.8185, lng: 20.4672, type: "security", name: "Guard D4", status: "active" },
  { id: 5, lat: 44.8115, lng: 20.4592, type: "security", name: "Guard E5", status: "active" },
  { id: 6, lat: 44.8135, lng: 20.4572, type: "security", name: "Guard F6", status: "active" },
]

const emergencyServices = [
  { id: 1, lat: 44.8135, lng: 20.4622, type: "ambulance", name: "Ambulance 1", status: "standby" },
  { id: 2, lat: 44.8155, lng: 20.4642, type: "ambulance", name: "Ambulance 2", status: "responding" },
  { id: 3, lat: 44.8175, lng: 20.4662, type: "medical", name: "Medical Tent 1", status: "active" },
]

const loraStations = [
  { id: 1, lat: 44.8115, lng: 20.4602, type: "lora", peopleCount: 45, battery: 87, signal: "good" },
  { id: 2, lat: 44.8135, lng: 20.4622, type: "lora", peopleCount: 23, battery: 92, signal: "excellent" },
  { id: 3, lat: 44.8155, lng: 20.4642, type: "lora", peopleCount: 67, battery: 64, signal: "good" },
  { id: 4, lat: 44.8175, lng: 20.4662, type: "lora", peopleCount: 12, battery: 78, signal: "fair" },
  { id: 5, lat: 44.8195, lng: 20.4682, type: "lora", peopleCount: 38, battery: 56, signal: "poor" },
  { id: 6, lat: 44.8105, lng: 20.4592, type: "lora", peopleCount: 51, battery: 82, signal: "good" },
  { id: 7, lat: 44.8125, lng: 20.4572, type: "lora", peopleCount: 29, battery: 91, signal: "excellent" },
]

// Incidents for demonstration
const incidents = [
  {
    id: 1,
    lat: 44.8145,
    lng: 20.4632,
    type: "medical",
    status: "active",
    description: "Person needs medical assistance",
  },
  {
    id: 2,
    lat: 44.8165,
    lng: 20.4652,
    type: "security",
    status: "resolved",
    description: "Unauthorized access attempt",
  },
  { id: 3, lat: 44.8185, lng: 20.4672, type: "crowd", status: "active", description: "Overcrowding at entrance" },
]

// Boundary coordinates for demonstration
const boundaryCoordinates = [
  [20.4582, 44.8105],
  [20.4702, 44.8105],
  [20.4702, 44.8205],
  [20.4582, 44.8205],
  [20.4582, 44.8105],
]

// Geofence areas
const geofences = [
  {
    id: 1,
    name: "Main Stage",
    coordinates: [
      [20.4602, 44.8135],
      [20.4642, 44.8135],
      [20.4642, 44.8165],
      [20.4602, 44.8165],
      [20.4602, 44.8135],
    ],
    color: "#FF5733",
    maxCapacity: 500,
    currentCount: 320,
  },
  {
    id: 2,
    name: "Food Court",
    coordinates: [
      [20.4652, 44.8145],
      [20.4682, 44.8145],
      [20.4682, 44.8175],
      [20.4652, 44.8175],
      [20.4652, 44.8145],
    ],
    color: "#33FF57",
    maxCapacity: 200,
    currentCount: 85,
  },
]

export function EnhancedMapDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const [showGeofenceCreator, setShowGeofenceCreator] = useState(false)
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [timeOfDay, setTimeOfDay] = useState("current")
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [notificationCount, setNotificationCount] = useState(3)
  const [layers, setLayers] = useState({
    boundaries: true,
    heatmap: true,
    vectors: true,
    security: true,
    emergency: true,
    lora: true,
    incidents: true,
    geofences: true,
  })

  // Initialize map
  useEffect(() => {
    if (map.current) return

    // In a real application, you would use your own Mapbox token
    mapboxgl.accessToken = "pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImV4YW1wbGV0b2tlbiJ9.example"

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [20.4612, 44.8125], // Belgrade coordinates for example
      zoom: 15,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
      initializeMapLayers()
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Change map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`)

    // Re-add layers after style change
    map.current.once("styledata", () => {
      initializeMapLayers()
    })
  }, [mapStyle, mapLoaded])

  // Initialize all map layers
  const initializeMapLayers = () => {
    if (!map.current) return

    // Add boundary layer
    if (!map.current.getSource("boundary")) {
      map.current.addSource("boundary", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [boundaryCoordinates],
          },
          properties: {},
        },
      })

      map.current.addLayer({
        id: "boundary-layer",
        type: "line",
        source: "boundary",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 3,
          "line-dasharray": [2, 1],
        },
      })

      map.current.addLayer({
        id: "boundary-fill",
        type: "fill",
        source: "boundary",
        layout: {},
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.1,
        },
      })
    }

    // Add geofence layers
    if (!map.current.getSource("geofences")) {
      map.current.addSource("geofences", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: geofences.map((geofence) => ({
            type: "Feature",
            properties: {
              id: geofence.id,
              name: geofence.name,
              color: geofence.color,
              maxCapacity: geofence.maxCapacity,
              currentCount: geofence.currentCount,
            },
            geometry: {
              type: "Polygon",
              coordinates: [geofence.coordinates],
            },
          })),
        },
      })

      map.current.addLayer({
        id: "geofences-fill",
        type: "fill",
        source: "geofences",
        layout: {},
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.3,
        },
      })

      map.current.addLayer({
        id: "geofences-line",
        type: "line",
        source: "geofences",
        layout: {},
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
        },
      })

      map.current.addLayer({
        id: "geofences-label",
        type: "symbol",
        source: "geofences",
        layout: {
          "text-field": [
            "format",
            ["get", "name"],
            { "font-scale": 1 },
            "\n",
            {},
            ["get", "currentCount"],
            { "font-scale": 0.8 },
            " / ",
            {},
            ["get", "maxCapacity"],
            { "font-scale": 0.8 },
          ],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0],
          "text-anchor": "center",
          "text-size": 12,
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      })
    }

    // Add heatmap layer (mock data)
    if (!map.current.getSource("heatmap-data")) {
      const heatmapPoints = []
      for (let i = 0; i < 200; i++) {
        const lng = 20.4612 + (Math.random() - 0.5) * 0.02
        const lat = 44.8125 + (Math.random() - 0.5) * 0.02
        const magnitude = Math.random() * 10
        heatmapPoints.push({
          type: "Feature",
          properties: {
            magnitude,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        })
      }

      map.current.addSource("heatmap-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: heatmapPoints,
        },
      })

      map.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-data",
        paint: {
          "heatmap-weight": ["get", "magnitude"],
          "heatmap-intensity": 1,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 255, 0)",
            0.2,
            "rgba(0, 0, 255, 0.5)",
            0.4,
            "rgba(0, 255, 255, 0.5)",
            0.6,
            "rgba(0, 255, 0, 0.5)",
            0.8,
            "rgba(255, 255, 0, 0.5)",
            1,
            "rgba(255, 0, 0, 0.5)",
          ],
          "heatmap-radius": 20,
          "heatmap-opacity": 0.7,
        },
      })
    }

    // Add vector flow layer (mock data)
    if (!map.current.getSource("flow-data")) {
      const flowLines = []
      for (let i = 0; i < 30; i++) {
        const startLng = 20.4612 + (Math.random() - 0.5) * 0.02
        const startLat = 44.8125 + (Math.random() - 0.5) * 0.02
        const endLng = startLng + (Math.random() - 0.5) * 0.005
        const endLat = startLat + (Math.random() - 0.5) * 0.005

        flowLines.push({
          type: "Feature",
          properties: {
            magnitude: Math.random() * 10,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [startLng, startLat],
              [endLng, endLat],
            ],
          },
        })
      }

      map.current.addSource("flow-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: flowLines,
        },
      })

      map.current.addLayer({
        id: "flow-layer",
        type: "line",
        source: "flow-data",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#4264fb",
          "line-width": ["get", "magnitude"],
          "line-opacity": 0.8,
          "line-dasharray": [2, 1],
        },
      })

      // Add arrow symbols for flow direction
      map.current.addLayer({
        id: "flow-symbols",
        type: "symbol",
        source: "flow-data",
        layout: {
          "symbol-placement": "line",
          "text-field": "▶",
          "text-size": 12,
          "text-allow-overlap": true,
          "symbol-spacing": 50,
        },
        paint: {
          "text-color": "#4264fb",
          "text-halo-color": "rgba(255, 255, 255, 0.5)",
          "text-halo-width": 1,
        },
      })
    }

    // Add incidents layer
    if (!map.current.getSource("incidents")) {
      map.current.addSource("incidents", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: incidents.map((incident) => ({
            type: "Feature",
            properties: {
              id: incident.id,
              type: incident.type,
              status: incident.status,
              description: incident.description,
            },
            geometry: {
              type: "Point",
              coordinates: [incident.lng, incident.lat],
            },
          })),
        },
      })

      map.current.addLayer({
        id: "incidents-circle",
        type: "circle",
        source: "incidents",
        paint: {
          "circle-radius": 15,
          "circle-color": [
            "match",
            ["get", "type"],
            "medical",
            "#ff0000",
            "security",
            "#ff9900",
            "crowd",
            "#ffff00",
            "#ff00ff",
          ],
          "circle-opacity": ["match", ["get", "status"], "active", 0.7, "resolved", 0.3, 0.5],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })

      map.current.addLayer({
        id: "incidents-symbol",
        type: "symbol",
        source: "incidents",
        layout: {
          "text-field": ["match", ["get", "type"], "medical", "🚑", "security", "🛡️", "crowd", "👥", "❗"],
          "text-size": 12,
          "text-allow-overlap": true,
        },
      })
    }

    // Add markers for security, emergency, and LoRa stations
    addMarkers()
  }

  // Add markers for security, emergency, and LoRa stations
  const addMarkers = () => {
    if (!map.current) return

    // Remove existing markers
    document.querySelectorAll(".mapboxgl-marker").forEach((el) => el.remove())

    // Add security personnel markers
    securityPersonnel.forEach((person) => {
      const el = document.createElement("div")
      el.className = "marker security-marker"
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full ${
        person.status === "active" ? "bg-green-500" : "bg-yellow-500"
      } text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([person.lng, person.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h3 class="font-medium">${person.name}</h3>
            <p class="text-xs">Status: <span class="${
              person.status === "active" ? "text-green-600" : "text-yellow-600"
            } font-medium">${person.status}</span></p>
            <div class="flex gap-2 mt-2">
              <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded">Contact</button>
              <button class="px-2 py-1 text-xs bg-gray-200 rounded">Details</button>
            </div>
          `),
        )
        .addTo(map.current)
    })

    // Add emergency services markers
    emergencyServices.forEach((service) => {
      const el = document.createElement("div")
      el.className = "marker emergency-marker"

      const bgColor = service.status === "responding" ? "bg-orange-500" : "bg-red-500"
      const icon =
        service.type === "ambulance"
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-ambulance"><path d="m6 19-2-2V5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12l-2 2"/><path d="M9 17h6"/><path d="M9 11h6"/><path d="M6 7h12"/><path d="M6 17h12"/><path d="m5 11 3-3 2 2 5-5 3 3"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-first-aid-kit"><path d="M8 8h8v8H8z"/><path d="M7 18h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/><path d="M12 12v-4"/><path d="M10 12h4"/></svg>`

      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-white shadow-lg">
        ${icon}
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([service.lng, service.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h3 class="font-medium">${service.name}</h3>
            <p class="text-xs">Status: <span class="${
              service.status === "responding" ? "text-orange-600" : "text-red-600"
            } font-medium">${service.status}</span></p>
            <div class="flex gap-2 mt-2">
              <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded">Contact</button>
              <button class="px-2 py-1 text-xs bg-gray-200 rounded">Details</button>
            </div>
          `),
        )
        .addTo(map.current)
    })

    // Add LoRa station markers
    loraStations.forEach((station) => {
      const el = document.createElement("div")
      el.className = "marker lora-marker"

      let signalColor = "bg-green-500"
      if (station.signal === "fair") signalColor = "bg-yellow-500"
      if (station.signal === "poor") signalColor = "bg-red-500"

      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-radio"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><path d="M14 12a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2z"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h3 class="font-medium">LoRa Station #${station.id}</h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
              <p class="text-xs">People count:</p>
              <p class="text-xs font-medium">${station.peopleCount}</p>
              
              <p class="text-xs">Battery:</p>
              <div class="flex items-center gap-1">
                <div class="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full ${
                    station.battery > 70 ? "bg-green-500" : station.battery > 30 ? "bg-yellow-500" : "bg-red-500"
                  }" style="width: ${station.battery}%"></div>
                </div>
                <span class="text-xs">${station.battery}%</span>
              </div>
              
              <p class="text-xs">Signal:</p>
              <p class="text-xs font-medium ${
                station.signal === "excellent" || station.signal === "good"
                  ? "text-green-600"
                  : station.signal === "fair"
                    ? "text-yellow-600"
                    : "text-red-600"
              }">${station.signal}</p>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded">Configure</button>
              <button class="px-2 py-1 text-xs bg-gray-200 rounded">History</button>
            </div>
          `),
        )
        .addTo(map.current)
    })
  }

  // Toggle layer visibility
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Toggle boundary layer
    map.current.setLayoutProperty("boundary-layer", "visibility", layers.boundaries ? "visible" : "none")
    map.current.setLayoutProperty("boundary-fill", "visibility", layers.boundaries ? "visible" : "none")

    // Toggle heatmap layer
    map.current.setLayoutProperty("heatmap-layer", "visibility", layers.heatmap ? "visible" : "none")

    // Toggle vector flow layer
    map.current.setLayoutProperty("flow-layer", "visibility", layers.vectors ? "visible" : "none")
    map.current.setLayoutProperty("flow-symbols", "visibility", layers.vectors ? "visible" : "none")

    // Toggle geofence layers
    map.current.setLayoutProperty("geofences-fill", "visibility", layers.geofences ? "visible" : "none")
    map.current.setLayoutProperty("geofences-line", "visibility", layers.geofences ? "visible" : "none")
    map.current.setLayoutProperty("geofences-label", "visibility", layers.geofences ? "visible" : "none")

    // Toggle incident layers
    map.current.setLayoutProperty("incidents-circle", "visibility", layers.incidents ? "visible" : "none")
    map.current.setLayoutProperty("incidents-symbol", "visibility", layers.incidents ? "visible" : "none")

    // Toggle markers
    document.querySelectorAll(".security-marker").forEach((el) => {
      ;(el as HTMLElement).style.display = layers.security ? "block" : "none"
    })

    document.querySelectorAll(".emergency-marker").forEach((el) => {
      ;(el as HTMLElement).style.display = layers.emergency ? "block" : "none"
    })

    document.querySelectorAll(".lora-marker").forEach((el) => {
      ;(el as HTMLElement).style.display = layers.lora ? "block" : "none"
    })
  }, [layers, mapLoaded])

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }

  // Simulate movement of personnel (for demonstration)
  useEffect(() => {
    if (!mapLoaded) return

    const interval = setInterval(() => {
      // Update security personnel positions
      securityPersonnel.forEach((person) => {
        person.lat += (Math.random() - 0.5) * 0.0002 * simulationSpeed
        person.lng += (Math.random() - 0.5) * 0.0002 * simulationSpeed
      })

      // Update emergency services positions
      emergencyServices.forEach((service) => {
        if (service.type === "ambulance") {
          service.lat += (Math.random() - 0.5) * 0.0003 * simulationSpeed
          service.lng += (Math.random() - 0.5) * 0.0003 * simulationSpeed
        }
      })

      // Update LoRa station counts
      loraStations.forEach((station) => {
        const change = Math.floor(Math.random() * 5) - 2
        station.peopleCount = Math.max(0, station.peopleCount + change * simulationSpeed)

        // Update battery level (slowly decreasing)
        station.battery = Math.max(0, station.battery - 0.05 * simulationSpeed)
      })

      // Update geofence counts
      geofences.forEach((geofence) => {
        const change = Math.floor(Math.random() * 10) - 4
        geofence.currentCount = Math.max(
          0,
          Math.min(geofence.maxCapacity, geofence.currentCount + change * simulationSpeed),
        )
      })

      // Update map markers and sources
      if (map.current) {
        // Update geofence source
        const geofenceSource = map.current.getSource("geofences")
        if (geofenceSource && "setData" in geofenceSource) {
          geofenceSource.setData({
            type: "FeatureCollection",
            features: geofences.map((geofence) => ({
              type: "Feature",
              properties: {
                id: geofence.id,
                name: geofence.name,
                color: geofence.color,
                maxCapacity: geofence.maxCapacity,
                currentCount: geofence.currentCount,
              },
              geometry: {
                type: "Polygon",
                coordinates: [geofence.coordinates],
              },
            })),
          })
        }
      }

      // Refresh markers
      addMarkers()
    }, 2000)

    return () => clearInterval(interval)
  }, [mapLoaded, simulationSpeed])

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar variant="floating">
          <SidebarHeader className="border-b">
            <div className="flex items-center justify-between p-2">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5" />
                <span>MapCoord Pro</span>
              </Link>
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>Map Layers</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("boundaries")}>
                          <Layers />
                          <span>Boundaries</span>
                          {layers.boundaries ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("heatmap")}>
                          <Thermometer />
                          <span>Heat Map</span>
                          {layers.heatmap ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("vectors")}>
                          <Navigation />
                          <span>Movement Vectors</span>
                          {layers.vectors ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("geofences")}>
                          <Hexagon />
                          <span>Geofence Areas</span>
                          {layers.geofences ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("incidents")}>
                          <AlertCircle />
                          <span>Incidents</span>
                          {layers.incidents ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Personnel & Equipment</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("security")}>
                          <Shield />
                          <span>Security Personnel</span>
                          {layers.security ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("emergency")}>
                          <Ambulance />
                          <span>Emergency Services</span>
                          {layers.emergency ? (
                            <Eye className="ml-auto h-4 w-4" />
                          ) : (
                            <EyeOff className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => toggleLayer("lora")}>
                          <Radio />
                          <span>LoRa Stations</span>
                          {layers.lora ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Active Incidents</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium">Medical Assistance Needed</h4>
                            <p className="text-xs text-gray-500">Near Main Stage, 5 min ago</p>
                            <div className="flex gap-2 mt-1">
                              <Button variant="destructive" size="sm" className="h-7 text-xs">
                                Respond
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50 mt-2">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium">Overcrowding at Entrance</h4>
                            <p className="text-xs text-gray-500">East Gate, 12 min ago</p>
                            <div className="flex gap-2 mt-1">
                              <Button variant="default" size="sm" className="h-7 text-xs">
                                Respond
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>Crowd Density</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4">
                        <CrowdDensityChart />
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Zone Capacity</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {geofences.map((geofence) => (
                          <div key={geofence.id} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{geofence.name}</span>
                              <span className="text-sm">
                                {geofence.currentCount}/{geofence.maxCapacity}
                              </span>
                            </div>
                            <Progress
                              value={(geofence.currentCount / geofence.maxCapacity) * 100}
                              className={`h-2 ${
                                (geofence.currentCount / geofence.maxCapacity) > 0.8
                                  ? "bg-red-100"
                                  : geofence.currentCount / geofence.maxCapacity > 0.6
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                              }`}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>LoRa Station Status</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                            <div>Station</div>
                            <div>Battery</div>
                            <div>Signal</div>
                          </div>
                          <Separator />
                          {loraStations.slice(0, 5).map((station) => (
                            <div key={station.id} className="grid grid-cols-3 gap-2 text-sm">
                              <div>#{station.id}</div>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      station.battery > 70
                                        ? "bg-green-500"
                                        : station.battery > 30
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${station.battery}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{station.battery}%</span>
                              </div>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    station.signal === "excellent"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : station.signal === "good"
                                        ? "bg-green-50 text-green-600 border-green-100"
                                        : station.signal === "fair"
                                          ? "bg-yellow-50 text-yellow-800 border-yellow-100"
                                          : "bg-red-50 text-red-800 border-red-100"
                                  }`}
                                >
                                  {station.signal}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>Map Settings</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="map-style">Map Style</Label>
                          <select
                            id="map-style"
                            value={mapStyle}
                            onChange={(e) => setMapStyle(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                          >
                            <option value="streets-v12">Streets</option>
                            <option value="outdoors-v12">Outdoors</option>
                            <option value="light-v11">Light</option>
                            <option value="dark-v11">Dark</option>
                            <option value="satellite-v9">Satellite</option>
                            <option value="satellite-streets-v12">Satellite Streets</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time-of-day">Time of Day</Label>
                          <select
                            id="time-of-day"
                            value={timeOfDay}
                            onChange={(e) => setTimeOfDay(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                          >
                            <option value="current">Current Time</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                            <option value="night">Night</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="simulation-speed">Simulation Speed</Label>
                            <span className="text-xs text-gray-500">{simulationSpeed}x</span>
                          </div>
                          <Slider
                            id="simulation-speed"
                            min={0.5}
                            max={5}
                            step={0.5}
                            value={[simulationSpeed]}
                            onValueChange={(value) => setSimulationSpeed(value[0])}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Notifications</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="security-alerts" className="text-sm">
                            Security Alerts
                          </Label>
                          <Switch id="security-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="medical-alerts" className="text-sm">
                            Medical Alerts
                          </Label>
                          <Switch id="medical-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="capacity-alerts" className="text-sm">
                            Capacity Alerts
                          </Label>
                          <Switch id="capacity-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="device-alerts" className="text-sm">
                            Device Status Alerts
                          </Label>
                          <Switch id="device-alerts" />
                        </div>
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>System</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-refresh" className="text-sm">
                            Auto-refresh Data
                          </Label>
                          <Switch id="auto-refresh" defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="refresh-interval" className="text-sm">
                            Refresh Interval
                          </Label>
                          <select
                            id="refresh-interval"
                            className="w-full p-2 border rounded-md text-sm"
                            defaultValue="5"
                          >
                            <option value="2">2 seconds</option>
                            <option value="5">5 seconds</option>
                            <option value="10">10 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                          </select>
                        </div>
                        <Button variant="outline" className="w-full">
                          Reset All Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>
            </Tabs>
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs">System Online</span>
              </div>
              <Button variant="outline" size="sm" className="h-7">
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Admin</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="relative flex-1 h-full">
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger className="bg-white shadow-md rounded-md" />
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white shadow-md"
                    onClick={() => setShowIncidentDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Report Incident</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white shadow-md"
                    onClick={() => setShowGeofenceCreator(true)}
                  >
                    <Hexagon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create Geofence</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white shadow-md relative">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white shadow-md">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Team Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">14:32:45</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">1,245</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>

      {showIncidentDialog && <IncidentReportDialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog} />}
      {showGeofenceCreator && <GeofenceCreator open={showGeofenceCreator} onOpenChange={setShowGeofenceCreator} />}
    </SidebarProvider>
  )
}
