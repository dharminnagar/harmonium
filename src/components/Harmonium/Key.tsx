/**
 * Individual keyboard key component
 */

import { getKeyboardShortcutForNote, isBlackKey } from '../../lib/audio/NoteFrequencies'
import type { Note } from '../../lib/audio/NoteFrequencies'

interface KeyProps {
  note: Note
  isActive: boolean
  onPress: (midiNote: number) => void
  onRelease: (midiNote: number) => void
  startOctave?: number
}

export function Key({ note, isActive, onPress, onRelease, startOctave = 3 }: KeyProps) {
  const isBlack = isBlackKey(note.name)
  const keyboardShortcut = getKeyboardShortcutForNote(note.midiNote, startOctave)

  const handleMouseDown = () => {
    onPress(note.midiNote)
  }

  const handleMouseUp = () => {
    onRelease(note.midiNote)
  }

  const handleMouseLeave = () => {
    if (isActive) {
      onRelease(note.midiNote)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    onPress(note.midiNote)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    onRelease(note.midiNote)
  }

  if (isBlack) {
    return (
      <button
        className={`absolute w-8 sm:w-10 h-20 sm:h-24 rounded-b-md border-2 border-foreground z-10 transition-all cursor-pointer select-none touch-none
          ${isActive ? 'bg-slate-600 shadow-inner' : 'bg-foreground shadow-md'}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`${note.name}${note.octave}`}
        style={{
          left: getBlackKeyPosition(note.name),
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-xs text-background mb-1">
            {note.name}
          </span>
          {keyboardShortcut && (
            <span className="text-[10px] text-background/70 font-mono hidden sm:block">
              {keyboardShortcut.toUpperCase()}
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      className={`flex-1 min-w-[44px] h-32 sm:h-40 border border-border rounded-b-md transition-all cursor-pointer select-none touch-none flex flex-col justify-end items-center pb-2 sm:pb-4
        ${isActive ? 'bg-slate-200 dark:bg-slate-700 shadow-inner' : 'bg-background hover:bg-muted shadow-sm'}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`${note.name}${note.octave}`}
    >
      <span className="text-xs sm:text-sm text-muted-foreground mb-1">
        {note.name}
        <sub className="text-xs">{note.octave}</sub>
      </span>
      {keyboardShortcut && (
        <span className="text-[10px] text-muted-foreground/60 font-mono hidden sm:block">
          {keyboardShortcut.toUpperCase()}
        </span>
      )}
    </button>
  )
}

/**
 * Calculate left position for black keys relative to white keys
 */
function getBlackKeyPosition(noteName: string): string {
  const positions: Record<string, string> = {
    'C#': 'calc(14.2857% - 1rem)', // After C
    'D#': 'calc(28.5714% - 1rem)', // After D
    'F#': 'calc(57.1429% - 1rem)', // After F
    'G#': 'calc(71.4286% - 1rem)', // After G
    'A#': 'calc(85.7143% - 1rem)', // After A
  }
  return positions[noteName] || '0'
}
