/**
 * MIDI device selector and status component
 */

import { Music, AlertCircle, CheckCircle } from 'lucide-react'

interface MIDIDevice {
  id: string
  name: string
  manufacturer: string
}

interface MIDIDeviceSelectorProps {
  devices: MIDIDevice[]
  isSupported: boolean
  isConnected: boolean
  error: string | null
}

export function MIDIDeviceSelector({
  devices,
  isSupported,
  isConnected,
  error,
}: MIDIDeviceSelectorProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="w-4 h-4" />
        <span>MIDI not supported in this browser</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music className="w-4 h-4" />
        <span>Initializing MIDI...</span>
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music className="w-4 h-4" />
        <span>No MIDI devices connected</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="font-medium">MIDI Connected</span>
      </div>
      <div className="space-y-1">
        {devices.map((device) => (
          <div
            key={device.id}
            className="text-xs text-muted-foreground pl-6"
          >
            {device.name}
            {device.manufacturer && device.manufacturer !== 'Unknown' && (
              <span className="ml-1">({device.manufacturer})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
