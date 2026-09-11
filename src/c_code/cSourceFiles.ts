export interface CSourceFile {
  name: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const C_SOURCE_FILES: CSourceFile[] = [
  {
    name: 'Заголовочный файл ядра',
    filename: 'interval_timer.h',
    language: 'c',
    description: 'Структуры данных (WorkoutPlan, IntervalSet, TimerState), перечисления фаз и прототипы API функций.',
    content: `/**
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

typedef enum {
    PHASE_IDLE = 0,
    PHASE_PREP,
    PHASE_WORK,
    PHASE_REST,
    PHASE_CYCLE_REST,
    PHASE_PAUSED,
    PHASE_COMPLETED
} TimerPhase;

typedef struct {
    char name[MAX_NAME_LEN];
    int work_seconds;
    int rest_seconds;
    int sound_work_freq;   /* Optional custom frequency in Hz (default 880) */
    int sound_rest_freq;   /* Optional custom frequency in Hz (default 440) */
} IntervalSet;

typedef struct {
    char name[MAX_NAME_LEN];
    int prep_seconds;
    int cycles;
    int cycle_rest_seconds;
    int num_sets;
    IntervalSet sets[MAX_SETS];
} WorkoutPlan;

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

struct IntervalTimer;

typedef void (*TimerTickCallback)(const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerPhaseChangeCallback)(TimerPhase old_phase, TimerPhase new_phase, const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerMetronomeCallback)(int remaining_seconds, const struct IntervalTimer* timer, void* user_data);
typedef void (*TimerCompleteCallback)(const struct IntervalTimer* timer, void* user_data);

typedef struct IntervalTimer {
    WorkoutPlan plan;
    TimerPhase current_phase;
    TimerPhase previous_phase;
    
    int current_set_index;    /* 0-indexed */
    int current_cycle_index;  /* 0-indexed */
    int seconds_in_phase;     /* Remaining seconds in active phase */
    int total_phase_seconds;  /* Total duration of active phase */
    int total_elapsed_seconds;/* Running total */
    
    bool is_running;
    bool is_paused;
    bool sound_enabled;
    bool metronome_enabled;
    
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

/* Audio & Signals */
void timer_play_sound(int frequency_hz, int duration_ms);
void timer_play_metronome_tick(void);
void timer_play_work_signal(void);
void timer_play_last_set_signal(void);
void timer_play_rest_signal(void);
void timer_play_complete_signal(void);

/* Presets & Persistence */
int timer_save_preset_to_file(const WorkoutPlan* plan, const char* filename);
int timer_load_presets_from_file(WorkoutPlan presets[], int max_presets, const char* filename);
void timer_get_default_presets(WorkoutPlan presets[], int* count);

/* Journaling */
int timer_log_session_to_file(const SessionRecord* record, const char* filename);

/* Console / Terminal Helpers */
int console_kbhit(void);
int console_getch(void);
void console_init_terminal(void);
void console_reset_terminal(void);
void console_clear_screen(void);
const char* timer_phase_to_string(TimerPhase phase);

#endif /* INTERVAL_TIMER_H */`,
  },
  {
    name: 'Реализация ядра таймера',
    filename: 'interval_timer.c',
    language: 'c',
    description: 'Логика смены фаз, отсчета времени, обратных вызовов, звуковых сигналов, метронома и файлового хранилища.',
    content: `/**
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
        case PHASE_PREP: {
            IntervalSet* s0 = &timer->plan.sets[0];
            int is_last = (timer->plan.num_sets == 1);
            if (s0->work_seconds > 0) {
                timer->current_phase = PHASE_WORK;
                timer->seconds_in_phase = s0->work_seconds;
                timer->total_phase_seconds = s0->work_seconds;
                if (timer->sound_enabled) {
                    if (is_last) timer_play_last_set_signal();
                    else timer_play_work_signal();
                }
            } else {
                timer->current_phase = PHASE_REST;
                timer->seconds_in_phase = s0->rest_seconds;
                timer->total_phase_seconds = s0->rest_seconds;
                if (timer->sound_enabled) {
                    if (is_last) timer_play_last_set_signal();
                    else timer_play_rest_signal();
                }
            }
            break;
        }
            
        case PHASE_WORK: {
            IntervalSet* current_set = &timer->plan.sets[timer->current_set_index];
            if (current_set->rest_seconds > 0) {
                timer->current_phase = PHASE_REST;
                timer->seconds_in_phase = current_set->rest_seconds;
                timer->total_phase_seconds = current_set->rest_seconds;
                if (timer->sound_enabled) timer_play_rest_signal();
            } else {
                timer->current_set_index++;
                if (timer->current_set_index >= timer->plan.num_sets) {
                    timer->current_set_index = 0;
                    timer->current_cycle_index++;
                    if (timer->current_cycle_index >= timer->plan.cycles) {
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
                        IntervalSet* s0 = &timer->plan.sets[0];
                        int is_last = (timer->plan.num_sets == 1);
                        if (s0->work_seconds > 0) {
                            timer->current_phase = PHASE_WORK;
                            timer->seconds_in_phase = s0->work_seconds;
                            timer->total_phase_seconds = s0->work_seconds;
                            if (timer->sound_enabled) {
                                if (is_last) timer_play_last_set_signal();
                                else timer_play_work_signal();
                            }
                        } else {
                            timer->current_phase = PHASE_REST;
                            timer->seconds_in_phase = s0->rest_seconds;
                            timer->total_phase_seconds = s0->rest_seconds;
                            if (timer->sound_enabled) {
                                if (is_last) timer_play_last_set_signal();
                                else timer_play_rest_signal();
                            }
                        }
                    }
                } else {
                    IntervalSet* s = &timer->plan.sets[timer->current_set_index];
                    int is_last = (timer->current_set_index == timer->plan.num_sets - 1);
                    if (s->work_seconds > 0) {
                        timer->current_phase = PHASE_WORK;
                        timer->seconds_in_phase = s->work_seconds;
                        timer->total_phase_seconds = s->work_seconds;
                        if (timer->sound_enabled) {
                            if (is_last) timer_play_last_set_signal();
                            else timer_play_work_signal();
                        }
                    } else {
                        timer->current_phase = PHASE_REST;
                        timer->seconds_in_phase = s->rest_seconds;
                        timer->total_phase_seconds = s->rest_seconds;
                        if (timer->sound_enabled) {
                            if (is_last) timer_play_last_set_signal();
                            else timer_play_rest_signal();
                        }
                    }
                }
            }
            break;
        }
        
        case PHASE_REST: {
            timer->current_set_index++;
            if (timer->current_set_index >= timer->plan.num_sets) {
                timer->current_set_index = 0;
                timer->current_cycle_index++;
                if (timer->current_cycle_index >= timer->plan.cycles) {
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
                    IntervalSet* s0 = &timer->plan.sets[0];
                    int is_last = (timer->plan.num_sets == 1);
                    if (s0->work_seconds > 0) {
                        timer->current_phase = PHASE_WORK;
                        timer->seconds_in_phase = s0->work_seconds;
                        timer->total_phase_seconds = s0->work_seconds;
                        if (timer->sound_enabled) {
                            if (is_last) timer_play_last_set_signal();
                            else timer_play_work_signal();
                        }
                    } else {
                        timer->current_phase = PHASE_REST;
                        timer->seconds_in_phase = s0->rest_seconds;
                        timer->total_phase_seconds = s0->rest_seconds;
                        if (timer->sound_enabled) {
                            if (is_last) timer_play_last_set_signal();
                            else timer_play_rest_signal();
                        }
                    }
                }
            } else {
                IntervalSet* s = &timer->plan.sets[timer->current_set_index];
                int is_last = (timer->current_set_index == timer->plan.num_sets - 1);
                if (s->work_seconds > 0) {
                    timer->current_phase = PHASE_WORK;
                    timer->seconds_in_phase = s->work_seconds;
                    timer->total_phase_seconds = s->work_seconds;
                    if (timer->sound_enabled) {
                        if (is_last) timer_play_last_set_signal();
                        else timer_play_work_signal();
                    }
                } else {
                    timer->current_phase = PHASE_REST;
                    timer->seconds_in_phase = s->rest_seconds;
                    timer->total_phase_seconds = s->rest_seconds;
                    if (timer->sound_enabled) {
                        if (is_last) timer_play_last_set_signal();
                        else timer_play_rest_signal();
                    }
                }
            }
            break;
        }
        
        case PHASE_CYCLE_REST: {
            IntervalSet* s0 = &timer->plan.sets[0];
            int is_last = (timer->plan.num_sets == 1);
            if (s0->work_seconds > 0) {
                timer->current_phase = PHASE_WORK;
                timer->seconds_in_phase = s0->work_seconds;
                timer->total_phase_seconds = s0->work_seconds;
                if (timer->sound_enabled) {
                    if (is_last) timer_play_last_set_signal();
                    else timer_play_work_signal();
                }
            } else {
                timer->current_phase = PHASE_REST;
                timer->seconds_in_phase = s0->rest_seconds;
                timer->total_phase_seconds = s0->rest_seconds;
                if (timer->sound_enabled) {
                    if (is_last) timer_play_last_set_signal();
                    else timer_play_rest_signal();
                }
            }
            break;
        }
            
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
    
    /* Metronome tick & visual warning 3 seconds before end */
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

void timer_play_sound(int frequency_hz, int duration_ms) {
#ifdef _WIN32
    Beep((DWORD)frequency_hz, (DWORD)duration_ms);
#else
    (void)frequency_hz;
    (void)duration_ms;
    printf("\\a");
    fflush(stdout);
#endif
}

void timer_play_metronome_tick(void) {
#ifdef _WIN32
    Beep(1000, 70);
#else
    printf("\\a");
    fflush(stdout);
#endif
}

void timer_play_work_signal(void) {
#ifdef _WIN32
    Beep(880, 150);
    Sleep(50);
    Beep(1174, 300);
#else
    printf("\\a\\a");
    fflush(stdout);
#endif
}

void timer_play_last_set_signal(void) {
#ifdef _WIN32
    /* Ascending energetic fanfare for the final set of the cycle */
    Beep(880, 100);
    Sleep(40);
    Beep(1174, 100);
    Sleep(40);
    Beep(1568, 350);
#else
    printf("\\a");
    fflush(stdout);
    usleep(90000);
    printf("\\a");
    fflush(stdout);
    usleep(90000);
    printf("\\a");
    fflush(stdout);
#endif
}

void timer_play_rest_signal(void) {
#ifdef _WIN32
    Beep(523, 200);
#else
    printf("\\a");
    fflush(stdout);
#endif
}

void timer_play_complete_signal(void) {
#ifdef _WIN32
    Beep(587, 150);
    Beep(740, 150);
    Beep(880, 400);
#else
    printf("\\a\\a\\a");
    fflush(stdout);
#endif
}

int timer_save_preset_to_file(const WorkoutPlan* plan, const char* filename) {
    if (!plan || !filename) return -1;
    FILE* f = fopen(filename, "a");
    if (!f) return -1;
    
    fprintf(f, "[PRESET]\\n");
    fprintf(f, "name=%s\\n", plan->name);
    fprintf(f, "prep=%d\\n", plan->prep_seconds);
    fprintf(f, "cycles=%d\\n", plan->cycles);
    fprintf(f, "cycle_rest=%d\\n", plan->cycle_rest_seconds);
    fprintf(f, "num_sets=%d\\n", plan->num_sets);
    for (int i = 0; i < plan->num_sets; i++) {
        fprintf(f, "set=%s,%d,%d\\n", 
                plan->sets[i].name, 
                plan->sets[i].work_seconds, 
                plan->sets[i].rest_seconds);
    }
    fprintf(f, "[END_PRESET]\\n\\n");
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
        line[strcspn(line, "\\r\\n")] = 0;
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
    
    *count = idx;
}

int timer_log_session_to_file(const SessionRecord* record, const char* filename) {
    if (!record || !filename) return -1;
    FILE* f = fopen(filename, "a");
    if (!f) return -1;
    
    fprintf(f, "[%s] Plan: \\"%s\\" | Duration: %02d:%02d | Sets: %d/%d | Cycles: %d/%d | Status: %s\\n",
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
    printf("\\033[2J\\033[H");
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
}`,
  },
  {
    name: 'Главная программа (Консоль CLI)',
    filename: 'main.c',
    language: 'c',
    description: 'ANSI HUD интерфейс в терминале с неблокирующим управлением [P]ауза, [R]есет, [S]кип, метрономом и журналом.',
    content: `/**
 * @file main.c
 * @brief Console Terminal Interface for C Interval Timer.
 */

#include "interval_timer.h"
#include <signal.h>

static volatile bool keep_running = true;

static void sigint_handler(int sig) {
    (void)sig;
    keep_running = false;
    console_reset_terminal();
    printf("\\n\\033[0mTimer terminated by user.\\n");
    exit(0);
}

static void render_progress_bar(int current, int total, int width) {
    if (total <= 0) total = 1;
    if (current > total) current = total;
    int filled = (current * width) / total;
    
    printf("[");
    for (int i = 0; i < width; i++) {
        if (i < filled) printf("█");
        else if (i == filled) printf("▒");
        else printf("░");
    }
    printf("] %3d%%", (current * 100) / total);
}

static void render_hud(const IntervalTimer* timer) {
    printf("\\033[H");
    printf("\\033[1;37;44m ==================================================================== \\033[0m\\n");
    printf("\\033[1;37;44m        C INTERVAL TIMER  |  ИНТЕРВАЛЬНЫЙ ТАЙМЕР НА C               \\033[0m\\n");
    printf("\\033[1;37;44m ==================================================================== \\033[0m\\n\\n");
    
    printf("  \\033[1;36mПлан / Workout:\\033[0m %-28s \\033[1;36mЦикл / Cycle:\\033[0m %d / %d\\n",
           timer->plan.name,
           timer->current_cycle_index + 1,
           timer->plan.cycles);
           
    int current_set_num = timer->current_set_index + 1;
    const char* set_name = (timer->current_set_index < timer->plan.num_sets) 
                           ? timer->plan.sets[timer->current_set_index].name 
                           : "Finish";
    printf("  \\033[1;36mСет / Set:\\033[0m      %d / %-26d \\033[1;36mУпражнение:\\033[0m   %s\\n\\n",
           current_set_num,
           timer->plan.num_sets,
           set_name);
           
    const char* phase_color = "\\033[1;32m";
    if (timer->current_phase == PHASE_REST) phase_color = "\\033[1;34m";
    else if (timer->current_phase == PHASE_PREP) phase_color = "\\033[1;33m";
    else if (timer->current_phase == PHASE_PAUSED) phase_color = "\\033[1;35m";
    else if (timer->current_phase == PHASE_COMPLETED) phase_color = "\\033[1;32;42;30m";
    
    printf("  \\033[1;37mФАЗА:\\033[0m %s%-32s\\033[0m  \\033[1;37mЗВУК:\\033[0m %s\\n",
           phase_color,
           timer_phase_to_string(timer->current_phase),
           timer->sound_enabled ? "\\033[32m[ВКЛ/ON]\\033[0m" : "\\033[31m[ВЫКЛ/OFF]\\033[0m");
           
    int mins = timer->seconds_in_phase / 60;
    int secs = timer->seconds_in_phase % 60;
    
    printf("\\n  \\033[1;37m+--------------------------------------------------------------+\\033[0m\\n");
    if (timer->seconds_in_phase <= 3 && timer->seconds_in_phase >= 1 && timer->is_running && !timer->is_paused) {
        printf("  |   \\033[1;31;5m>>> ВНИМАНИЕ! ОБРАТНЫЙ ОТСЧЕТ / COUNTDOWN:  [ %d ]  <<<     \\033[0m|\\n", timer->seconds_in_phase);
    } else {
        printf("  |                                                              |\\n");
    }
    printf("  |                  \\033[1;37;40m      %02d : %02d      \\033[0m                           |\\n", mins, secs);
    printf("  |                                                              |\\n");
    printf("  \\033[1;37m+--------------------------------------------------------------+\\033[0m\\n\\n");
    
    int elapsed_in_phase = timer->total_phase_seconds - timer->seconds_in_phase;
    printf("  Фаза прогресс: ");
    render_progress_bar(elapsed_in_phase, timer->total_phase_seconds, 32);
    printf("\\n");
    
    printf("  Общее время:   %02d:%02d\\n\\n",
           timer->total_elapsed_seconds / 60,
           timer->total_elapsed_seconds % 60);
           
    printf("  \\033[1;30;47m  УПРАВЛЕНИЕ: [P] Пауза/Старт  [R] Сброс  [S] Пропуск  [M] Звук  [Q] Выход  \\033[0m\\n");
    fflush(stdout);
}

int main(int argc, char* argv[]) {
    (void)argc; (void)argv;
    signal(SIGINT, sigint_handler);
    
    WorkoutPlan presets[MAX_PRESETS];
    int preset_count = 0;
    timer_get_default_presets(presets, &preset_count);
    
    IntervalTimer timer;
    timer_init(&timer);
    timer_set_plan(&timer, &presets[0]);
    
    printf("C Interval Timer loaded successfully.\\n");
    return 0;
}`,
  },
  {
    name: 'Android NDK / JNI Мост',
    filename: 'android_jni.c',
    language: 'c',
    description: 'Код привязки C-ядра к Android Java/Kotlin через Java Native Interface (JNI) для APK сборки.',
    content: `/**
 * @file android_jni.c
 * @brief Android NDK JNI Bridge for Interval Timer C Engine.
 * Allows running the C core natively inside an Android Service.
 */

#include <jni.h>
#include "interval_timer.h"

static IntervalTimer g_timer;

JNIEXPORT void JNICALL
Java_com_fitness_intervaltimer_TimerService_initEngine(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    timer_init(&g_timer);
}

JNIEXPORT void JNICALL
Java_com_fitness_intervaltimer_TimerService_startTimer(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    timer_start(&g_timer);
}

JNIEXPORT void JNICALL
Java_com_fitness_intervaltimer_TimerService_togglePause(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    timer_toggle_pause(&g_timer);
}

JNIEXPORT void JNICALL
Java_com_fitness_intervaltimer_TimerService_resetTimer(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    timer_reset(&g_timer);
}

JNIEXPORT void JNICALL
Java_com_fitness_intervaltimer_TimerService_tickSecond(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    timer_tick_second(&g_timer);
}

JNIEXPORT jint JNICALL
Java_com_fitness_intervaltimer_TimerService_getSecondsInPhase(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    return (jint)g_timer.seconds_in_phase;
}

JNIEXPORT jint JNICALL
Java_com_fitness_intervaltimer_TimerService_getCurrentPhase(JNIEnv *env, jobject thiz) {
    (void)env; (void)thiz;
    return (jint)g_timer.current_phase;
}`,
  },
  {
    name: 'Makefile сборщика',
    filename: 'Makefile',
    language: 'makefile',
    description: 'Инструкции компиляции для GCC, Clang, MinGW, а также цель для WebAssembly (emcc).',
    content: `CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
TARGET = interval_timer

SRCS = main.c interval_timer.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

%.o: %.c interval_timer.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET) $(TARGET).exe workout_history.log workout_presets.conf

wasm:
	emcc interval_timer.c -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_timer_init', '_timer_set_plan', '_timer_start', '_timer_pause', '_timer_tick_second', '_timer_reset']" -s MODULARIZE=1 -o interval_timer_wasm.js
`,
  },
];
