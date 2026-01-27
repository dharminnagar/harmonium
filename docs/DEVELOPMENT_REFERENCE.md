# Harmonium Web Application - Master Development Reference

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Audio Engine Deep Dive](#audio-engine-deep-dive)
4. [React Component Architecture](#react-component-architecture)
5. [Input Systems](#input-systems)
6. [State Management](#state-management)
7. [Performance Optimization](#performance-optimization)
8. [Browser Compatibility & APIs](#browser-compatibility--apis)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Project Overview

**Harmonium** is a fully functional web-based harmonium application built with modern web technologies. It provides a realistic musical instrument experience entirely in the browser using the Web Audio API.

### Key Features
- **Realistic Sound Synthesis**: Web Audio API-based audio engine with sample playback and oscillator synthesis
- **Multiple Input Methods**: Mouse, computer keyboard, touch, and MIDI controller support
- **Musical Controls**: Volume, reverb, octave shifting, and transposition
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Low Latency**: Optimized for real-time musical performance

### Technology Stack
```typescript
Frontend: React 19 + TypeScript
Routing: TanStack Router v1
Styling: Tailwind CSS 4 + shadcn/ui
Audio: Web Audio API (native)
MIDI: Web MIDI API (native)
Build: Vite 7 + Bun
Testing: Vitest + Testing Library
```

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  React Hooks    │───▶│   Audio Engine   │
│                 │    │                 │    │                 │
│ • Mouse/Click   │    │ • useKeyboard   │    │ • Web Audio API │
│ • Keyboard      │    │ • useTouch      │    │ • Oscillator     │
│ • Touch         │    │ • useMIDI       │    │ • Sample Player  │
│ • MIDI          │    │ • useAudioState │    │ • Effects Chain  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   State Mgmt    │    │   Audio Output  │
│                 │    │                 │    │                 │
│ • Harmonium     │    │ • React State   │    │ • Speakers      │
│ • Keyboard      │    │ • Hook State    │    │ • Headphones    │
│ • Controls      │    │ • AudioContext  │    │ • Audio Device  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Hierarchy

```
Harmonium (ErrorBoundary)
├── Start Prompt / Loading Indicator
├── Control Panel
│   ├── Volume Slider (0-100%)
│   ├── Reverb Slider (0-100%)
│   ├── Octave Shift Controls (-2 to +2)
│   └── Transpose Controls (-12 to +12)
├── MIDI Device Selector
├── Harmonium Keyboard (3 octaves)
│   ├── White Keys (C3-B5)
│   └── Black Keys (overlay positioning)
└── Keyboard Shortcuts Overlay
```

### File Structure

```
src/
├── components/
│   ├── Harmonium/              # Main harmonium components
│   │   ├── Harmonium.tsx       # Root container component
│   │   ├── HarmoniumKeyboard.tsx # Keyboard display
│   │   ├── Key.tsx            # Individual key component
│   │   ├── ControlPanel.tsx   # Musical controls UI
│   │   ├── MIDIDeviceSelector.tsx # MIDI status display
│   │   └── KeyboardShortcuts.tsx # Help overlay
│   ├── ui/                    # shadcn/ui components
│   └── ErrorBoundary.tsx      # Error handling
├── hooks/                     # Custom React hooks
│   ├── useAudioState.ts       # Audio engine state management
│   ├── useActiveNotes.ts      # Currently playing notes tracking
│   ├── useKeyboardInput.ts    # Computer keyboard mapping
│   ├── useMIDIInput.ts        # MIDI device integration
│   ├── useTouchInput.ts       # Touch optimization
│   └── useKeyboardInput.ts    # Keyboard input handling
├── lib/
│   └── audio/                # Audio engine core
│       ├── AudioEngine.ts     # Main audio engine class
│       ├── AudioSampleLoader.ts # Sample loading utility
│       └── NoteFrequencies.ts # Frequency calculations
├── routes/                   # TanStack Router pages
└── styles.css               # Global styles
```

## Audio Engine Deep Dive

### AudioEngine Class Architecture

The `AudioEngine` is a singleton class that manages all audio processing using the Web Audio API.

#### Core Components

1. **AudioContext**: The root object for all audio processing
2. **Gain Nodes**: Volume control and signal routing
3. **ConvolverNode**: Reverb effect processing
4. **Sample Playback**: AudioBufferSourceNode for sample-based synthesis
5. **Oscillator Synthesis**: Fallback synthesis using OscillatorNode

#### Audio Signal Flow

```
Input → AudioEngine.playNote() → [Sample/Synthesis] → Filter → Gain → Dry/Wet Mix → Reverb → Master Output
     ↓
Active Voices Map (MIDI Note → SampleVoice)
     ↓
Voice Management (max 20 simultaneous notes)
```

### Sample-Based Playback

#### AudioSampleLoader Class

```typescript
class AudioSampleLoader {
  private audioContext: AudioContext
  private sampleBuffer: AudioBuffer | null = null
  private sampleMidiNote: number = 60 // C4 reference

  // Load harmonium.wav sample recorded at C4 (MIDI 60)
  async loadSample(url: string, sampleMidiNote: number = 60)

  // Calculate playback rate for pitch shifting
  calculatePlaybackRate(targetMidiNote: number): number {
    const semitones = targetMidiNote - this.sampleMidiNote
    return Math.pow(2, semitones / 12) // 2^(semitones/12)
  }
}
```

#### Sample Playback Process

1. **Load Sample**: `harmonium.wav` (recorded at C4/MIDI 60)
2. **Create Source**: `AudioBufferSourceNode` with sample buffer
3. **Pitch Shift**: Calculate `playbackRate = 2^((targetNote - 60)/12)`
4. **Loop Sample**: `source.loop = true` for sustained playback
5. **ADSR Envelope**: Apply attack/decay/sustain/release shaping
6. **Routing**: Connect to dry/wet paths for reverb processing

### Oscillator Synthesis Fallback

When sample loading fails, the engine falls back to oscillator-based synthesis:

```typescript
private playNoteWithSynthesis(midiNote: number, velocity: number) {
  const frequency = midiNoteToFrequency(midiNote)
  const oscillator = audioContext.createOscillator()

  oscillator.type = 'sawtooth'        // Rich harmonium-like timbre
  oscillator.frequency.value = frequency
  oscillator.detune.value = 2         // Slight detuning for warmth

  // ADSR envelope via GainNode
  const gainNode = audioContext.createGain()
  applyADSREnvelope(gainNode, velocity)

  oscillator.connect(gainNode)
  gainNode.connect(dryGain)
  gainNode.connect(reverbGain)

  oscillator.start()
}
```

### Reverb Implementation

#### ConvolverNode with Impulse Response

```typescript
private createReverbImpulse(): void {
  const sampleRate = audioContext.sampleRate
  const length = sampleRate * 2 // 2 second reverb
  const impulse = audioContext.createBuffer(2, length, sampleRate)

  // Generate exponentially decaying noise
  for (let i = 0; i < length; i++) {
    const decay = Math.exp((-3 * i) / length)
    impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * decay
    impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * decay
  }

  convolver.buffer = impulse
}
```

#### Dry/Wet Mix Architecture

```
Input Signal → Splitter
    ├── Dry Path (1 - reverbAmount) → Master Gain
    └── Wet Path (reverbAmount) → Convolver → Master Gain
```

### Voice Management

#### Active Voices Tracking

```typescript
interface SampleVoice {
  source: AudioBufferSourceNode | OscillatorNode
  gainNode: GainNode
  isActive: boolean // Prevents duplicate note triggers
  adjustedMidiNote: number // For pitch calculations
  velocity: number // For volume scaling
}

private activeVoices: Map<number, SampleVoice> = new Map()
private readonly MAX_VOICES = 20
```

#### Voice Limiting Strategy

```typescript
playNote(midiNote: number): void {
  // Prevent duplicate active notes
  const existing = activeVoices.get(midiNote)
  if (existing?.isActive) return

  // Enforce maximum polyphony
  if (activeVoices.size >= MAX_VOICES) {
    const oldestNote = activeVoices.keys().next().value
    stopNote(oldestNote) // Remove oldest voice
  }

  // Create new voice...
}
```

### ADSR Envelope Implementation

```typescript
private envelope: ADSREnvelope = {
  attack: 0.05,   // 50ms attack time
  decay: 0.1,     // 100ms decay time
  sustain: 0.7,   // 70% sustain level
  release: 0.3,   // 300ms release time
}

// Applied via GainNode automation
gainNode.gain.setValueAtTime(0, startTime)
gainNode.gain.linearRampToValueAtTime(peakGain, attackEnd)
gainNode.gain.linearRampToValueAtTime(sustainGain, decayEnd)
gainNode.gain.setValueAtTime(sustainGain, sustainStart) // Maintain sustain
```

## React Component Architecture

### Hook-Based Architecture

The application uses a sophisticated hook-based architecture for clean separation of concerns:

#### useAudioState Hook

```typescript
function useAudioState() {
  const [volume, setVolumeState] = useState(0.5)
  const [reverb, setReverbState] = useState(0.3)
  const [octaveShift, setOctaveShiftState] = useState(0)
  const [transpose, setTransposeState] = useState(0)

  // Singleton audio engine instance
  const audioEngine = getAudioEngine()

  const setVolume = useCallback((value: number) => {
    setVolumeState(value)
    audioEngine.setVolume(value)
  }, [audioEngine])

  return {
    volume, setVolume,
    reverb, setReverb,
    octaveShift, setOctaveShift,
    transpose, setTranspose,
    playNote: audioEngine.playNote.bind(audioEngine),
    stopNote: audioEngine.stopNote.bind(audioEngine)
  }
}
```

#### useActiveNotes Hook

```typescript
function useActiveNotes() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())

  const addActiveNote = useCallback((midiNote: number) => {
    setActiveNotes(prev => new Set(prev).add(midiNote))
  }, [])

  const removeActiveNote = useCallback((midiNote: number) => {
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.delete(midiNote)
      return next
    })
  }, [])

  return { activeNotes, addActiveNote, removeActiveNote }
}
```

### Component Communication Pattern

```
Harmonium Component
├── useAudioState() → Audio engine control
├── useActiveNotes() → UI feedback state
├── useKeyboardInput() → Keyboard mapping
├── useMIDIInput() → MIDI device integration
└── Child Components
    ├── ControlPanel → Audio parameter controls
    ├── HarmoniumKeyboard → Visual keyboard
    └── MIDIDeviceSelector → Device status
```

### Keyboard Component Architecture

#### HarmoniumKeyboard Structure

```typescript
function HarmoniumKeyboard({ activeNotes, onNotePress, onNoteRelease }) {
  const notes = useMemo(() => generateKeyboardNotes(3, 3), []) // C3-B5

  // Separate rendering for proper layering
  const whiteKeys = notes.filter(note => !isBlackKey(note.name))
  const blackKeys = notes.filter(note => isBlackKey(note.name))

  return (
    <div className="keyboard-container">
      {/* White keys base layer */}
      <div className="white-keys">
        {whiteKeys.map(note => (
          <Key key={note.midiNote} note={note} isActive={...} />
        ))}
      </div>

      {/* Black keys overlay - positioned by octave */}
      {octaves.map(octaveIndex => (
        <div className="black-keys-octave" style={positioning}>
          {blackKeys.filter(note => note.octave === octave).map(...)}
        </div>
      ))}
    </div>
  )
}
```

## Input Systems

### Computer Keyboard Input (useKeyboardInput)

#### Physical Key Mapping

```typescript
const CODE_TO_NOTE_OFFSET: Record<string, number> = {
  // Octave 3 (C3-B3) - Lower register
  KeyZ: 0,   // C3
  KeyS: 1,   // C#3
  KeyX: 2,   // D3
  // ... more mappings

  // Octave 4 (C4-B4) - Middle register
  KeyQ: 12,  // C4
  Digit2: 13, // C#4
  KeyW: 14,  // D4
  // ... more mappings
}
```

#### Key Event Handling

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  const code = event.code
  const offset = CODE_TO_NOTE_OFFSET[code]

  if (!offset) return

  // Prevent key repeat and OS interference
  if (event.repeat) return
  event.preventDefault()

  // Calculate MIDI note: C3 = 48
  const baseMidiNote = 48 + (baseOctave - 3) * 12
  const midiNote = baseMidiNote + offset

  onNotePress(midiNote)
}
```

#### Key State Tracking

```typescript
const pressedKeys = useRef<Set<string>>(new Set())
const keyDownTime = useRef<Map<string, number>>(new Map())

// Protection against spurious keyup events
const handleKeyUp = (event: KeyboardEvent) => {
  const keyDownTimestamp = keyDownTime.current.get(event.code)
  const now = Date.now()

  // Ignore keyup if it happens within 15ms of keydown (browser quirk)
  if (keyDownTimestamp && now - keyDownTimestamp < 15) return

  // Release note...
}
```

### MIDI Input System (useMIDIInput)

#### Web MIDI API Integration

```typescript
const initializeMIDI = async () => {
  if (!navigator.requestMIDIAccess) {
    setIsSupported(false)
    return
  }

  const midiAccess = await navigator.requestMIDIAccess()

  // Listen for device state changes
  midiAccess.addEventListener('statechange', updateDeviceList)

  // Setup message listeners for all inputs
  midiAccess.inputs.forEach(input => {
    input.addEventListener('midimessage', handleMIDIMessage)
  })
}
```

#### MIDI Message Processing

```typescript
const handleMIDIMessage = (event: MIDIMessageEvent) => {
  const [status, note, velocity] = event.data
  const command = status & 0xf0

  if (command === MIDI_NOTE_ON && velocity > 0) {
    const normalizedVelocity = velocity / 127
    onNotePress(note, normalizedVelocity)
  } else if (command === MIDI_NOTE_OFF || (command === MIDI_NOTE_ON && velocity === 0)) {
    onNoteRelease(note)
  }
}
```

### Touch Input Optimization (useTouchInput)

#### Touch Event Handling

```typescript
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault() // Prevent scrolling/zooming

  Array.from(event.changedTouches).forEach(touch => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element?.hasAttribute('data-key')) {
      const midiNote = parseInt(element.getAttribute('data-key')!)
      onNotePress(midiNote)
    }
  })
}
```

#### Mobile-Specific Optimizations

```typescript
// Disable scroll and zoom on keyboard area
const element = keyboardRef.current
if (element) {
  element.style.touchAction = 'none'
  element.addEventListener('touchstart', handleTouchStart, { passive: false })
  element.addEventListener('touchend', handleTouchEnd, { passive: false })
}
```

## State Management

### React State Architecture

The application uses a distributed state management approach:

#### Local Component State
- **Harmonium**: `showStartPrompt`, loading states
- **ControlPanel**: UI interaction state
- **Hooks**: Domain-specific state (audio, notes, inputs)

#### Audio State Management

```typescript
// Singleton pattern for audio engine
let audioEngineInstance: AudioEngine | null = null

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine()
  }
  return audioEngineInstance
}
```

#### State Synchronization

```typescript
// Hook-level state sync with audio engine
const [volume, setVolumeState] = useState(0.5)

const setVolume = useCallback((value: number) => {
  setVolumeState(value)          // Update React state
  audioEngine.setVolume(value)   // Update audio engine
}, [audioEngine])
```

### Lifecycle Management

#### AudioContext Lifecycle

```typescript
async initialize(): Promise<void> {
  if (this.audioContext) return

  this.audioContext = new AudioContext()

  // Create audio graph...
  await this.sampleLoader.loadSample('/audio/harmonium.wav', 60)

  // Resume context (required after user gesture)
  if (this.audioContext.state === 'suspended') {
    await this.audioContext.resume()
  }
}
```

#### Cleanup Strategy

```typescript
async dispose(): Promise<void> {
  // Stop all active notes
  for (const [midiNote] of this.activeVoices) {
    this.stopNote(midiNote)
  }

  // Close audio context
  if (this.audioContext) {
    await this.audioContext.close()
  }

  // Clear references
  this.audioContext = null
  this.activeVoices.clear()
}
```

## Performance Optimization

### Audio Performance

#### Voice Limiting
- Maximum 20 simultaneous notes
- Automatic oldest voice cleanup
- Prevents audio artifacts and CPU overload

#### Memory Management
```typescript
// Automatic node disposal after release
setTimeout(() => {
  voice.source.disconnect()
  voice.gainNode.disconnect()
}, envelope.release * 1000 + 100)
```

#### Parameter Smoothing
```typescript
// Smooth parameter changes to prevent audio artifacts
this.masterGain.gain.setTargetAtTime(volume, currentTime, 0.01)
```

### React Performance

#### Callback Stabilization
```typescript
// Use refs to prevent effect re-runs
const onNotePressRef = useRef(onNotePress)
const handleNotePress = useCallback((midiNote: number) => {
  onNotePressRef.current(midiNote)
}, [])
```

#### Memoization Strategy
```typescript
const notes = useMemo(() => generateKeyboardNotes(startOctave, octaveCount), [startOctave, octaveCount])
const whiteKeys = useMemo(() => notes.filter(note => !isBlackKey(note.name)), [notes])
const blackKeys = useMemo(() => notes.filter(note => isBlackKey(note.name)), [notes])
```

### Browser Optimization

#### Event Handling Optimization
- `passive: false` for touch events requiring preventDefault
- Key event debouncing to prevent OS-level repeats
- Efficient DOM queries with data attributes

## Browser Compatibility & APIs

### Web Audio API Requirements

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| AudioContext | 14+ | 25+ | 6+ | 12+ |
| AudioBufferSourceNode | 14+ | 25+ | 6+ | 12+ |
| OscillatorNode | 14+ | 25+ | 6+ | 12+ |
| GainNode | 14+ | 25+ | 6+ | 12+ |
| ConvolverNode | 14+ | 25+ | 6+ | 12+ |

### Web MIDI API Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ | Requires HTTPS |
| Firefox | ✅ | Requires HTTPS |
| Safari | ✅ | Requires HTTPS |
| Edge | ✅ | Requires HTTPS |
| Mobile Chrome | ❌ | Not supported |
| Mobile Safari | ❌ | Not supported |

### Touch API Compatibility

| Device Type | Touch Events | Pointer Events | Notes |
|-------------|--------------|----------------|-------|
| Desktop | ❌ | ✅ | Mouse/keyboard only |
| Tablet | ✅ | ✅ | Touch optimized |
| Mobile | ✅ | ✅ | Touch primary |

## Development Workflow

### Local Development Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:3000
```

### Build Process

```bash
# Production build
bun run build

# Preview production build
bun run preview
```

### Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format

# Run all checks
bun run check

# Run tests
bun run test
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint",
    "format": "prettier",
    "check": "prettier --write . && eslint --fix"
  }
}
```

## Troubleshooting Guide

### Audio Issues

#### No Sound
1. **Check user gesture**: AudioContext requires user interaction to initialize
2. **Browser permissions**: Ensure audio permissions are granted
3. **Device volume**: Check system and browser volume levels
4. **Audio context state**: Verify context is 'running', not 'suspended'

#### Audio Artifacts
1. **Parameter smoothing**: Use `setTargetAtTime` for smooth transitions
2. **Voice management**: Check for voice limit enforcement
3. **Node disposal**: Ensure proper cleanup of audio nodes

### MIDI Issues

#### MIDI Not Detected
1. **HTTPS requirement**: Web MIDI API requires secure context
2. **Browser support**: Check browser compatibility table
3. **Device permissions**: Grant MIDI access when prompted
4. **Device conflicts**: Ensure device not used by other applications

#### MIDI Latency
1. **Buffer size**: Smaller buffers reduce latency but increase CPU usage
2. **System load**: Close unnecessary applications
3. **Connection type**: Use wired MIDI connections when possible

### Touch/Mobile Issues

#### Touch Not Responding
1. **Touch targets**: Ensure minimum 44px touch targets
2. **Event prevention**: Check `preventDefault` on touch events
3. **Viewport meta**: Verify proper mobile viewport configuration

#### Performance Issues
1. **Polyphony limit**: Reduce simultaneous notes on mobile
2. **Memory management**: Implement aggressive cleanup
3. **Battery optimization**: Check device power management settings

### Keyboard Issues

#### Key Repeat Problems
1. **OS-level repeat**: Implement key repeat prevention
2. **Browser quirks**: Handle spurious keyup events
3. **Focus management**: Ensure proper window focus handling

#### Layout Conflicts
1. **QWERTY assumptions**: Consider international keyboard layouts
2. **Modifier keys**: Handle Shift/Ctrl/Alt key combinations
3. **Input field interference**: Prevent keyboard input in text fields

### Performance Debugging

#### Memory Leaks
```typescript
// Monitor active voices
console.log('Active voices:', audioEngine.activeVoices.size)

// Check for undisposed nodes
console.log('Audio context nodes:', audioContext.destination.numberOfOutputs)
```

#### CPU Usage
```typescript
// Monitor audio callback performance
audioContext.addEventListener('statechange', () => {
  console.log('Audio context state:', audioContext.state)
})
```

#### Network Issues
```typescript
// Sample loading debugging
sampleLoader.loadSample('/audio/harmonium.wav', 60)
  .then(() => console.log('Sample loaded successfully'))
  .catch(error => console.error('Sample loading failed:', error))
```

### Build and Deployment

#### Vite Build Issues
1. **ESM compatibility**: Ensure all dependencies support ES modules
2. **Asset paths**: Verify correct paths for audio samples
3. **TypeScript compilation**: Check for type errors in build output

#### Production Optimization
1. **Code splitting**: Implement route-based code splitting
2. **Asset optimization**: Compress audio samples and images
3. **Bundle analysis**: Use build tools to analyze bundle size

---

## Conclusion

This development reference provides comprehensive coverage of the Harmonium web application's architecture, implementation details, and development practices. The application demonstrates advanced use of modern web APIs including Web Audio API, Web MIDI API, and sophisticated React patterns for real-time audio applications.

Key technical achievements include:
- **Low-latency audio processing** with sample-based playback
- **Multi-input support** across mouse, keyboard, touch, and MIDI
- **Realistic audio synthesis** with ADSR envelopes and effects processing
- **Performance optimization** for real-time musical performance
- **Cross-platform compatibility** with responsive design

The codebase serves as an excellent example of modern web audio application development, showcasing the capabilities of browser-based music technology. 🎹