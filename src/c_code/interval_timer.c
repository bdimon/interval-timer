/**
 * @file interval_timer.c
 * @brief Core engine implementation for configurable interval timer.
 */

#include "interval_timer.h"

#ifdef _WIN32
  static DWORD original_console_mode;
#else
  static struct termios original_termios;
  static bool terminal_modified = false;
#endif

void timer_init(IntervalTimer* timer) {
    if (!timer) return;
    memset(timer, 0, sizeof(IntervalTimer));
    timer->current_phase = PHASE_IDLE;
    timer->previous_phase = PHASE_IDLE;
    timer->sound_enabled = true;
    timer->metronome_enabled = true;
}

void timer_set_plan(IntervalTimer* timer, const WorkoutPlan* plan) {
    if (!timer || !plan) return;
    timer->plan = *plan;
    timer_reset(timer);
}

void timer_reset(IntervalTimer* timer) {
    if (!timer) return;
    timer->is_running = false;
    timer->is_paused = false;
    timer->current_set_index = 0;
    timer->current_cycle_index = 0;
    timer->total_elapsed_seconds = 0;
    
    if (timer->plan.prep_seconds > 0) {
        timer->current_phase = PHASE_PREP;
        timer->seconds_in_phase = timer->plan.prep_seconds;
        timer->total_phase_seconds = timer->plan.prep_seconds;
    } else if (timer->plan.num_sets > 0) {
        timer->current_phase = PHASE_WORK;
        timer->seconds_in_phase = timer->plan.sets[0].work_seconds;
        timer->total_phase_seconds = timer->plan.sets[0].work_seconds;
    } else {
        timer->current_phase = PHASE_IDLE;
        timer->seconds_in_phase = 0;
        timer->total_phase_seconds = 0;
    }
    timer->previous_phase = timer->current_phase;
}

void timer_start(IntervalTimer* timer) {
    if (!timer || timer->plan.num_sets == 0) return;
    if (timer->current_phase == PHASE_IDLE || timer->current_phase == PHASE_COMPLETED) {
        timer_reset(timer);
    }
    timer->is_running = true;
    timer->is_paused = false;
}

void timer_pause(IntervalTimer* timer) {
    if (!timer || !timer->is_running || timer->is_paused) return;
    timer->is_paused = true;
    timer->previous_phase = timer->current_phase;
    timer->current_phase = PHASE_PAUSED;
    if (timer->on_phase_change) {
        timer->on_phase_change(timer->previous_phase, PHASE_PAUSED, timer, timer->user_data);
    }
}

void timer_resume(IntervalTimer* timer) {
    if (!timer || !timer->is_running || !timer->is_paused) return;
    timer->is_paused = false;
    TimerPhase resume_phase = timer->previous_phase;
    timer->current_phase = resume_phase;
    if (timer->on_phase_change) {
        timer->on_phase_change(PHASE_PAUSED, resume_phase, timer, timer->user_data);
    }
}

void timer_toggle_pause(IntervalTimer* timer) {
    if (!timer) return;
    if (timer->is_paused) {
        timer_resume(timer);
    } else if (timer->is_running) {
        timer_pause(timer);
    } else {
        timer_start(timer);
    }
}

static void transition_to_next_phase(IntervalTimer* timer) {
    TimerPhase old_phase = timer->current_phase;
    
    switch (old_phase) {
        case PHASE_PREP:
            /* Move to first work set */
            timer->current_phase = PHASE_WORK;
            timer->seconds_in_phase = timer->plan.sets[0].work_seconds;
            timer->total_phase_seconds = timer->plan.sets[0].work_seconds;
            if (timer->sound_enabled) timer_play_work_signal();
            break;
            
        case PHASE_WORK: {
            IntervalSet* current_set = &timer->plan.sets[timer->current_set_index];
            if (current_set->rest_seconds > 0) {
                /* Enter rest phase for this set */
                timer->current_phase = PHASE_REST;
                timer->seconds_in_phase = current_set->rest_seconds;
                timer->total_phase_seconds = current_set->rest_seconds;
                if (timer->sound_enabled) timer_play_rest_signal();
            } else {
                /* No rest, advance to next set directly */
                timer->current_set_index++;
                if (timer->current_set_index >= timer->plan.num_sets) {
                    /* End of cycle */
                    timer->current_set_index = 0;
                    timer->current_cycle_index++;
                    if (timer->current_cycle_index >= timer->plan.cycles) {
                        /* Workout finished */
                        timer->current_phase = PHASE_COMPLETED;
                        timer->is_running = false;
                        if (timer->sound_enabled) timer_play_complete_signal();
                        if (timer->on_complete) timer->on_complete(timer, timer->user_data);
                        return;
                    } else if (timer->plan.cycle_rest_seconds > 0) {
                        timer->current_phase = PHASE_CYCLE_REST;
                        timer->seconds_in_phase = timer->plan.cycle_rest_seconds;
                        timer->total_phase_seconds = timer->plan.cycle_rest_seconds;
                        if (timer->sound_enabled) timer_play_rest_signal();
                    } else {
                        timer->current_phase = PHASE_WORK;
                        timer->seconds_in_phase = timer->plan.sets[0].work_seconds;
                        timer->total_phase_seconds = timer->plan.sets[0].work_seconds;
                        if (timer->sound_enabled) timer_play_work_signal();
                    }
                } else {
                    timer->current_phase = PHASE_WORK;
                    timer->seconds_in_phase = timer->plan.sets[timer->current_set_index].work_seconds;
                    timer->total_phase_seconds = timer->plan.sets[timer->current_set_index].work_seconds;
                    if (timer->sound_enabled) timer_play_work_signal();
                }
            }
            break;
        }
        
        case PHASE_REST: {
            /* Rest finished, move to next set or cycle */
            timer->current_set_index++;
            if (timer->current_set_index >= timer->plan.num_sets) {
                /* End of sets in cycle */
                timer->current_set_index = 0;
                timer->current_cycle_index++;
                if (timer->current_cycle_index >= timer->plan.cycles) {
                    /* All cycles finished */
                    timer->current_phase = PHASE_COMPLETED;
                    timer->is_running = false;
                    if (timer->sound_enabled) timer_play_complete_signal();
                    if (timer->on_complete) timer->on_complete(timer, timer->user_data);
                    return;
                } else if (timer->plan.cycle_rest_seconds > 0) {
                    timer->current_phase = PHASE_CYCLE_REST;
                    timer->seconds_in_phase = timer->plan.cycle_rest_seconds;
                    timer->total_phase_seconds = timer->plan.cycle_rest_seconds;
                    if (timer->sound_enabled) timer_play_rest_signal();
                } else {
                    timer->current_phase = PHASE_WORK;
                    timer->seconds_in_phase = timer->plan.sets[0].work_seconds;
                    timer->total_phase_seconds = timer->plan.sets[0].work_seconds;
                    if (timer->sound_enabled) timer_play_work_signal();
                }
            } else {
                timer->current_phase = PHASE_WORK;
                timer->seconds_in_phase = timer->plan.sets[timer->current_set_index].work_seconds;
                timer->total_phase_seconds = timer->plan.sets[timer->current_set_index].work_seconds;
                if (timer->sound_enabled) timer_play_work_signal();
            }
            break;
        }
        
        case PHASE_CYCLE_REST:
            /* Break between cycles ended, start next cycle at set 0 */
            timer->current_phase = PHASE_WORK;
            timer->seconds_in_phase = timer->plan.sets[0].work_seconds;
            timer->total_phase_seconds = timer->plan.sets[0].work_seconds;
            if (timer->sound_enabled) timer_play_work_signal();
            break;
            
        default:
            break;
    }
    
    if (timer->on_phase_change) {
        timer->on_phase_change(old_phase, timer->current_phase, timer, timer->user_data);
    }
}

void timer_skip_next(IntervalTimer* timer) {
    if (!timer || !timer->is_running) return;
    transition_to_next_phase(timer);
}

void timer_tick_second(IntervalTimer* timer) {
    if (!timer || !timer->is_running || timer->is_paused) return;
    
    timer->total_elapsed_seconds++;
    
    /* Metronome tick & visual warning 3 seconds before end (at 3, 2, 1) */
    if (timer->seconds_in_phase <= 3 && timer->seconds_in_phase >= 1) {
        if (timer->metronome_enabled && timer->sound_enabled) {
            timer_play_metronome_tick();
        }
        if (timer->on_metronome) {
            timer->on_metronome(timer->seconds_in_phase, timer, timer->user_data);
        }
    }
    
    timer->seconds_in_phase--;
    
    if (timer->seconds_in_phase < 0) {
        transition_to_next_phase(timer);
    }
    
    if (timer->on_tick) {
        timer->on_tick(timer, timer->user_data);
    }
}

/* Audio Implementations */
void timer_play_sound(int frequency_hz, int duration_ms) {
#ifdef _WIN32
    Beep((DWORD)frequency_hz, (DWORD)duration_ms);
#else
    /* On POSIX terminals, output standard ASCII bell character */
    (void)frequency_hz;
    (void)duration_ms;
    printf("\a");
    fflush(stdout);
#endif
}

void timer_play_metronome_tick(void) {
#ifdef _WIN32
    Beep(1000, 70);
#else
    printf("\a");
    fflush(stdout);
#endif
}

void timer_play_work_signal(void) {
#ifdef _WIN32
    Beep(880, 150);
    Sleep(50);
    Beep(1174, 300);
#else
    printf("\a\a");
    fflush(stdout);
#endif
}

void timer_play_rest_signal(void) {
#ifdef _WIN32
    Beep(523, 200);
#else
    printf("\a");
    fflush(stdout);
#endif
}

void timer_play_complete_signal(void) {
#ifdef _WIN32
    Beep(587, 150);
    Beep(740, 150);
    Beep(880, 400);
#else
    printf("\a\a\a");
    fflush(stdout);
#endif
}

/* Persistence */
int timer_save_preset_to_file(const WorkoutPlan* plan, const char* filename) {
    if (!plan || !filename) return -1;
    FILE* f = fopen(filename, "a");
    if (!f) return -1;
    
    fprintf(f, "[PRESET]\n");
    fprintf(f, "name=%s\n", plan->name);
    fprintf(f, "prep=%d\n", plan->prep_seconds);
    fprintf(f, "cycles=%d\n", plan->cycles);
    fprintf(f, "cycle_rest=%d\n", plan->cycle_rest_seconds);
    fprintf(f, "num_sets=%d\n", plan->num_sets);
    for (int i = 0; i < plan->num_sets; i++) {
        fprintf(f, "set=%s,%d,%d\n", 
                plan->sets[i].name, 
                plan->sets[i].work_seconds, 
                plan->sets[i].rest_seconds);
    }
    fprintf(f, "[END_PRESET]\n\n");
    fclose(f);
    return 0;
}

int timer_load_presets_from_file(WorkoutPlan presets[], int max_presets, const char* filename) {
    if (!presets || !filename || max_presets <= 0) return 0;
    FILE* f = fopen(filename, "r");
    if (!f) return 0;
    
    char line[256];
    int count = 0;
    WorkoutPlan current;
    memset(&current, 0, sizeof(WorkoutPlan));
    bool in_preset = false;
    
    while (fgets(line, sizeof(line), f) && count < max_presets) {
        line[strcspn(line, "\r\n")] = 0; /* strip newline */
        if (strcmp(line, "[PRESET]") == 0) {
            memset(&current, 0, sizeof(WorkoutPlan));
            in_preset = true;
        } else if (strcmp(line, "[END_PRESET]") == 0) {
            if (in_preset && current.num_sets > 0) {
                presets[count++] = current;
            }
            in_preset = false;
        } else if (in_preset) {
            if (strncmp(line, "name=", 5) == 0) {
                strncpy(current.name, line + 5, MAX_NAME_LEN - 1);
            } else if (strncmp(line, "prep=", 5) == 0) {
                current.prep_seconds = atoi(line + 5);
            } else if (strncmp(line, "cycles=", 7) == 0) {
                current.cycles = atoi(line + 7);
            } else if (strncmp(line, "cycle_rest=", 11) == 0) {
                current.cycle_rest_seconds = atoi(line + 11);
            } else if (strncmp(line, "set=", 4) == 0 && current.num_sets < MAX_SETS) {
                char* token = strtok(line + 4, ",");
                if (token) {
                    strncpy(current.sets[current.num_sets].name, token, MAX_NAME_LEN - 1);
                    token = strtok(NULL, ",");
                    if (token) current.sets[current.num_sets].work_seconds = atoi(token);
                    token = strtok(NULL, ",");
                    if (token) current.sets[current.num_sets].rest_seconds = atoi(token);
                    current.num_sets++;
                }
            }
        }
    }
    fclose(f);
    return count;
}

void timer_get_default_presets(WorkoutPlan presets[], int* count) {
    if (!presets || !count) return;
    int idx = 0;
    
    /* 1. Classic Tabata (20s work, 10s rest, 8 sets, 1 cycle) */
    strncpy(presets[idx].name, "Classic Tabata (20/10)", MAX_NAME_LEN - 1);
    presets[idx].prep_seconds = 5;
    presets[idx].cycles = 1;
    presets[idx].cycle_rest_seconds = 0;
    presets[idx].num_sets = 8;
    for (int i = 0; i < 8; i++) {
        snprintf(presets[idx].sets[i].name, MAX_NAME_LEN, "Tabata Round %d", i + 1);
        presets[idx].sets[i].work_seconds = 20;
        presets[idx].sets[i].rest_seconds = 10;
    }
    idx++;
    
    /* 2. Complex HIIT Pyramid (Individual work/rest per set) */
    strncpy(presets[idx].name, "HIIT Pyramid (Variable Sets)", MAX_NAME_LEN - 1);
    presets[idx].prep_seconds = 10;
    presets[idx].cycles = 2;
    presets[idx].cycle_rest_seconds = 60;
    presets[idx].num_sets = 5;
    
    strncpy(presets[idx].sets[0].name, "Pyramid Step 1 (Warmup)", MAX_NAME_LEN - 1);
    presets[idx].sets[0].work_seconds = 30; presets[idx].sets[0].rest_seconds = 15;
    
    strncpy(presets[idx].sets[1].name, "Pyramid Step 2 (Moderate)", MAX_NAME_LEN - 1);
    presets[idx].sets[1].work_seconds = 45; presets[idx].sets[1].rest_seconds = 20;
    
    strncpy(presets[idx].sets[2].name, "Pyramid Step 3 (PEAK)", MAX_NAME_LEN - 1);
    presets[idx].sets[2].work_seconds = 60; presets[idx].sets[2].rest_seconds = 30;
    
    strncpy(presets[idx].sets[3].name, "Pyramid Step 4 (Down)", MAX_NAME_LEN - 1);
    presets[idx].sets[3].work_seconds = 45; presets[idx].sets[3].rest_seconds = 20;
    
    strncpy(presets[idx].sets[4].name, "Pyramid Step 5 (Sprint)", MAX_NAME_LEN - 1);
    presets[idx].sets[4].work_seconds = 30; presets[idx].sets[4].rest_seconds = 15;
    idx++;
    
    /* 3. Boxing Championship Rounds (3m work, 1m rest, 5 rounds) */
    strncpy(presets[idx].name, "Boxing 5 Rounds", MAX_NAME_LEN - 1);
    presets[idx].prep_seconds = 10;
    presets[idx].cycles = 1;
    presets[idx].cycle_rest_seconds = 0;
    presets[idx].num_sets = 5;
    for (int i = 0; i < 5; i++) {
        snprintf(presets[idx].sets[i].name, MAX_NAME_LEN, "Round %d", i + 1);
        presets[idx].sets[i].work_seconds = 180;
        presets[idx].sets[i].rest_seconds = 60;
    }
    idx++;
    
    *count = idx;
}

int timer_log_session_to_file(const SessionRecord* record, const char* filename) {
    if (!record || !filename) return -1;
    FILE* f = fopen(filename, "a");
    if (!f) return -1;
    
    fprintf(f, "[%s] Plan: \"%s\" | Duration: %02d:%02d | Sets: %d/%d | Cycles: %d/%d | Status: %s\n",
            record->timestamp,
            record->plan_name,
            record->total_duration_seconds / 60,
            record->total_duration_seconds % 60,
            record->sets_completed,
            record->total_sets,
            record->cycles_completed,
            record->total_cycles,
            record->completed_fully ? "COMPLETED" : "STOPPED");
    fclose(f);
    return 0;
}

/* Cross-Platform Terminal Input Helpers */
void console_init_terminal(void) {
#ifdef _WIN32
    HANDLE hIn = GetStdHandle(STD_INPUT_HANDLE);
    GetConsoleMode(hIn, &original_console_mode);
    DWORD mode = original_console_mode & ~(ENABLE_LINE_INPUT | ENABLE_ECHO_INPUT);
    SetConsoleMode(hIn, mode);
#else
    if (!terminal_modified) {
        tcgetattr(STDIN_FILENO, &original_termios);
        struct termios raw = original_termios;
        raw.c_lflag &= ~(ICANON | ECHO);
        tcsetattr(STDIN_FILENO, TCSANOW, &raw);
        terminal_modified = true;
    }
#endif
}

void console_reset_terminal(void) {
#ifdef _WIN32
    HANDLE hIn = GetStdHandle(STD_INPUT_HANDLE);
    SetConsoleMode(hIn, original_console_mode);
#else
    if (terminal_modified) {
        tcsetattr(STDIN_FILENO, TCSANOW, &original_termios);
        terminal_modified = false;
    }
#endif
}

int console_kbhit(void) {
#ifdef _WIN32
    return _kbhit();
#else
    struct timeval tv = { 0L, 0L };
    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(STDIN_FILENO, &fds);
    return select(STDIN_FILENO + 1, &fds, NULL, NULL, &tv) > 0;
#endif
}

int console_getch(void) {
#ifdef _WIN32
    return _getch();
#else
    char c = 0;
    if (read(STDIN_FILENO, &c, 1) < 0) return 0;
    return c;
#endif
}

void console_clear_screen(void) {
    /* ANSI escape sequence for clear screen and home cursor */
    printf("\033[2J\033[H");
    fflush(stdout);
}

const char* timer_phase_to_string(TimerPhase phase) {
    switch (phase) {
        case PHASE_IDLE: return "IDLE / ОЖИДАНИЕ";
        case PHASE_PREP: return "PREPARATION / ПОДГОТОВКА";
        case PHASE_WORK: return "WORK / РАБОТА";
        case PHASE_REST: return "REST / ОТДЫХ";
        case PHASE_CYCLE_REST: return "CYCLE REST / ОТДЫХ МЕЖДУ ЦИКЛАМИ";
        case PHASE_PAUSED: return "PAUSED / ПАУЗА";
        case PHASE_COMPLETED: return "COMPLETED / ЗАВЕРШЕНО";
        default: return "UNKNOWN";
    }
}
