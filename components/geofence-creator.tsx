"use client"

import type React from "react"

import { useState } from "react"
import { Hexagon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface GeofenceCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GeofenceCreator({ open, onOpenChange }: GeofenceCreatorProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3B82F6")
  const [maxCapacity, setMaxCapacity] = useState(200)
  const [drawMode, setDrawMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would submit this data to your backend
    console.log({
      name,
      color,
      maxCapacity,
      // In a real app, you would have coordinates from the map drawing
      coordinates: [],
    })

    // Close the dialog
    onOpenChange(false)

    // Reset form
    setName("")
    setColor("#3B82F6")
    setMaxCapacity(200)
    setDrawMode(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hexagon className="h-5 w-5 text-blue-500" />
            Create Geofence
          </DialogTitle>
          <DialogDescription>Define a geofence area on the map to monitor capacity and movement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Geofence Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Stage, Food Court"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="max-capacity">Maximum Capacity</Label>
                <span className="text-sm text-gray-500">{maxCapacity} people</span>
              </div>
              <Slider
                id="max-capacity"
                min={10}
                max={1000}
                step={10}
                value={[maxCapacity]}
                onValueChange={(value) => setMaxCapacity(value[0])}
              />
            </div>

            <div className="grid gap-2 mt-2">
              <Button
                type="button"
                variant={drawMode ? "default" : "outline"}
                className="w-full"
                onClick={() => setDrawMode(!drawMode)}
              >
                {drawMode ? "Drawing Mode Active" : "Start Drawing on Map"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {drawMode
                  ? "Click on the map to create points. Double-click to complete the geofence."
                  : "Click to start drawing the geofence area on the map."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Geofence</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
