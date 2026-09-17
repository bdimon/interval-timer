/**
 * @file interval_timer.h
 * @brief Core engine for configurable interval timer.
 * Designed for cross-platform portability: CLI, GUI (Raylib/GTK/SDL),
 * Web (WebAssembly), and Mobile (Android NDK / iOS).
 */

#ifndef INTERVAL_TIMER_H
#define INTERVAL_TIMER_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#ifdef _WIN32
  #include <windows.h>
  #include <conio.h>
#else
  #include <unistd.h>
  #include <termios.h>
  #include <sys/select.h>
#endif

#define MAX_SETS 64
#define MAX_NAME_LEN 64
#define MAX_PRESETS 32
#define DEFAULT_LOG_FILE "workout_history.log"
#define DEFAULT_PRESETS_FILE "workout_presets.conf"

/**
 * @brief Phases of interval timer execution
 */
typedef enum {
    PHASE_IDLE = 0,
    PHASE_PREP,
    PHASE_WORK,
    PHASE_REST,
    PHASE_CYCLE_REST,
    PHASE_PAUSED,
    PHASE_COMPLETED
} TimerPhase;

/**
 * @brief Individual interval set definition
 * Allows custom work and rest durations for each set.
 */
typedef struct {
    char name[MAX_NAME_LEN];
    int work_seconds;
    int rest_seconds;
    int sound_work_freq;   /* Optional custom frequency in Hz (default 880) */
    int sound_rest_freq;   /* Optional custom frequency in Hz (default 440) */
} IntervalSet;

/**
 * @brief Workout plan / template
 */
typedef struct {
    char name[MAX_NAME_LEN];
    int prep_seconds;          /* Countdown before workout begins */
    int cycles;                /* How many times to repeat all sets */
    int cycle_rest_seconds;    /* Rest between cycles */
    int num_sets;              /* Number of individual sets */
    IntervalSet sets[MAX_SETS];
} WorkoutPlan;

/**
 * @brief Completed workout session record for journaling
 */
typedef struct {
    char plan_name[MAX_NAME_LEN];
    char timestamp[32];
    int total_duration_seconds;
    int sets_completed;
    int total_sets;
    int cycles_completed;
    int total_cycles;
    bool completed_fully;
} SessionRecord;

/* Forward declaration */
struct IntervalTimer;

/**
 * @brief Callbacks for UI independence (CLI, GUI, WebAssembly, Android)
 */
typedef void (*TimerTickCallback)(const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerPhaseChangeCallback)(TimerPhase old_phase, TimerPhase new_phase, const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerMetronomeCallback)(int remaining_seconds, const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerCompleteCallback)(const struct IntervalTimer* timer, void* user_data);

/**
 * @brief Main Interval Timer Engine state
 */
typedef struct IntervalTimer {
    WorkoutPlan plan;
    TimerPhase current_phase;
    TimerPhase previous_phase; /* Used to resume from pause */
    
    int current_set_index;    /* 0-indexed */
    int current_cycle_index;  /* 0-indexed */
    int seconds_in_phase;     /* Remaining seconds in active phase */
    int total_phase_seconds;  /* Total duration of active phase */
    int total_elapsed_seconds;/* Running total */
    
    bool is_running;
    bool is_paused;
    bool sound_enabled;
    bool metronome_enabled;
    
    /* Callbacks */
    TimerTickCallback on_tick;
    TimerPhaseChangeCallback on_phase_change;
    TimerMetronomeCallback on_metronome;
    TimerCompleteCallback on_complete;
    void* user_data;
} IntervalTimer;

/* Timer Engine API */
void timer_init(IntervalTimer* timer);
void timer_set_plan(IntervalTimer* timer, const WorkoutPlan* plan);
void timer_start(IntervalTimer* timer);
void timer_pause(IntervalTimer* timer);
void timer_resume(IntervalTimer* timer);
void timer_toggle_pause(IntervalTimer* timer);
void timer_reset(IntervalTimer* timer);
void timer_skip_next(IntervalTimer* timer);
void timer_tick_second(IntervalTimer* timer);

/* Audio & Visual Utilities (Standard C & Platform implementations) */
void timer_play_sound(int frequency_hz, int duration_ms);
void timer_play_metronome_tick(void);
void timer_play_work_signal(void);
void timer_play_rest_signal(void);
void timer_play_complete_signal(void);

/* Presets & Persistence API */
int timer_save_preset_to_file(const WorkoutPlan* plan, const char* filename);
int timer_load_presets_from_file(WorkoutPlan presets[], int max_presets, const char* filename);
void timer_get_default_presets(WorkoutPlan presets[], int* count);

/* Journaling API */
int timer_log_session_to_file(const SessionRecord* record, const char* filename);

/* Cross-Platform Terminal Input Helpers */
int console_kbhit(void);
int console_getch(void);
void console_init_terminal(void);
void console_reset_terminal(void);
void console_clear_screen(void);

const char* timer_phase_to_string(TimerPhase phase);

#endif /* INTERVAL_TIMER_H */
