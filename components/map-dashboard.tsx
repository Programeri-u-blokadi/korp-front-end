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
} from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
} from "@/components/ui/sidebar"

// Mock data for demonstration
const securityPersonnel = [
  { id: 1, lat: 44.8125, lng: 20.4612, type: "security" },
  { id: 2, lat: 44.8145, lng: 20.4632, type: "security" },
  { id: 3, lat: 44.8165, lng: 20.4652, type: "security" },
  { id: 4, lat: 44.8185, lng: 20.4672, type: "security" },
]

const emergencyServices = [
  { id: 1, lat: 44.8135, lng: 20.4622, type: "ambulance" },
  { id: 2, lat: 44.8155, lng: 20.4642, type: "ambulance" },
]

const loraStations = [
  { id: 1, lat: 44.8115, lng: 20.4602, type: "lora", peopleCount: 45 },
  { id: 2, lat: 44.8135, lng: 20.4622, type: "lora", peopleCount: 23 },
  { id: 3, lat: 44.8155, lng: 20.4642, type: "lora", peopleCount: 67 },
  { id: 4, lat: 44.8175, lng: 20.4662, type: "lora", peopleCount: 12 },
  { id: 5, lat: 44.8195, lng: 20.4682, type: "lora", peopleCount: 38 },
]

// Boundary coordinates for demonstration
const boundaryCoordinates = [
  [20.4582, 44.8105],
  [20.4702, 44.8105],
  [20.4702, 44.8205],
  [20.4582, 44.8205],
  [20.4582, 44.8105],
]

export function MapDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [layers, setLayers] = useState({
    boundaries: true,
    heatmap: true,
    vectors: true,
    security: true,
    emergency: true,
    lora: true,
  })

  // Initialize map
  useEffect(() => {
    if (map.current) return

    // In a real application, you would use your own Mapbox token
    mapboxgl.accessToken = "pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImV4YW1wbGV0b2tlbiJ9.example"

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [20.4612, 44.8125], // Belgrade coordinates for example
      zoom: 15,
    })

    map.current.on("load", () => {
      setMapLoaded(true)

      // Add boundary layer
      map.current!.addSource("boundary", {
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

      map.current!.addLayer({
        id: "boundary-layer",
        type: "line",
        source: "boundary",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
        },
      })

      map.current!.addLayer({
        id: "boundary-fill",
        type: "fill",
        source: "boundary",
        layout: {},
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.1,
        },
      })

      // Add heatmap layer (mock data)
      const heatmapPoints = []
      for (let i = 0; i < 100; i++) {
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

      map.current!.addSource("heatmap-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: heatmapPoints,
        },
      })

      map.current!.addLayer({
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

      // Add vector flow layer (mock data)
      const flowLines = []
      for (let i = 0; i < 20; i++) {
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

      map.current!.addSource("flow-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: flowLines,
        },
      })

      map.current!.addLayer({
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
        },
      })

      // Add markers for security, emergency, and LoRa stations
      addMarkers()
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add markers for security, emergency, and LoRa stations
  const addMarkers = () => {
    if (!map.current) return

    // Add security personnel markers
    securityPersonnel.forEach((person) => {
      const el = document.createElement("div")
      el.className = "marker security-marker"
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([person.lng, person.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>Security #${person.id}</h3>`))
        .addTo(map.current)
    })

    // Add emergency services markers
    emergencyServices.forEach((service) => {
      const el = document.createElement("div")
      el.className = "marker emergency-marker"
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-ambulance"><path d="m6 19-2-2V5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12l-2 2"/><path d="M9 17h6"/><path d="M9 11h6"/><path d="M6 7h12"/><path d="M6 17h12"/><path d="m5 11 3-3 2 2 5-5 3 3"/></svg>
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([service.lng, service.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>Ambulance #${service.id}</h3>`))
        .addTo(map.current)
    })

    // Add LoRa station markers
    loraStations.forEach((station) => {
      const el = document.createElement("div")
      el.className = "marker lora-marker"
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-radio"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><path d="M14 12a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2z"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
      </div>`

      new mapboxgl.Marker(el)
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h3>LoRa Station #${station.id}</h3>
          <p>People count: ${station.peopleCount}</p>
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

  return (
    <SidebarProvider defaultOpen={showSidebar}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar variant="floating">
          <SidebarHeader className="border-b">
            <div className="flex items-center justify-between p-2">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5" />
                <span>MapCoord Dashboard</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Map Layers</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleLayer("boundaries")}>
                      <Layers />
                      <span>Boundaries</span>
                      {layers.boundaries ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleLayer("heatmap")}>
                      <Thermometer />
                      <span>Heat Map</span>
                      {layers.heatmap ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleLayer("vectors")}>
                      <Navigation />
                      <span>Movement Vectors</span>
                      {layers.vectors ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
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
                      {layers.security ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleLayer("emergency")}>
                      <Ambulance />
                      <span>Emergency Services</span>
                      {layers.emergency ? <Eye className="ml-auto h-4 w-4" /> : <EyeOff className="ml-auto h-4 w-4" />}
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
              <SidebarGroupLabel>Statistics</SidebarGroupLabel>
              <SidebarGroupContent>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total People:</span>
                        <span className="font-medium">1,245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Security Personnel:</span>
                        <span className="font-medium">{securityPersonnel.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Emergency Services:</span>
                        <span className="font-medium">{emergencyServices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">LoRa Stations:</span>
                        <span className="font-medium">{loraStations.length}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm">Average Density:</span>
                        <span className="font-medium">Medium</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="relative flex-1 h-full">
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger className="bg-white shadow-md rounded-md" />
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white shadow-md">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alert Center</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white shadow-md">
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personnel Management</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    </SidebarProvider>
  )
}
