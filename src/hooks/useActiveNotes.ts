/**
 * Hook to track currently active (playing) notes
 */

import { useState, useCallback } from 'react'

export function useActiveNotes() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())

  const addActiveNote = useCallback((midiNote: number) => {
    setActiveNotes((prev) => new Set(prev).add(midiNote))
  }, [])

  const removeActiveNote = useCallback((midiNote: number) => {
    setActiveNotes((prev) => {
      const newSet = new Set(prev)
      newSet.delete(midiNote)
      return newSet
    })
  }, [])

  const isNoteActive = useCallback(
    (midiNote: number) => activeNotes.has(midiNote),
    [activeNotes]
  )

  const clearAllNotes = useCallback(() => {
    setActiveNotes(new Set())
  }, [])

  return {
    activeNotes,
    addActiveNote,
    removeActiveNote,
    isNoteActive,
    clearAllNotes,
  }
}
