"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface IncidentReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncidentReportDialog({ open, onOpenChange }: IncidentReportDialogProps) {
  const [incidentType, setIncidentType] = useState("medical")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("medium")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would submit this data to your backend
    console.log({
      incidentType,
      location,
      description,
      severity,
      timestamp: new Date().toISOString(),
    })

    // Close the dialog
    onOpenChange(false)

    // Reset form
    setIncidentType("medical")
    setLocation("")
    setDescription("")
    setSeverity("medium")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Report Incident
          </DialogTitle>
          <DialogDescription>Report an incident that requires attention from the team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="incident-type">Incident Type</Label>
              <RadioGroup
                id="incident-type"
                value={incidentType}
                onValueChange={setIncidentType}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medical" id="medical" />
                  <Label htmlFor="medical">Medical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="security" id="security" />
                  <Label htmlFor="security">Security</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crowd" id="crowd" />
                  <Label htmlFor="crowd">Crowd</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Main Stage, North Entrance"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the incident in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <RadioGroup id="severity" value={severity} onValueChange={setSeverity} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Report Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
