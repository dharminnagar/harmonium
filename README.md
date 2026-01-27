# Harmonium - Web-Based Harmonium Application

A fully functional web-based harmonium with realistic sound synthesis, MIDI support, and comprehensive musical controls.

## Features

- 🎹 **Realistic Sound**: Web Audio API-based synthesis with multiple detuned oscillators for authentic harmonium timbre
- 🎵 **Musical Controls**: 
  - Volume and reverb control
  - Octave shifting (-2 to +2)
  - Transpose control (-12 to +12 semitones)
- ⌨️ **Multiple Input Methods**:
  - Mouse/trackpad clicking
  - Computer keyboard (QWERTY layout)
  - Touch input (mobile-optimized)
  - MIDI controller support
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎼 **Low Latency**: Optimized audio engine for real-time performance

## Getting Started

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

### Usage

1. Open the application in your browser
2. Click "Start Playing" to initialize the audio engine
3. Play notes using:
   - **Mouse**: Click on keyboard keys
   - **Keyboard**: 
     - Lower octave: `Z X C V B N M` (white keys), `S D G H J` (black keys)
     - Upper octave: `Q W E R T Y U` (white keys), `2 3 5 6 7` (black keys)
   - **Touch**: Tap keys on mobile devices
   - **MIDI**: Connect a MIDI controller (requires HTTPS)

### Controls

- **Volume**: Adjust master volume (0-100%)
- **Reverb**: Control reverb effect intensity (0-100%)
- **Octave Shift**: Shift pitch by octaves (-2 to +2)
- **Transpose**: Shift pitch by semitones (-12 to +12)

## Technical Details

### Architecture

- **Audio Engine**: Web Audio API with OscillatorNode-based synthesis
- **Sound Design**: Sawtooth oscillators with ADSR envelope and low-pass filtering
- **Effects Chain**: Gain control → Reverb (ConvolverNode) → Master output
- **State Management**: React hooks with AudioContext lifecycle management

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (MIDI requires HTTPS)
- Mobile browsers: Full support with touch optimization

### Performance

- Supports ~20 simultaneous notes (polyphonic)
- Dynamic oscillator creation/destruction
- Optimized for low-latency audio playback
- Memory-efficient note cleanup

## Project Structure

```
src/
├── components/
│   ├── Harmonium/          # Main harmonium components
│   │   ├── Harmonium.tsx   # Container component
│   │   ├── HarmoniumKeyboard.tsx
│   │   ├── Key.tsx
│   │   ├── ControlPanel.tsx
│   │   └── MIDIDeviceSelector.tsx
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
│   ├── useAudioState.ts
│   ├── useActiveNotes.ts
│   ├── useKeyboardInput.ts
│   ├── useMIDIInput.ts
│   └── useTouchInput.ts
├── lib/
│   └── audio/             # Audio engine
│       ├── AudioEngine.ts
│       ├── AudioEffects.ts
│       └── NoteFrequencies.ts
└── routes/                # TanStack Router pages
```

## Technologies

- **React 19**: UI framework
- **TanStack Router**: Routing
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Web Audio API**: Sound synthesis
- **Web MIDI API**: MIDI controller support
- **Vite**: Build tool

## Development

```bash
# Run development server
bun run dev

# Run linter
bun run lint

# Format code
bun run format

# Run checks (format + lint)
bun run check
```

## License

MIT

## Credits

Built as a demonstration of modern web audio capabilities using React and the Web Audio API.
