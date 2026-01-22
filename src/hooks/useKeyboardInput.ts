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
 * Keyboard layout mapping
 * Lower row (ZXCVBNM) = C3-B3 (white keys)
 * Upper row (ASDFGHJKL) = C4-B4 (white keys)
 * Number row (1-0) = C#/D#/F#/G#/A# for both octaves
 */
const KEY_TO_NOTE_OFFSET: Record<string, number> = {
  // Lower octave white keys (C3-B3)
  z: 0, // C
  x: 2, // D
  c: 4, // E
  v: 5, // F
  b: 7, // G
  n: 9, // A
  m: 11, // B

  // Lower octave black keys
  s: 1, // C#
  d: 3, // D#
  g: 6, // F#
  h: 8, // G#
  j: 10, // A#

  // Upper octave white keys (C4-B4)
  q: 12, // C
  w: 14, // D
  e: 16, // E
  r: 17, // F
  t: 19, // G
  y: 21, // A
  u: 23, // B

  // Upper octave black keys
  '2': 13, // C#
  '3': 15, // D#
  '5': 18, // F#
  '6': 20, // G#
  '7': 22, // A#
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
