# Audio Sample Directory

## Harmonium Sample File

To get authentic harmonium sound, you need to add a harmonium audio sample file:

**File**: `harmonium.wav`

**Location**: Place the file in this directory (`public/audio/harmonium.wav`)

**Requirements**:
- Format: WAV (uncompressed or compressed)
- Sample Rate: 44.1kHz or higher (48kHz recommended)
- Channels: Mono or Stereo
- Note: Should be a clean recording of a single harmonium note (C4 recommended, MIDI note 60)
- Duration: 2-5 seconds (with natural attack and decay)

**Where to get a sample**:
1. Record your own harmonium
2. Use a Creative Commons sample from freesound.org or similar
3. Reference the implementation at: https://github.com/MrAkbari91/web-harmonium

**Note**: If the sample file is not found, the application will fall back to synthesized sound (less authentic but still functional).
