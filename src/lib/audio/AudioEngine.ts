/**
 * Core audio engine for harmonium sound generation
 * Uses Web Audio API with audio sample playback for authentic harmonium sound
 */

import { AudioSampleLoader } from './AudioSampleLoader'

interface SampleVoice {
  source: AudioBufferSourceNode
  gainNode: GainNode
}

interface ADSREnvelope {
  attack: number // seconds
  decay: number // seconds
  sustain: number // 0-1
  release: number // seconds
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private reverbGain: GainNode | null = null
  private dryGain: GainNode | null = null
  private convolver: ConvolverNode | null = null
  private activeVoices: Map<number, SampleVoice> = new Map()
  private sampleLoader: AudioSampleLoader | null = null
  private readonly MAX_VOICES = 20 // Limit for performance
  private sampleLoaded = false

  // ADSR envelope settings for harmonium-like sound
  private envelope: ADSREnvelope = {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
  }

  // Current settings
  private volume = 0.5
  private reverbAmount = 0.3
  private octaveShift = 0
  private transpose = 0

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  /**
   * Initialize AudioContext (must be called from user gesture)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return

    this.audioContext = new AudioContext()

    // Create master gain node
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = this.volume

    // Create dry/wet signal paths for reverb
    this.dryGain = this.audioContext.createGain()
    this.reverbGain = this.audioContext.createGain()
    this.reverbGain.gain.value = this.reverbAmount
    this.dryGain.gain.value = 1 - this.reverbAmount

    // Create convolver for reverb
    this.convolver = this.audioContext.createConvolver()

    // Connect audio graph: dryGain -> master, reverbGain -> convolver -> master
    this.dryGain.connect(this.masterGain)
    this.reverbGain.connect(this.convolver)
    this.convolver.connect(this.masterGain)
    this.masterGain.connect(this.audioContext.destination)

    // Create reverb impulse
    this.createReverbImpulse()

    // Initialize sample loader
    this.sampleLoader = new AudioSampleLoader(this.audioContext)

    // Load harmonium sample
    try {
      await this.sampleLoader.loadSample('/audio/harmonium.wav', 60) // C4
      console.log('Harmonium sample loaded')
      this.sampleLoaded = true
    } catch (error) {
      console.warn('Failed to load harmonium sample, falling back to synthesis:', error)
      this.sampleLoaded = false
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Create impulse response for reverb effect
   */
  private createReverbImpulse(): void {
    if (!this.audioContext || !this.convolver) return

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * 2 // 2 second reverb
    const impulse = this.audioContext.createBuffer(
      2,
      length,
      sampleRate
    )

    const leftChannel = impulse.getChannelData(0)
    const rightChannel = impulse.getChannelData(1)

    // Generate exponentially decaying noise for reverb
    for (let i = 0; i < length; i++) {
      const decay = Math.exp((-3 * i) / length)
      leftChannel[i] = (Math.random() * 2 - 1) * decay
      rightChannel[i] = (Math.random() * 2 - 1) * decay
    }

    this.convolver.buffer = impulse
  }

  /**
   * Play a note with given MIDI note number
   */
  playNote(midiNote: number, velocity: number = 1): void {
    if (!this.audioContext || !this.dryGain || !this.reverbGain) {
      console.warn('AudioContext not initialized')
      return
    }

    // Stop existing note if playing
    this.stopNote(midiNote)

    // Limit number of active voices for performance
    if (this.activeVoices.size >= this.MAX_VOICES) {
      // Stop the oldest voice
      const oldestNote = this.activeVoices.keys().next().value
      if (oldestNote !== undefined) {
        this.stopNote(oldestNote)
      }
    }

    const now = this.audioContext.currentTime

    // Apply octave shift and transpose
    const adjustedMidiNote = midiNote + this.octaveShift * 12 + this.transpose

    // Use sample playback if available, otherwise fall back to synthesis
    // Double-check sample is actually loaded and buffer exists
    const sampleBuffer = this.sampleLoader?.getSampleBuffer()
    const canUseSample = this.sampleLoaded && this.sampleLoader?.isLoaded() && sampleBuffer !== null
    
    if (canUseSample) {
      this.playNoteWithSample(adjustedMidiNote, velocity, now, midiNote)
    } else {
      // Fallback to synthesis if sample not available
      this.playNoteWithSynthesis(adjustedMidiNote, velocity, now, midiNote)
    }
  }

  /**
   * Play note using audio sample with pitch shifting
   */
  private playNoteWithSample(
    adjustedMidiNote: number,
    velocity: number,
    startTime: number,
    originalMidiNote: number
  ): void {
    if (!this.audioContext || !this.sampleLoader) return

    const sampleBuffer = this.sampleLoader.getSampleBuffer()
    if (!sampleBuffer) {
      console.warn('Sample buffer not available, falling back to synthesis')
      this.playNoteWithSynthesis(adjustedMidiNote, velocity, startTime, originalMidiNote)
      return
    }

    // Create buffer source
    const source = this.audioContext.createBufferSource()
    source.buffer = sampleBuffer

    // Calculate playback rate for pitch shifting
    const playbackRate = this.sampleLoader.calculatePlaybackRate(adjustedMidiNote)
    source.playbackRate.value = playbackRate

    // Create gain node for volume and ADSR envelope
    const gainNode = this.audioContext.createGain()

    // Connect source -> gain -> dry/wet paths
    source.connect(gainNode)
    if (this.dryGain && this.reverbGain) {
      gainNode.connect(this.dryGain)
      gainNode.connect(this.reverbGain)
    }

    // Apply ADSR envelope
    const peakGain = velocity * 0.4 // Adjust volume scaling
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(
      peakGain,
      startTime + this.envelope.attack
    )
    gainNode.gain.linearRampToValueAtTime(
      peakGain * this.envelope.sustain,
      startTime + this.envelope.attack + this.envelope.decay
    )

    // Start playback
    source.start(startTime)

    // Store voice for cleanup - use original MIDI note as key so stopNote can find it
    this.activeVoices.set(originalMidiNote, { source, gainNode })
  }

  /**
   * Fallback: Play note using improved synthesis (if sample not available)
   */
  private playNoteWithSynthesis(
    midiNote: number,
    velocity: number,
    startTime: number,
    originalMidiNote: number
  ): void {
    if (!this.audioContext) return

    // Import here to avoid circular dependency
    const { midiNoteToFrequency } = require('./NoteFrequencies')
    const frequency = midiNoteToFrequency(midiNote)

    // Create gain node
    const gainNode = this.audioContext.createGain()

    // Use a single oscillator with better settings for harmonium-like sound
    const osc = this.audioContext.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = frequency

    // Add slight detuning for warmth
    osc.detune.value = 2

    // Connect oscillator to gain
    osc.connect(gainNode)

    // Split signal to dry and wet paths
    if (this.dryGain && this.reverbGain) {
      gainNode.connect(this.dryGain)
      gainNode.connect(this.reverbGain)
    }

    // Apply ADSR envelope
    const peakGain = velocity * 0.2
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(
      peakGain,
      startTime + this.envelope.attack
    )
    gainNode.gain.linearRampToValueAtTime(
      peakGain * this.envelope.sustain,
      startTime + this.envelope.attack + this.envelope.decay
    )

    // Start oscillator
    osc.start(startTime)

    // Store voice (using source as placeholder for cleanup)
    this.activeVoices.set(originalMidiNote, {
      source: osc as any, // Type hack for compatibility
      gainNode,
    })
  }

  /**
   * Stop a note with given MIDI note number
   */
  stopNote(midiNote: number): void {
    const voice = this.activeVoices.get(midiNote)
    if (!voice || !this.audioContext) return

    const now = this.audioContext.currentTime
    const currentGain = voice.gainNode.gain.value

    // Apply release envelope
    voice.gainNode.gain.cancelScheduledValues(now)
    voice.gainNode.gain.setValueAtTime(currentGain, now)
    voice.gainNode.gain.linearRampToValueAtTime(0, now + this.envelope.release)

    // Stop source after release
    const stopTime = now + this.envelope.release
    try {
      voice.source.stop(stopTime)
    } catch (e) {
      // Source may already be stopped
    }

    // Remove from active voices
    this.activeVoices.delete(midiNote)

    // Cleanup nodes after stopping
    setTimeout(() => {
      try {
        voice.source.disconnect()
      } catch (e) {
        // Already disconnected
      }
      voice.gainNode.disconnect()
    }, this.envelope.release * 1000 + 100)
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.audioContext!.currentTime,
        0.01
      )
    }
  }

  /**
   * Set reverb amount (0-1)
   */
  setReverb(amount: number): void {
    this.reverbAmount = Math.max(0, Math.min(1, amount))
    if (this.reverbGain && this.dryGain && this.audioContext) {
      const now = this.audioContext.currentTime
      this.reverbGain.gain.setTargetAtTime(this.reverbAmount, now, 0.01)
      this.dryGain.gain.setTargetAtTime(1 - this.reverbAmount, now, 0.01)
    }
  }

  /**
   * Set octave shift (-2 to +2)
   */
  setOctaveShift(shift: number): void {
    this.octaveShift = Math.max(-2, Math.min(2, Math.round(shift)))
  }

  /**
   * Set transpose in semitones (-12 to +12)
   */
  setTranspose(semitones: number): void {
    this.transpose = Math.max(-12, Math.min(12, Math.round(semitones)))
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      volume: this.volume,
      reverb: this.reverbAmount,
      octaveShift: this.octaveShift,
      transpose: this.transpose,
      isInitialized: this.audioContext !== null,
    }
  }

  /**
   * Cleanup and dispose
   */
  async dispose(): Promise<void> {
    // Stop all active notes
    for (const [midiNote] of this.activeVoices) {
      this.stopNote(midiNote)
    }

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }

    this.masterGain = null
    this.reverbGain = null
    this.dryGain = null
    this.convolver = null
    this.sampleLoader = null
    this.activeVoices.clear()
    this.sampleLoaded = false
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine()
  }
  return audioEngineInstance
}
