package com.intervaltimer.core

/**
 * Phase enumeration matching ANSI C TimerPhase in interval_timer.h
 */
enum class TimerPhase(val id: Int, val displayNameRu: String, val displayNameEn: String) {
    IDLE(0, "Ожидание", "Idle"),
    PREP(1, "Подготовка", "Preparation"),
    WORK(2, "Работа", "Work"),
    REST(3, "Отдых", "Rest"),
    CYCLE_REST(4, "Отдых между циклами", "Cycle Rest"),
    PAUSED(5, "Пауза", "Paused"),
    COMPLETED(6, "Завершено", "Completed");

    companion object {
        fun fromId(id: Int): TimerPhase = entries.firstOrNull { it.id == id } ?: IDLE
    }
}

/**
 * Interval set definition matching C IntervalSet
 */
data class IntervalSet(
    @JvmField val name: String,
    @JvmField val workSeconds: Int,
    @JvmField val restSeconds: Int,
    @JvmField val soundWorkFreq: Int = 880,
    @JvmField val soundRestFreq: Int = 440
)

/**
 * Workout plan matching C WorkoutPlan
 */
data class WorkoutPlan(
    val name: String,
    val prepSeconds: Int = 5,
    val cycles: Int = 1,
    val cycleRestSeconds: Int = 30,
    val sets: List<IntervalSet>
)

/**
 * Real-time state snapshot
 */
data class TimerSnapshot(
    val phase: TimerPhase,
    val secondsRemaining: Int,
    val totalPhaseSeconds: Int,
    val currentSetIndex: Int,
    val currentCycleIndex: Int,
    val totalElapsedSeconds: Int,
    val isRunning: Boolean,
    val isPaused: Boolean
) {
    val progressFraction: Float
        get() = if (totalPhaseSeconds > 0) {
            1f - (secondsRemaining.toFloat() / totalPhaseSeconds.toFloat())
        } else 0f
}

/**
 * Callback interface invoked from C JNI on state changes
 */
interface NativeTimerListener {
    fun onNativeTick(phase: Int, secondsRemaining: Int, totalPhaseSeconds: Int, currentSet: Int, currentCycle: Int, totalElapsed: Int)
    fun onNativePhaseChange(oldPhase: Int, newPhase: Int)
    fun onNativeMetronome(remainingSeconds: Int)
    fun onNativeComplete(totalElapsedSeconds: Int)
}

/**
 * JNI Bridge singleton providing access to compiled C engine (libinterval_timer_native.so)
 */
object IntervalTimerNative {
    init {
        try {
            System.loadLibrary("interval_timer_native")
        } catch (e: UnsatisfiedLinkError) {
            System.err.println("IntervalTimerNative: Failed to load shared library: ${e.message}")
        }
    }

    external fun nativeInit()
    external fun nativeRegisterListener(listener: NativeTimerListener)
    external fun nativeUnregisterListener()

    external fun nativeSetPlan(
        name: String,
        prepSeconds: Int,
        cycles: Int,
        cycleRestSeconds: Int,
        sets: Array<IntervalSet>
    )

    external fun nativeStart()
    external fun nativePause()
    external fun nativeResume()
    external fun nativeTogglePause()
    external fun nativeReset()
    external fun nativeSkipNext()
    external fun nativeTickSecond()

    external fun nativeGetPhase(): Int
    external fun nativeGetSecondsRemaining(): Int
    external fun nativeGetTotalPhaseSeconds(): Int
    external fun nativeGetCurrentSet(): Int
    external fun nativeGetCurrentCycle(): Int
    external fun nativeGetTotalElapsed(): Int
    external fun nativeIsRunning(): Boolean
    external fun nativeIsPaused(): Boolean

    /**
     * High-level helper returning snapshot
     */
    fun getSnapshot(): TimerSnapshot {
        return TimerSnapshot(
            phase = TimerPhase.fromId(nativeGetPhase()),
            secondsRemaining = nativeGetSecondsRemaining(),
            totalPhaseSeconds = nativeGetTotalPhaseSeconds(),
            currentSetIndex = nativeGetCurrentSet(),
            currentCycleIndex = nativeGetCurrentCycle(),
            totalElapsedSeconds = nativeGetTotalElapsed(),
            isRunning = nativeIsRunning(),
            isPaused = nativeIsPaused()
        )
    }

    /**
     * Configure plan convenience method
     */
    fun configurePlan(plan: WorkoutPlan) {
        nativeSetPlan(
            name = plan.name,
            prepSeconds = plan.prepSeconds,
            cycles = plan.cycles,
            cycleRestSeconds = plan.cycleRestSeconds,
            sets = plan.sets.toTypedArray()
        )
    }
}
