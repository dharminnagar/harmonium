/**
 * Hook to handle computer keyboard input for playing notes
 * Maps QWERTY keyboard to harmonium keys
 */

import { useEffect, useCallback, useRef } from 'react'

interface KeyboardInputProps {
  onNotePress: (midiNote: number) => void
  onNoteRelease: (midiNote: number) => void
  enabled?: boolean
  baseOctave?: number
}

/**
 * Keyboard layout mapping - Full 3-octave coverage (C3-B5)
 * 
 * Row 1 (Numbers): 1 2 3 4 5 6 7 8 9 0 - =  (Black keys, higher octaves)
 * Row 2 (QWERTY):  Q W E R T Y U I O P [ ]  (White keys, middle/upper octaves)
 * Row 3 (ASDF):    A S D F G H J K L ; '    (Black keys, lower/middle octaves)
 * Row 4 (ZXCV):    Z X C V B N M , . /      (White keys, lower octave)
 */
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
  const keyToMidiNote = useRef<Map<string, number>>(new Map())

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

      const key = event.key.toLowerCase()
      const offset = KEY_TO_NOTE_OFFSET[key]

      if (offset === undefined) return

      // Prevent key repeat
      if (pressedKeys.current.has(key)) return

      event.preventDefault()
      pressedKeys.current.add(key)

      // Calculate MIDI note: C3 = 48
      // The offset is already relative to C3, so we just add it to C3's MIDI note
      const baseMidiNote = 48 + (baseOctave - 3) * 12
      const midiNote = baseMidiNote + offset

      keyToMidiNote.current.set(key, midiNote)
      onNotePress(midiNote)
    },
    [enabled, baseOctave, onNotePress]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const key = event.key.toLowerCase()
      if (!pressedKeys.current.has(key)) return

      event.preventDefault()
      pressedKeys.current.delete(key)

      const midiNote = keyToMidiNote.current.get(key)
      if (midiNote !== undefined) {
        onNoteRelease(midiNote)
        keyToMidiNote.current.delete(key)
      }
    },
    [enabled, onNoteRelease]
  )

  const handleBlur = useCallback(() => {
    // Release all notes when window loses focus
    for (const [key, midiNote] of keyToMidiNote.current) {
      onNoteRelease(midiNote)
      pressedKeys.current.delete(key)
    }
    keyToMidiNote.current.clear()
  }, [onNoteRelease])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)

      // Release all notes on cleanup
      handleBlur()
    }
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur])

  return {
    keyMap: KEY_TO_NOTE_OFFSET,
  }
}
