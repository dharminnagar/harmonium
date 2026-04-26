/**
 * Main Harmonium component
 * Orchestrates keyboard, controls, and audio engine
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { useAudioState } from '../../hooks/useAudioState'
import { useActiveNotes } from '../../hooks/useActiveNotes'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { useMIDIInput } from '../../hooks/useMIDIInput'
import { ErrorBoundary } from '../ErrorBoundary'
import { Button } from '../ui/button'
import { HarmoniumKeyboard } from './HarmoniumKeyboard'
import { ControlPanel } from './ControlPanel'
import { MIDIDeviceSelector } from './MIDIDeviceSelector'
import { KeyboardShortcuts } from './KeyboardShortcuts'

function HarmoniumInner() {
  const [showStartPrompt, setShowStartPrompt] = useState(true)
  const [promptVisible, setPromptVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setPromptVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const audioState = useAudioState()
  const {
    activeNotes,
    addActiveNote,
    removeActiveNote,
  } = useActiveNotes()

  // Use refs to stabilize callbacks and prevent effect re-runs
  const audioStateRef = useRef(audioState)
  const addActiveNoteRef = useRef(addActiveNote)
  const removeActiveNoteRef = useRef(removeActiveNote)

  // Update refs when values change
  useEffect(() => {
    audioStateRef.current = audioState
    addActiveNoteRef.current = addActiveNote
    removeActiveNoteRef.current = removeActiveNote
  }, [audioState, addActiveNote, removeActiveNote])

  const handleNotePress = useCallback((midiNote: number) => {
    // Add to active notes for UI feedback FIRST (before audio starts)
    addActiveNoteRef.current(midiNote)
    // Play the note
    audioStateRef.current.playNote(midiNote)
  }, [])

  const handleNoteRelease = useCallback((midiNote: number) => {
    // Remove from active notes for UI feedback FIRST
    removeActiveNoteRef.current(midiNote)
    // Stop the note
    audioStateRef.current.stopNote(midiNote)
  }, [])

  // Enable keyboard input
  useKeyboardInput({
    onNotePress: handleNotePress,
    onNoteRelease: handleNoteRelease,
    enabled: audioState.isInitialized,
    baseOctave: 3,
  })

  // Enable MIDI input
  const midiState = useMIDIInput({
    onNotePress: (note, velocity) => {
      audioState.playNote(note, velocity)
      addActiveNote(note)
    },
    onNoteRelease: (note) => {
      audioState.stopNote(note)
      removeActiveNote(note)
    },
    enabled: audioState.isInitialized,
  })

  const handleStart = async () => {
    setPromptVisible(false)
    setTimeout(() => setShowStartPrompt(false), 300)
    await audioState.initialize()
  }

  // Initialize on first user interaction if not showing prompt
  useEffect(() => {
    if (!showStartPrompt && !audioState.isInitialized) {
      audioState.initialize()
    }
  }, [showStartPrompt, audioState])

  return (
    <div className="min-h-screen bg-background">
      {/* Start Prompt Overlay */}
      {showStartPrompt && (
        <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ${promptVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`text-center space-y-6 p-8 transition-[opacity,transform] duration-300 ${promptVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h1 className="text-4xl font-bold text-balance">Web Harmonium</h1>
            <p className="text-muted-foreground max-w-md text-pretty">
              Experience a realistic harmonium in your browser. Click below to start playing.
            </p>
            <Button size="lg" onClick={handleStart}>
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
            <p className="text-xs text-muted-foreground">
              Best experienced with headphones or speakers
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!showStartPrompt && !audioState.isInitialized && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Initializing audio engine...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">Harmonium</h1>
          <p className="text-muted-foreground text-pretty">
            A web-based harmonium with realistic sound and controls
          </p>
        </div>

        {/* MIDI Status */}
        {audioState.isInitialized && (
          <div className="w-full max-w-6xl mx-auto px-4">
            <MIDIDeviceSelector
              devices={midiState.devices}
              isSupported={midiState.isSupported}
              isConnected={midiState.isConnected}
              error={midiState.error}
            />
          </div>
        )}

        <ControlPanel
          volume={audioState.volume}
          reverb={audioState.reverb}
          octaveShift={audioState.octaveShift}
          transpose={audioState.transpose}
          onVolumeChange={audioState.setVolume}
          onReverbChange={audioState.setReverb}
          onOctaveShiftChange={audioState.setOctaveShift}
          onTransposeChange={audioState.setTranspose}
        />

        <HarmoniumKeyboard
          activeNotes={activeNotes}
          onNotePress={handleNotePress}
          onNoteRelease={handleNoteRelease}
          startOctave={3}
          octaveCount={3}
        />

        {/* Keyboard Shortcuts Overlay */}
        {audioState.isInitialized && <KeyboardShortcuts />}
      </div>
    </div>
  )
}

export function Harmonium() {
  return (
    <ErrorBoundary>
      <HarmoniumInner />
    </ErrorBoundary>
  )
}
