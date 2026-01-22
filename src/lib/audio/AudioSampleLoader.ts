/**
 * Utility to load and manage harmonium audio samples
 */

export class AudioSampleLoader {
  private audioContext: AudioContext
  private sampleBuffer: AudioBuffer | null = null
  private sampleMidiNote: number = 60 // C4 - the note the sample is recorded at

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
  }

  /**
   * Load harmonium audio sample from file
   */
  async loadSample(url: string, sampleMidiNote: number = 60): Promise<void> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load audio sample: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      this.sampleBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.sampleMidiNote = sampleMidiNote
    } catch (error) {
      console.error('Error loading audio sample:', error)
      throw error
    }
  }

  /**
   * Get the loaded sample buffer
   */
  getSampleBuffer(): AudioBuffer | null {
    return this.sampleBuffer
  }

  /**
   * Get the MIDI note the sample was recorded at
   */
  getSampleMidiNote(): number {
    return this.sampleMidiNote
  }

  /**
   * Check if sample is loaded
   */
  isLoaded(): boolean {
    return this.sampleBuffer !== null
  }

  /**
   * Calculate playback rate for a target MIDI note
   * Formula: playbackRate = 2^((targetNote - sampleNote) / 12)
   */
  calculatePlaybackRate(targetMidiNote: number): number {
    if (!this.sampleBuffer) {
      return 1.0
    }

    const semitones = targetMidiNote - this.sampleMidiNote
    return Math.pow(2, semitones / 12)
  }
}
