package com.intervaltimer.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.sin

/**
 * High-precision, zero-asset tone generator for Android using AudioTrack.
 * Matches frequencies from interval_timer.c and Web Audio API:
 * - Work signal: 880 Hz
 * - Rest signal: 440 Hz
 * - 3s Metronome: 660 Hz -> 770 Hz -> 880 Hz
 * - Completion Fanfare: C5 (523) -> E5 (659) -> G5 (784) -> C6 (1046)
 */
class AndroidAudioEngine {

    private val audioScope = CoroutineScope(Dispatchers.Default)
    private val sampleRate = 44100

    /**
     * Plays a pure sine wave with smooth attack/decay envelope to prevent speaker pop
     */
    fun playTone(frequencyHz: Double, durationMs: Int, volume: Float = 0.85f) {
        audioScope.launch {
            try {
                val numSamples = (sampleRate * (durationMs / 1000.0)).toInt()
                val generatedSnd = ShortArray(numSamples)
                val rampSamples = (sampleRate * 0.015).toInt() // 15ms anti-pop ramp

                for (i in 0 until numSamples) {
                    val angle = 2.0 * Math.PI * i / (sampleRate / frequencyHz)
                    var sample = sin(angle)

                    // Attack envelope
                    if (i < rampSamples) {
                        sample *= (i.toDouble() / rampSamples)
                    }
                    // Decay envelope
                    if (i > numSamples - rampSamples) {
                        sample *= ((numSamples - i).toDouble() / rampSamples)
                    }

                    generatedSnd[i] = (sample * 32767 * volume).toInt().toShort()
                }

                val audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()

                val audioFormat = AudioFormat.Builder()
                    .setSampleRate(sampleRate)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()

                val track = AudioTrack.Builder()
                    .setAudioAttributes(audioAttributes)
                    .setAudioFormat(audioFormat)
                    .setBufferSizeInBytes(generatedSnd.size * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                track.write(generatedSnd, 0, generatedSnd.size)
                track.play()

                // Release track after playback completes
                Thread.sleep(durationMs.toLong() + 50)
                track.stop()
                track.release()
            } catch (e: Exception) {
                // Audio failure safeguard
                System.err.println("AndroidAudioEngine error: ${e.message}")
            }
        }
    }

    fun playWorkSignal() = playTone(880.0, 300, 0.9f)

    fun playRestSignal() = playTone(440.0, 300, 0.8f)

    fun playMetronomeTick(remainingSeconds: Int) {
        val freq = when (remainingSeconds) {
            3 -> 660.0
            2 -> 770.0
            1 -> 880.0
            else -> 660.0
        }
        playTone(freq, 120, 0.75f)
    }

    fun playFinalSetHorn() {
        audioScope.launch {
            playTone(587.33, 180, 0.85f)
            Thread.sleep(190)
            playTone(880.0, 450, 0.95f)
        }
    }

    fun playCompletionFanfare() {
        audioScope.launch {
            val notes = doubleArrayOf(523.25, 659.25, 783.99, 1046.50) // C5, E5, G5, C6
            for (i in notes.indices) {
                val duration = if (i == notes.size - 1) 500 else 180
                playTone(notes[i], duration, 0.9f)
                Thread.sleep(200)
            }
        }
    }
}
