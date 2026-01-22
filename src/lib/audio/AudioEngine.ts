/**
 * Core audio engine for harmonium sound generation
 * Uses Web Audio API with oscillator-based synthesis
 */

import { midiNoteToFrequency } from './NoteFrequencies'

interface OscillatorVoice {
  oscillators: Array<OscillatorNode>
  gainNode: GainNode
  filterNode: BiquadFilterNode
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
  private activeVoices: Map<number, OscillatorVoice> = new Map()
  private readonly MAX_VOICES = 20 // Limit for performance

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
    const frequency = midiNoteToFrequency(adjustedMidiNote)

    // Create oscillator voice with multiple detuned oscillators for richness
    const gainNode = this.audioContext.createGain()
    const filterNode = this.audioContext.createBiquadFilter()

    // Configure low-pass filter for mellower harmonium tone
    filterNode.type = 'lowpass'
    filterNode.frequency.value = 2000
    filterNode.Q.value = 1

    // Create multiple slightly detuned oscillators for warmth
    const oscillators: Array<OscillatorNode> = []
    const detuneValues = [0, -5, 5] // cents

    for (const detune of detuneValues) {
      const osc = this.audioContext.createOscillator()
      osc.type = 'sawtooth' // Sawtooth wave for harmonium-like timbre
      osc.frequency.value = frequency
      osc.detune.value = detune
      osc.connect(filterNode)
      oscillators.push(osc)
    }

    // Connect filter to gain
    filterNode.connect(gainNode)

    // Split signal to dry and wet paths
    gainNode.connect(this.dryGain)
    gainNode.connect(this.reverbGain)

    // Apply ADSR envelope
    const peakGain = (velocity * 0.3) / oscillators.length // Scale by number of oscillators
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(peakGain, now + this.envelope.attack)
    gainNode.gain.linearRampToValueAtTime(
      peakGain * this.envelope.sustain,
      now + this.envelope.attack + this.envelope.decay
    )

    // Start all oscillators
    for (const osc of oscillators) {
      osc.start(now)
    }

    // Store voice for later cleanup
    this.activeVoices.set(midiNote, { oscillators, gainNode, filterNode })
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

    // Stop and cleanup oscillators after release
    const stopTime = now + this.envelope.release
    for (const osc of voice.oscillators) {
      osc.stop(stopTime)
    }

    // Remove from active voices
    this.activeVoices.delete(midiNote)

    // Cleanup nodes after stopping
    setTimeout(() => {
      for (const osc of voice.oscillators) {
        osc.disconnect()
      }
      voice.gainNode.disconnect()
      voice.filterNode.disconnect()
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
    this.activeVoices.clear()
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
