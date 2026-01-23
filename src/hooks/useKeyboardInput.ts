/**
 * Hook to handle computer keyboard input for playing notes
 * Maps QWERTY keyboard to harmonium keys
 */

import { useCallback, useEffect, useRef } from 'react'

interface KeyboardInputProps {
  onNotePress: (midiNote: number) => void
  onNoteRelease: (midiNote: number) => void
  enabled?: boolean
  baseOctave?: number
}

/**
 * Keyboard layout mapping - Full 3-octave coverage (C3-B5)
 * Uses event.code for reliable key detection (physical key, not character)
 * 
 * Row 1 (Numbers): 1 2 3 4 5 6 7 8 9 0 - =  (Black keys, higher octaves)
 * Row 2 (QWERTY):  Q W E R T Y U I O P [ ]  (White keys, middle/upper octaves)
 * Row 3 (ASDF):    A S D F G H J K L ; '    (Black keys, lower/middle octaves)
 * Row 4 (ZXCV):    Z X C V B N M , . /      (White keys, lower octave)
 */
const CODE_TO_NOTE_OFFSET: Record<string, number> = {
  // Octave 3 (C3-B3) - Lower octave
  KeyZ: 0, // C3
  KeyS: 1, // C#3
  KeyX: 2, // D3
  KeyD: 3, // D#3
  KeyC: 4, // E3
  KeyV: 5, // F3
  KeyG: 6, // F#3
  KeyB: 7, // G3
  KeyH: 8, // G#3
  KeyN: 9, // A3
  KeyJ: 10, // A#3
  KeyM: 11, // B3

  // Octave 4 (C4-B4) - Middle octave
  KeyQ: 12, // C4
  Digit2: 13, // C#4
  KeyW: 14, // D4
  Digit3: 15, // D#4
  KeyE: 16, // E4
  KeyR: 17, // F4
  Digit5: 18, // F#4
  KeyT: 19, // G4
  Digit6: 20, // G#4
  KeyY: 21, // A4
  Digit7: 22, // A#4
  KeyU: 23, // B4

  // Octave 5 (C5-B5) - Upper octave
  KeyI: 24, // C5
  Digit8: 25, // C#5
  KeyO: 26, // D5
  Digit9: 27, // D#5
  KeyP: 28, // E5
  BracketLeft: 29, // F5
  Digit0: 30, // F#5
  BracketRight: 31, // G5
  Minus: 32, // G#5
  Backslash: 33, // A5
  Equal: 34, // A#5
  // B5 would be next but no key mapped
}

// Legacy mapping for backward compatibility (used in KeyboardShortcuts display)
const KEY_TO_NOTE_OFFSET: Record<string, number> = {
  // Octave 3 (C3-B3) - Lower octave
  z: 0, // C3
  s: 1, // C#3
  x: 2, // D3
  d: 3, // D#3
  c: 4, // E3
  v: 5, // F3
  g: 6, // F#3
  b: 7, // G3
  h: 8, // G#3
  n: 9, // A3
  j: 10, // A#3
  m: 11, // B3

  // Octave 4 (C4-B4) - Middle octave
  q: 12, // C4
  '2': 13, // C#4
  w: 14, // D4
  '3': 15, // D#4
  e: 16, // E4
  r: 17, // F4
  '5': 18, // F#4
  t: 19, // G4
  '6': 20, // G#4
  y: 21, // A4
  '7': 22, // A#4
  u: 23, // B4

  // Octave 5 (C5-B5) - Upper octave
  i: 24, // C5
  '8': 25, // C#5
  o: 26, // D5
  '9': 27, // D#5
  p: 28, // E5
  '[': 29, // F5
  '0': 30, // F#5
  ']': 31, // G5
  '-': 32, // G#5
  '\\': 33, // A5
  '=': 34, // A#5
  // B5 would be next but no key mapped
}

export function useKeyboardInput({
  onNotePress,
  onNoteRelease,
  enabled = true,
  baseOctave = 3,
}: KeyboardInputProps) {
  const pressedKeys = useRef<Set<string>>(new Set())
  const codeToMidiNote = useRef<Map<string, number>>(new Map())
  const keyDownTime = useRef<Map<string, number>>(new Map())
  const isUnmounting = useRef(false)

  // Use refs for callbacks to prevent effect re-runs
  const onNotePressRef = useRef(onNotePress)
  const onNoteReleaseRef = useRef(onNoteRelease)

  // Update refs when callbacks change
  useEffect(() => {
    onNotePressRef.current = onNotePress
    onNoteReleaseRef.current = onNoteRelease
  }, [onNotePress, onNoteRelease])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const code = event.code
      const offset = CODE_TO_NOTE_OFFSET[code]

      // Skip if not a mapped key
      if (offset === undefined) {
        return
      }

      // Prevent key repeat and duplicate presses
      if (event.repeat || pressedKeys.current.has(code)) {
        event.preventDefault()
        return
      }

      event.preventDefault()
      event.stopPropagation()

      // Mark key as pressed and record timestamp
      pressedKeys.current.add(code)
      keyDownTime.current.set(code, Date.now())

      // Calculate MIDI note: C3 = 48
      const baseMidiNote = 48 + (baseOctave - 3) * 12
      const midiNote = baseMidiNote + offset

      // Store mapping and trigger note press
      codeToMidiNote.current.set(code, midiNote)
      onNotePressRef.current(midiNote)
    },
    [enabled, baseOctave]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const code = event.code

      // Only process if key is tracked
      if (!pressedKeys.current.has(code)) {
        return
      }

      // Protection against immediate keyup (browser quirk)
      const keyDownTimestamp = keyDownTime.current.get(code)
      if (keyDownTimestamp && Date.now() - keyDownTimestamp < 50) {
        // Ignore keyup if it happens within 50ms of keydown
        return
      }

      event.preventDefault()
      event.stopPropagation()

      // Get MIDI note before removing from tracking
      const midiNote = codeToMidiNote.current.get(code)

      // Remove from tracking
      pressedKeys.current.delete(code)
      codeToMidiNote.current.delete(code)
      keyDownTime.current.delete(code)

      // Trigger note release
      if (midiNote !== undefined) {
        onNoteReleaseRef.current(midiNote)
      }
    },
    [enabled]
  )

  const handleBlur = useCallback(() => {
    // Only release notes on actual window blur, not during cleanup
    if (isUnmounting.current) return

    // Release all notes when window loses focus
    for (const [code, midiNote] of codeToMidiNote.current) {
      onNoteReleaseRef.current(midiNote)
      pressedKeys.current.delete(code)
      keyDownTime.current.delete(code)
    }
    codeToMidiNote.current.clear()
  }, [])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      // Mark as unmounting to prevent handleBlur from releasing notes
      isUnmounting.current = true

      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)

      // Clean up tracking maps
      pressedKeys.current.clear()
      codeToMidiNote.current.clear()
      keyDownTime.current.clear()
    }
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur])

  return {
    keyMap: KEY_TO_NOTE_OFFSET,
  }
}
