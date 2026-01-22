/**
 * Harmonium keyboard component
 * Displays white and black keys with visual feedback
 */

import { useMemo, useRef } from 'react'
import { generateKeyboardNotes, isBlackKey } from '../../lib/audio/NoteFrequencies'
import { useTouchInput } from '../../hooks/useTouchInput'
import { Key } from './Key'

interface HarmoniumKeyboardProps {
  activeNotes: Set<number>
  onNotePress: (midiNote: number) => void
  onNoteRelease: (midiNote: number) => void
  startOctave?: number
  octaveCount?: number
}

export function HarmoniumKeyboard({
  activeNotes,
  onNotePress,
  onNoteRelease,
  startOctave = 3,
  octaveCount = 3,
}: HarmoniumKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null)
  
  const notes = useMemo(
    () => generateKeyboardNotes(startOctave, octaveCount),
    [startOctave, octaveCount]
  )

  // Separate white and black keys for proper layering
  const whiteKeys = notes.filter((note) => !isBlackKey(note.name))
  const blackKeys = notes.filter((note) => isBlackKey(note.name))

  // Enable touch input optimization
  useTouchInput({ elementRef: keyboardRef, enabled: true })

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
      <div 
        ref={keyboardRef}
        data-keyboard
        className="relative bg-muted rounded-lg p-2 sm:p-4 shadow-lg overflow-x-auto"
      >
        {/* White keys container */}
        <div className="flex gap-0.5 relative">
          {whiteKeys.map((note) => (
            <Key
              key={`${note.name}${note.octave}`}
              note={note}
              isActive={activeNotes.has(note.midiNote)}
              onPress={onNotePress}
              onRelease={onNoteRelease}
            />
          ))}
        </div>

        {/* Black keys overlay - grouped by octave for positioning */}
        {Array.from({ length: octaveCount }).map((_, octaveIndex) => {
          const currentOctave = startOctave + octaveIndex
          const octaveBlackKeys = blackKeys.filter(
            (note) => note.octave === currentOctave
          )
          
          return (
            <div
              key={`octave-${currentOctave}`}
              className="absolute top-4 h-24"
              style={{
                left: `calc(${octaveIndex * (100 / octaveCount)}% + 1rem)`,
                width: `calc(${100 / octaveCount}%)`,
              }}
            >
              {octaveBlackKeys.map((note) => (
                <Key
                  key={`${note.name}${note.octave}`}
                  note={note}
                  isActive={activeNotes.has(note.midiNote)}
                  onPress={onNotePress}
                  onRelease={onNoteRelease}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
