/**
 * Note frequency calculations for harmonium
 * Uses 12-tone equal temperament: f = 440 * 2^((n-69)/12)
 * where n is the MIDI note number
 */

export type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'

export interface Note {
  name: NoteName
  octave: number
  midiNote: number
  frequency: number
}

// Map note names to their position in the chromatic scale (C = 0)
const NOTE_OFFSETS: Record<NoteName, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

/**
 * Convert MIDI note number to frequency in Hz
 * A4 (MIDI note 69) = 440 Hz
 */
export function midiNoteToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Calculate MIDI note number from note name and octave
 */
export function getNoteNumber(note: NoteName, octave: number): number {
  // MIDI note number: C-1 = 0, C0 = 12, C1 = 24, ..., A4 = 69
  return NOTE_OFFSETS[note] + (octave + 1) * 12
}

/**
 * Get frequency for a note with optional transpose and octave shift
 */
export function getNoteFrequency(
  note: NoteName,
  octave: number,
  transpose: number = 0,
  octaveShift: number = 0
): number {
  const baseNoteNumber = getNoteNumber(note, octave)
  const adjustedNoteNumber = baseNoteNumber + transpose + octaveShift * 12
  return midiNoteToFrequency(adjustedNoteNumber)
}

/**
 * Generate a scale of notes for the keyboard
 * Returns 3 octaves starting from C3
 */
export function generateKeyboardNotes(
  startOctave: number = 3,
  octaveCount: number = 3
): Array<Note> {
  const notes: Array<Note> = []
  const noteNames: Array<NoteName> = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ]

  for (let octave = startOctave; octave < startOctave + octaveCount; octave++) {
    for (const name of noteNames) {
      const midiNote = getNoteNumber(name, octave)
      const frequency = midiNoteToFrequency(midiNote)
      notes.push({ name, octave, midiNote, frequency })
    }
  }

  return notes
}

/**
 * Check if a note is a black key (sharp/flat)
 */
export function isBlackKey(noteName: NoteName): boolean {
  return noteName.includes('#')
}

/**
 * Get keyboard shortcut for a note
 * Maps MIDI note numbers to keyboard keys
 */
export function getKeyboardShortcutForNote(
  midiNote: number,
  startOctave: number = 3
): string | null {
  // Calculate which octave and note within that octave
  const noteOffset = midiNote - (startOctave + 1) * 12 // C3 = 48, so offset from C3
  const octave = Math.floor(noteOffset / 12)
  const noteInOctave = noteOffset % 12
  if (noteInOctave < 0) return null

  // Keyboard mapping for 3 octaves (C3-B5)
  // Lower octave (C3-B3): ZXCVBNM (white), ASDFGHJKL (black)
  // Middle octave (C4-B4): QWERTYUIOP[] (white), 1234567890-= (black)
  // Upper octave (C5-B5): Additional keys if needed

  const keyboardMap: Record<number, Record<number, string>> = {
    // Octave 3 (C3-B3)
    0: {
      0: 'z', // C
      1: 's', // C#
      2: 'x', // D
      3: 'd', // D#
      4: 'c', // E
      5: 'v', // F
      6: 'g', // F#
      7: 'b', // G
      8: 'h', // G#
      9: 'n', // A
      10: 'j', // A#
      11: 'm', // B
    },
    // Octave 4 (C4-B4)
    1: {
      0: 'q', // C
      1: '2', // C#
      2: 'w', // D
      3: '3', // D#
      4: 'e', // E
      5: 'r', // F
      6: '5', // F#
      7: 't', // G
      8: '6', // G#
      9: 'y', // A
      10: '7', // A#
      11: 'u', // B
    },
    // Octave 5 (C5-B5)
    2: {
      0: 'i', // C
      1: '9', // C#
      2: 'o', // D
      3: '0', // D#
      4: 'p', // E
      5: '[', // F
      6: '+', // F#
      7: ']', // G
      8: 'del', // G#
      9: '\\', // A
      10: '', // A#
      11: '', // B (no key mapped)
    },
  }

  const octaveMap = keyboardMap[octave]
  if (!octaveMap[noteInOctave]) return null

  return octaveMap[noteInOctave]
}
