/**
 * Keyboard shortcuts overlay component
 */

import { useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { Button } from '../ui/button'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40"
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Shortcuts
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-3xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Octave 3 (C3-B3) - Lower Octave */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
              Octave 3 (C3-B3) - Lower Octave
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Z</kbd> - C
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">S</kbd> - C#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">X</kbd> - D
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">D</kbd> - D#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">C</kbd> - E
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">V</kbd> - F
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">G</kbd> - F#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">B</kbd> - G
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">H</kbd> - G#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">N</kbd> - A
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">J</kbd> - A#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">M</kbd> - B
              </div>
            </div>
          </div>

          {/* Octave 4 (C4-B4) - Middle Octave */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
              Octave 4 (C4-B4) - Middle Octave
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Q</kbd> - C
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">2</kbd> - C#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">W</kbd> - D
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">3</kbd> - D#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">E</kbd> - E
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd> - F
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">5</kbd> - F#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">T</kbd> - G
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">6</kbd> - G#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Y</kbd> - A
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">7</kbd> - A#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">U</kbd> - B
              </div>
            </div>
          </div>

          {/* Octave 5 (C5-B5) - Upper Octave */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
              Octave 5 (C5-B5) - Upper Octave
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">I</kbd> - C
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">8</kbd> - C#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">O</kbd> - D
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">9</kbd> - D#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">P</kbd> - E
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">[</kbd> - F
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">0</kbd> - F#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">]</kbd> - G
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">-</kbd> - G#
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">\</kbd> - A
              </div>
              <div className="text-sm">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">=</kbd> - A#
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            You can also use your mouse, touch, or connect a MIDI controller
          </p>
        </div>
      </div>
    </div>
  )
}
