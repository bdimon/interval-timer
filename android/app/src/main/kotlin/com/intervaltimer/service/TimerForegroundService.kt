package com.intervaltimer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.intervaltimer.audio.AndroidAudioEngine
import com.intervaltimer.core.IntervalTimerNative
import com.intervaltimer.core.NativeTimerListener
import com.intervaltimer.core.TimerPhase
import com.intervaltimer.core.TimerSnapshot
import com.intervaltimer.core.WorkoutPlan
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/**
 * Foreground Service responsible for:
 * 1. Keeping CPU alive during workout with Partial WakeLock.
 * 2. Ticking C native engine (timer_tick_second).
 * 3. Emitting real-time StateFlow for Jetpack Compose UI.
 * 4. Playing acoustic signals on phase changes and metronome.
 * 5. Displaying ongoing notification with live controls.
 */
class TimerForegroundService : Service(), NativeTimerListener {

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null
    private val audioEngine = AndroidAudioEngine()

    private val _timerState = MutableStateFlow(IntervalTimerNative.getSnapshot())
    val timerState: StateFlow<TimerSnapshot> = _timerState.asStateFlow()

    private val tickerExecutor = Executors.newSingleThreadScheduledExecutor()
    private var tickerTask: ScheduledFuture<*>? = null

    companion object {
        const val CHANNEL_ID = "interval_timer_running_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "com.intervaltimer.ACTION_START"
        const val ACTION_PAUSE = "com.intervaltimer.ACTION_PAUSE"
        const val ACTION_RESUME = "com.intervaltimer.ACTION_RESUME"
        const val ACTION_TOGGLE = "com.intervaltimer.ACTION_TOGGLE"
        const val ACTION_SKIP = "com.intervaltimer.ACTION_SKIP"
        const val ACTION_STOP = "com.intervaltimer.ACTION_STOP"
    }

    inner class LocalBinder : Binder() {
        fun getService(): TimerForegroundService = this@TimerForegroundService
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        IntervalTimerNative.nativeInit()
        IntervalTimerNative.nativeRegisterListener(this)
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startWorkout()
            ACTION_PAUSE -> pauseWorkout()
            ACTION_RESUME -> resumeWorkout()
            ACTION_TOGGLE -> togglePause()
            ACTION_SKIP -> skipNext()
            ACTION_STOP -> stopWorkout()
        }
        return START_STICKY
    }

    fun loadPlan(plan: WorkoutPlan) {
        IntervalTimerNative.configurePlan(plan)
        _timerState.value = IntervalTimerNative.getSnapshot()
    }

    fun startWorkout() {
        acquireWakeLock()
        IntervalTimerNative.nativeStart()
        startForeground(NOTIFICATION_ID, buildNotification(_timerState.value))
        startTicker()
    }

    fun pauseWorkout() {
        IntervalTimerNative.nativePause()
        stopTicker()
        updateNotification(_timerState.value)
    }

    fun resumeWorkout() {
        IntervalTimerNative.nativeResume()
        startTicker()
        updateNotification(_timerState.value)
    }

    fun togglePause() {
        if (_timerState.value.isPaused) {
            resumeWorkout()
        } else {
            pauseWorkout()
        }
    }

    fun skipNext() {
        IntervalTimerNative.nativeSkipNext()
        _timerState.value = IntervalTimerNative.getSnapshot()
        updateNotification(_timerState.value)
    }

    fun stopWorkout() {
        stopTicker()
        IntervalTimerNative.nativeReset()
        releaseWakeLock()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startTicker() {
        tickerTask?.cancel(false)
        tickerTask = tickerExecutor.scheduleAtFixedRate({
            IntervalTimerNative.nativeTickSecond()
            val snapshot = IntervalTimerNative.getSnapshot()
            _timerState.value = snapshot
            updateNotification(snapshot)
        }, 1, 1, TimeUnit.SECONDS)
    }

    private fun stopTicker() {
        tickerTask?.cancel(false)
        tickerTask = null
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "IntervalTimer::WorkoutWakeLock")
            wakeLock?.acquire(3 * 60 * 60 * 1000L) // 3 hours safety timeout
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wakeLock = null
    }

    /* Native Callbacks from C */
    override fun onNativeTick(
        phase: Int,
        secondsRemaining: Int,
        totalPhaseSeconds: Int,
        currentSet: Int,
        currentCycle: Int,
        totalElapsed: Int
    ) {
        // Real-time snapshot is automatically updated
    }

    override fun onNativePhaseChange(oldPhase: Int, newPhase: Int) {
        val phase = TimerPhase.fromId(newPhase)
        when (phase) {
            TimerPhase.WORK -> audioEngine.playWorkSignal()
            TimerPhase.REST, TimerPhase.CYCLE_REST -> audioEngine.playRestSignal()
            TimerPhase.COMPLETED -> audioEngine.playCompletionFanfare()
            else -> {}
        }
    }

    override fun onNativeMetronome(remainingSeconds: Int) {
        audioEngine.playMetronomeTick(remainingSeconds)
    }

    override fun onNativeComplete(totalElapsedSeconds: Int) {
        audioEngine.playCompletionFanfare()
        stopTicker()
        releaseWakeLock()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Интервальный таймер (Фоновый режим)",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Отображает текущую фазу и обратный отсчет во время тренировки"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(snapshot: TimerSnapshot): Notification {
        val minutes = snapshot.secondsRemaining / 60
        val seconds = snapshot.secondsRemaining % 60
        val timeString = String.format("%02d:%02d", minutes, seconds)

        val toggleIntent = Intent(this, TimerForegroundService::class.java).apply {
            action = ACTION_TOGGLE
        }
        val togglePending = PendingIntent.getService(this, 1, toggleIntent, PendingIntent.FLAG_IMMUTABLE)

        val skipIntent = Intent(this, TimerForegroundService::class.java).apply {
            action = ACTION_SKIP
        }
        val skipPending = PendingIntent.getService(this, 2, skipIntent, PendingIntent.FLAG_IMMUTABLE)

        val toggleTitle = if (snapshot.isPaused) "Старт" else "Пауза"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("${snapshot.phase.displayNameRu}: $timeString")
            .setContentText("Сет ${snapshot.currentSetIndex + 1} • Цикл ${snapshot.currentCycleIndex + 1}")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(snapshot.isRunning && !snapshot.isPaused)
            .setOnlyAlertOnce(true)
            .addAction(android.R.drawable.ic_media_pause, toggleTitle, togglePending)
            .addAction(android.R.drawable.ic_media_next, "След. интервал", skipPending)
            .setProgress(snapshot.totalPhaseSeconds, snapshot.totalPhaseSeconds - snapshot.secondsRemaining, false)
            .build()
    }

    private fun updateNotification(snapshot: TimerSnapshot) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildNotification(snapshot))
    }

    override fun onDestroy() {
        stopTicker()
        releaseWakeLock()
        IntervalTimerNative.nativeUnregisterListener()
        super.onDestroy()
    }
}
