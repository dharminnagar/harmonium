/**
 * Hook to handle MIDI input from external devices
 * Uses Web MIDI API
 */

import { useEffect, useState, useCallback } from 'react'

interface MIDIInputProps {
  onNotePress: (midiNote: number, velocity: number) => void
  onNoteRelease: (midiNote: number) => void
  enabled?: boolean
}

interface MIDIDevice {
  id: string
  name: string
  manufacturer: string
}

const MIDI_NOTE_ON = 0x90
const MIDI_NOTE_OFF = 0x80

export function useMIDIInput({
  onNotePress,
  onNoteRelease,
  enabled = true,
}: MIDIInputProps) {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null)
  const [devices, setDevices] = useState<MIDIDevice[]>([])
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize MIDI access
  const initializeMIDI = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false)
      setError('Web MIDI API is not supported in this browser')
      return
    }

    try {
      const access = await navigator.requestMIDIAccess()
      setMidiAccess(access)
      setError(null)
      
      // List available devices
      updateDeviceList(access)
    } catch (err) {
      console.error('Failed to access MIDI devices:', err)
      setError('Failed to access MIDI devices. Please grant permission.')
    }
  }, [])

  // Update list of available MIDI devices
  const updateDeviceList = useCallback((access: MIDIAccess) => {
    const deviceList: MIDIDevice[] = []
    access.inputs.forEach((input) => {
      deviceList.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
      })
    })
    setDevices(deviceList)
  }, [])

  // Handle MIDI messages
  const handleMIDIMessage = useCallback(
    (event: MIDIMessageEvent) => {
      if (!enabled) return

      const [status, note, velocity] = event.data
      const command = status & 0xf0

      if (command === MIDI_NOTE_ON && velocity > 0) {
        // Note On with velocity
        const normalizedVelocity = velocity / 127
        onNotePress(note, normalizedVelocity)
      } else if (command === MIDI_NOTE_OFF || (command === MIDI_NOTE_ON && velocity === 0)) {
        // Note Off
        onNoteRelease(note)
      }
    },
    [enabled, onNotePress, onNoteRelease]
  )

  // Setup MIDI input listeners
  useEffect(() => {
    if (!midiAccess || !enabled) return

    const inputs = Array.from(midiAccess.inputs.values())

    // Add listeners to all inputs
    inputs.forEach((input) => {
      input.addEventListener('midimessage', handleMIDIMessage as EventListener)
    })

    // Listen for device connection changes
    const handleStateChange = () => {
      updateDeviceList(midiAccess)
    }
    midiAccess.addEventListener('statechange', handleStateChange)

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('midimessage', handleMIDIMessage as EventListener)
      })
      midiAccess.removeEventListener('statechange', handleStateChange)
    }
  }, [midiAccess, enabled, handleMIDIMessage, updateDeviceList])

  // Auto-initialize on mount
  useEffect(() => {
    if (enabled) {
      initializeMIDI()
    }
  }, [enabled, initializeMIDI])

  return {
    devices,
    isSupported,
    error,
    isConnected: midiAccess !== null,
    initializeMIDI,
  }
}
