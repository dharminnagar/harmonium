/**
 * Control panel for harmonium settings
 * Volume, reverb, octave shift, and transpose controls
 */

import { Volume2, Waves, ChevronUp, ChevronDown } from 'lucide-react'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'

interface ControlPanelProps {
  volume: number
  reverb: number
  octaveShift: number
  transpose: number
  onVolumeChange: (value: number) => void
  onReverbChange: (value: number) => void
  onOctaveShiftChange: (value: number) => void
  onTransposeChange: (value: number) => void
}

export function ControlPanel({
  volume,
  reverb,
  octaveShift,
  transpose,
  onVolumeChange,
  onReverbChange,
  onOctaveShiftChange,
  onTransposeChange,
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium">Volume</label>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[volume * 100]}
                onValueChange={(values) => onVolumeChange(values[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[3ch] text-right">
                {Math.round(volume * 100)}
              </span>
            </div>
          </div>

          {/* Reverb Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium">Reverb</label>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[reverb * 100]}
                onValueChange={(values) => onReverbChange(values[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[3ch] text-right">
                {Math.round(reverb * 100)}
              </span>
            </div>
          </div>

          {/* Octave Shift */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Octave Shift</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOctaveShiftChange(octaveShift - 1)}
                disabled={octaveShift <= -2}
                aria-label="Decrease octave"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-lg font-semibold">
                  {octaveShift > 0 ? '+' : ''}
                  {octaveShift}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOctaveShiftChange(octaveShift + 1)}
                disabled={octaveShift >= 2}
                aria-label="Increase octave"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Transpose Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Transpose (semitones)
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onTransposeChange(transpose - 1)}
                disabled={transpose <= -12}
                aria-label="Decrease transpose"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-lg font-semibold">
                  {transpose > 0 ? '+' : ''}
                  {transpose}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onTransposeChange(transpose + 1)}
                disabled={transpose >= 12}
                aria-label="Increase transpose"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click keys to play, or use your computer keyboard. Connect a MIDI device for controller support.
          </p>
        </div>
      </div>
    </div>
  )
}
