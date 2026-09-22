package com.intervaltimer

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.intervaltimer.core.IntervalSet
import com.intervaltimer.core.TimerPhase
import com.intervaltimer.core.WorkoutPlan
import com.intervaltimer.service.TimerForegroundService

class MainActivity : ComponentActivity() {

    private var timerService: TimerForegroundService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as TimerForegroundService.LocalBinder
            timerService = binder.getService()
            isBound = true

            // Load default Tabata plan if idle
            if (timerService?.timerState?.value?.phase == TimerPhase.IDLE) {
                val tabata = WorkoutPlan(
                    name = "Табата (Классика)",
                    prepSeconds = 5,
                    cycles = 1,
                    cycleRestSeconds = 0,
                    sets = List(8) { i ->
                        IntervalSet(name = "Интервал ${i + 1}", workSeconds = 20, restSeconds = 10)
                    }
                )
                timerService?.loadPlan(tabata)
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            timerService = null
            isBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 101)
        }

        val serviceIntent = Intent(this, TimerForegroundService::class.java)
        startService(serviceIntent)
        bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A) // Slate 900
                ) {
                    val service = timerService
                    val snapshot by (service?.timerState?.collectAsState() ?: remember {
                        mutableStateOf(com.intervaltimer.core.IntervalTimerNative.getSnapshot())
                    })

                    TimerMainScreen(
                        snapshot = snapshot,
                        onStart = { service?.startWorkout() },
                        onPause = { service?.pauseWorkout() },
                        onResume = { service?.resumeWorkout() },
                        onSkip = { service?.skipNext() },
                        onReset = { service?.stopWorkout() }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
        super.onDestroy()
    }
}

@Composable
fun TimerMainScreen(
    snapshot: com.intervaltimer.core.TimerSnapshot,
    onStart: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onSkip: () -> Unit,
    onReset: () -> Unit
) {
    val phaseColor = when (snapshot.phase) {
        TimerPhase.PREP -> Color(0xFFF59E0B)       // Amber
        TimerPhase.WORK -> Color(0xFF10B981)       // Emerald
        TimerPhase.REST -> Color(0xFF3B82F6)       // Blue
        TimerPhase.CYCLE_REST -> Color(0xFF8B5CF6) // Purple
        TimerPhase.PAUSED -> Color(0xFFEF4444)     // Red
        TimerPhase.COMPLETED -> Color(0xFFEC4899)  // Pink
        TimerPhase.IDLE -> Color(0xFF64748B)       // Slate
    }

    val minutes = snapshot.secondsRemaining / 60
    val seconds = snapshot.secondsRemaining % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "INTERVAL TIMER C",
                color = Color(0xFF94A3B8),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = snapshot.phase.displayNameRu.uppercase(),
                color = phaseColor,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }

        // Circular Timer Display
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(280.dp)
        ) {
            CircularProgressIndicator(
                progress = { snapshot.progressFraction },
                modifier = Modifier.fillMaxSize(),
                color = phaseColor,
                strokeWidth = 14.dp,
                trackColor = Color(0xFF1E293B)
            )

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = timeFormatted,
                    color = Color.White,
                    fontSize = 64.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Сет ${snapshot.currentSetIndex + 1} • Цикл ${snapshot.currentCycleIndex + 1}",
                    color = Color(0xFF94A3B8),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Control Buttons
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Reset / Stop
            FilledTonalButton(
                onClick = onReset,
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = Color(0xFF334155),
                    contentColor = Color.White
                )
            ) {
                Text("Сброс")
            }

            // Main Play / Pause Button
            Button(
                onClick = {
                    if (!snapshot.isRunning) onStart()
                    else if (snapshot.isPaused) onResume()
                    else onPause()
                },
                modifier = Modifier.height(56.dp),
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(containerColor = phaseColor)
            ) {
                val label = if (!snapshot.isRunning) "СТАРТ"
                else if (snapshot.isPaused) "ПРОДОЛЖИТЬ"
                else "ПАУЗА"
                Text(
                    text = label,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color.White
                )
            }

            // Skip Button
            FilledTonalButton(
                onClick = onSkip,
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = Color(0xFF334155),
                    contentColor = Color.White
                )
            ) {
                Text("След.")
            }
        }
    }
}
