# Getting Started with Harmonium

## Quick Start

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Start the development server**:
   ```bash
   bun run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

4. **Start playing**:
   Click "Start Playing" to initialize the audio engine

## How to Play

### Mouse/Trackpad
- Click on any key to play a note
- Release to stop the note
- Click multiple keys for chords

### Computer Keyboard

**Lower Octave (C3-B3)**:
- White keys: `Z X C V B N M`
- Black keys: `S D G H J`

**Upper Octave (C4-B4)**:
- White keys: `Q W E R T Y U`
- Black keys: `2 3 5 6 7`

**Tips**:
- Press and hold for sustained notes
- Release to stop notes
- Press multiple keys for chords

### Touch (Mobile/Tablet)
- Tap keys to play notes
- Supports multi-touch for chords
- Pinch to zoom is disabled on keyboard area for better control

### MIDI Controller
1. Connect your MIDI device
2. Grant browser permission when prompted
3. Play directly from your controller
4. Device status shown below the title

**Note**: MIDI requires HTTPS in production

## Controls

### Volume
Adjust the master volume from 0-100%

### Reverb
Control the reverb effect intensity from 0-100%
- 0% = Dry signal only
- 100% = Maximum reverb

### Octave Shift
Shift all notes by octaves
- Range: -2 to +2 octaves
- Use `+` and `-` buttons

### Transpose
Shift all notes by semitones
- Range: -12 to +12 semitones (one octave)
- Use `+` and `-` buttons
- Useful for changing keys

## Tips for Best Experience

1. **Audio Quality**:
   - Use headphones or good speakers
   - Close other audio-heavy applications
   - Increase your device volume

2. **Performance**:
   - Close unnecessary browser tabs
   - Use a modern browser (Chrome, Firefox, Safari)
   - Hardware acceleration enabled in browser settings

3. **Latency**:
   - Close background applications
   - Use a wired connection for MIDI devices
   - Reduce buffer size in browser audio settings if available

4. **Mobile**:
   - Use landscape orientation for more keys
   - Enable full-screen mode
   - Use a quiet environment

## Keyboard Shortcuts

Click the "Shortcuts" button in the bottom-right corner to view the complete keyboard mapping reference.

## Troubleshooting

### No Sound
- Ensure you clicked "Start Playing"
- Check your device volume
- Check browser permissions for audio
- Try refreshing the page

### Latency Issues
- Close other applications
- Reduce browser tabs
- Check CPU usage
- Try a different browser

### MIDI Not Working
- Ensure HTTPS connection (required for Web MIDI API)
- Grant browser permissions
- Check device connection
- Try reconnecting the device
- Check device is not in use by another application

### Touch Not Responding (Mobile)
- Ensure JavaScript is enabled
- Try refreshing the page
- Check browser compatibility
- Clear browser cache

### Keys Stuck Playing
- Press and release the key again
- Click elsewhere on the page
- Refresh the browser

## Browser Requirements

- **Minimum**: Chrome 70+, Firefox 65+, Safari 14+
- **Recommended**: Latest version of any major browser
- **Features**:
  - Web Audio API (required)
  - Web MIDI API (optional, for MIDI support)
  - ES6+ JavaScript support
  - Touch events (for mobile)

## Development

### Build for Production
```bash
bun run build
```

### Run Tests
```bash
bun run test
```

### Lint Code
```bash
bun run lint
```

### Format Code
```bash
bun run format
```

### Run All Checks
```bash
bun run check
```

## Technical Notes

- **Audio Context**: Requires user gesture to initialize (security requirement)
- **Sample Rate**: Uses browser default (typically 44.1kHz or 48kHz)
- **Latency**: Optimized for real-time performance (<100ms typical)
- **Polyphony**: Maximum 20 simultaneous notes
- **Memory**: Automatic cleanup of audio nodes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the browser console for errors
3. Ensure you're using a supported browser
4. Check the IMPLEMENTATION_SUMMARY.md for technical details

## Enjoy Playing!

The harmonium is a versatile instrument. Experiment with different combinations of:
- Reverb settings for different room sizes
- Octave shifts for bass or treble emphasis
- Transpose for different musical keys
- MIDI velocity for dynamic expression

Happy playing! 🎹
