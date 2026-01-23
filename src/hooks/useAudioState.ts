/**
 * Hook to manage audio engine state
 */

import { useState, useCallback, useEffect } from 'react'
import { getAudioEngine } from '../lib/audio/AudioEngine'

export function useAudioState() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [volume, setVolumeState] = useState(0.5)
  const [reverb, setReverbState] = useState(0.3)
  const [octaveShift, setOctaveShiftState] = useState(0)
  const [transpose, setTransposeState] = useState(0)

  const audioEngine = getAudioEngine()

  const initialize = useCallback(async () => {
    try {
      await audioEngine.initialize()
      setIsInitialized(true)
      // Sync state with engine
      const settings = audioEngine.getSettings()
      setVolumeState(settings.volume)
      setReverbState(settings.reverb)
      setOctaveShiftState(settings.octaveShift)
      setTransposeState(settings.transpose)
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
    }
  }, [audioEngine])

  const setVolume = useCallback(
    (value: number) => {
      setVolumeState(value)
      audioEngine.setVolume(value)
    },
    [audioEngine]
  )

  const setReverb = useCallback(
    (value: number) => {
      setReverbState(value)
      audioEngine.setReverb(value)
    },
    [audioEngine]
  )

  const setOctaveShift = useCallback(
    (value: number) => {
      setOctaveShiftState(value)
      audioEngine.setOctaveShift(value)
    },
    [audioEngine]
  )

  const setTranspose = useCallback(
    (value: number) => {
      setTransposeState(value)
      audioEngine.setTranspose(value)
    },
    [audioEngine]
  )

  const playNote = useCallback(
    (midiNote: number, velocity: number = 1): void => {
      if (!isInitialized) return
      audioEngine.playNote(midiNote, velocity)
    },
    [audioEngine, isInitialized]
  )

  const stopNote = useCallback(
    (midiNote: number) => {
      if (!isInitialized) return
      audioEngine.stopNote(midiNote)
    },
    [audioEngine, isInitialized]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.dispose()
    }
  }, [audioEngine])

  return {
    isInitialized,
    initialize,
    volume,
    setVolume,
    reverb,
    setReverb,
    octaveShift,
    setOctaveShift,
    transpose,
    setTranspose,
    playNote,
    stopNote,
  }
}
