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
): Note[] {
  const notes: Note[] = []
  const noteNames: NoteName[] = [
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
