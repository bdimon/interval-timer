/**
 * @file main.c
 * @brief Console Terminal Interface for C Interval Timer.
 * Features:
 *  - Real-time ANSI HUD displaying remaining time, current cycle, current set
 *  - Non-blocking keyboard controls: [p]ause/resume, [r]eset, [s]kip, [m]ute, [q]uit
 *  - 3-second visual countdown & metronome sound tick
 *  - Complex cycles & custom work/rest intervals
 *  - Preset templates saving & loading
 *  - Session history journaling
 */

#include "interval_timer.h"
#include <signal.h>

static volatile bool keep_running = true;

static void sigint_handler(int sig) {
    (void)sig;
    keep_running = false;
    console_reset_terminal();
    printf("\n\033[0mTimer terminated by user.\n");
    exit(0);
}

/* Print progress bar in terminal */
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

/* Display terminal HUD */
static void render_hud(const IntervalTimer* timer) {
    /* Clear and move to top */
    printf("\033[H");
    
    /* Header banner */
    printf("\033[1;37;44m ==================================================================== \033[0m\n");
    printf("\033[1;37;44m        C INTERVAL TIMER  |  ИНТЕРВАЛЬНЫЙ ТАЙМЕР НА C               \033[0m\n");
    printf("\033[1;37;44m ==================================================================== \033[0m\n\n");
    
    /* Current Preset & Cycle Info */
    printf("  \033[1;36mПлан / Workout:\033[0m %-28s \033[1;36mЦикл / Cycle:\033[0m %d / %d\n",
           timer->plan.name,
           timer->current_cycle_index + 1,
           timer->plan.cycles);
           
    int current_set_num = timer->current_set_index + 1;
    const char* set_name = (timer->current_set_index < timer->plan.num_sets) 
                           ? timer->plan.sets[timer->current_set_index].name 
                           : "Finish";
    printf("  \033[1;36mСет / Set:\033[0m      %d / %-26d \033[1;36mУпражнение:\033[0m   %s\n\n",
           current_set_num,
           timer->plan.num_sets,
           set_name);
           
    /* Phase status indicator with ANSI colors */
    const char* phase_color = "\033[1;32m"; /* Green for Work */
    if (timer->current_phase == PHASE_REST) phase_color = "\033[1;34m"; /* Blue for Rest */
    else if (timer->current_phase == PHASE_PREP) phase_color = "\033[1;33m"; /* Yellow for Prep */
    else if (timer->current_phase == PHASE_PAUSED) phase_color = "\033[1;35m"; /* Magenta for Paused */
    else if (timer->current_phase == PHASE_COMPLETED) phase_color = "\033[1;32;42;30m"; /* Bold Green */
    
    printf("  \033[1;37mФАЗА:\033[0m %s%-32s\033[0m  \033[1;37mЗВУК:\033[0m %s\n",
           phase_color,
           timer_phase_to_string(timer->current_phase),
           timer->sound_enabled ? "\033[32m[ВКЛ/ON]\033[0m" : "\033[31m[ВЫКЛ/OFF]\033[0m");
           
    /* Large Time Display */
    int mins = timer->seconds_in_phase / 60;
    int secs = timer->seconds_in_phase % 60;
    
    printf("\n  \033[1;37m+--------------------------------------------------------------+\033[0m\n");
    if (timer->seconds_in_phase <= 3 && timer->seconds_in_phase >= 1 && timer->is_running && !timer->is_paused) {
        /* Visual countdown flash 3 seconds before completion */
        printf("  |   \033[1;31;5m>>> ВНИМАНИЕ! ОБРАТНЫЙ ОТСЧЕТ / COUNTDOWN:  [ %d ]  <<<     \033[0m|\n", timer->seconds_in_phase);
    } else {
        printf("  |                                                              |\n");
    }
    printf("  |                  \033[1;37;40m      %02d : %02d      \033[0m                           |\n", mins, secs);
    printf("  |                                                              |\n");
    printf("  \033[1;37m+--------------------------------------------------------------+\033[0m\n\n");
    
    /* Progress bar for current phase */
    int elapsed_in_phase = timer->total_phase_seconds - timer->seconds_in_phase;
    printf("  Фаза прогресс: ");
    render_progress_bar(elapsed_in_phase, timer->total_phase_seconds, 32);
    printf("\n");
    
    /* Overall workout elapsed time */
    printf("  Общее время:   %02d:%02d\n\n",
           timer->total_elapsed_seconds / 60,
           timer->total_elapsed_seconds % 60);
           
    /* Interactive Controls Menu */
    printf("  \033[1;30;47m  УПРАВЛЕНИЕ: [P] Пауза/Старт  [R] Сброс  [S] Пропуск  [M] Звук  [Q] Выход  \033[0m\n");
    fflush(stdout);
}

/* Interactive Workout Loop */
static void run_timer_loop(IntervalTimer* timer) {
    console_init_terminal();
    console_clear_screen();
    
    timer_start(timer);
    render_hud(timer);
    
    time_t last_tick_time = time(NULL);
    
    while (keep_running && timer->current_phase != PHASE_COMPLETED) {
        /* Check keyboard input non-blocking */
        if (console_kbhit()) {
            int ch = console_getch();
            if (ch == 'p' || ch == 'P' || ch == ' ') {
                timer_toggle_pause(timer);
                render_hud(timer);
            } else if (ch == 'r' || ch == 'R') {
                timer_reset(timer);
                render_hud(timer);
            } else if (ch == 's' || ch == 'S') {
                timer_skip_next(timer);
                render_hud(timer);
            } else if (ch == 'm' || ch == 'M') {
                timer->sound_enabled = !timer->sound_enabled;
                render_hud(timer);
            } else if (ch == 'q' || ch == 'Q') {
                break;
            }
        }
        
        /* 1-second accurate timing check */
        time_t now = time(NULL);
        if (now != last_tick_time) {
            last_tick_time = now;
            timer_tick_second(timer);
            render_hud(timer);
        }
        
#ifdef _WIN32
        Sleep(50);
#else
        usleep(50000); /* 50ms polling */
#endif
    }
    
    /* Completion logging */
    SessionRecord record;
    memset(&record, 0, sizeof(SessionRecord));
    strncpy(record.plan_name, timer->plan.name, MAX_NAME_LEN - 1);
    
    time_t t = time(NULL);
    struct tm* tm_info = localtime(&t);
    strftime(record.timestamp, sizeof(record.timestamp), "%Y-%m-%d %H:%M:%S", tm_info);
    
    record.total_duration_seconds = timer->total_elapsed_seconds;
    record.sets_completed = (timer->current_cycle_index * timer->plan.num_sets) + timer->current_set_index;
    record.total_sets = timer->plan.num_sets * timer->plan.cycles;
    record.cycles_completed = timer->current_cycle_index + (timer->current_phase == PHASE_COMPLETED ? 1 : 0);
    record.total_cycles = timer->plan.cycles;
    record.completed_fully = (timer->current_phase == PHASE_COMPLETED);
    
    timer_log_session_to_file(&record, DEFAULT_LOG_FILE);
    
    console_clear_screen();
    printf("\n\033[1;32m========================================================\033[0m\n");
    if (record.completed_fully) {
        printf("\033[1;32m   ТРЕНИРОВКА УСПЕШНО ЗАВЕРШЕНА! ПОЗДРАВЛЯЕМ!         \033[0m\n");
    } else {
        printf("\033[1;33m   ТРЕНИРОВКА ОСТАНОВЛЕНА ПОЛЬЗОВАТЕЛЕМ              \033[0m\n");
    }
    printf("\033[1;32m========================================================\033[0m\n\n");
    printf("  План:          %s\n", record.plan_name);
    printf("  Время:         %02d:%02d\n", record.total_duration_seconds / 60, record.total_duration_seconds % 60);
    printf("  Сетов пройдено: %d / %d\n", record.sets_completed, record.total_sets);
    printf("  Циклов:        %d / %d\n", record.cycles_completed, record.total_cycles);
    printf("  Запись добавлена в журнал: %s\n\n", DEFAULT_LOG_FILE);
    
    console_reset_terminal();
    printf("Нажмите любую клавишу для возврата в меню...");
    getchar();
}

/* View session journal from file */
static void show_session_journal(void) {
    console_clear_screen();
    printf("\033[1;36m====================================================================\033[0m\n");
    printf("\033[1;36m             ЖУРНАЛ ЗАВЕРШЕННЫХ СЕССИЙ (WORKOUT JOURNAL)           \033[0m\n");
    printf("\033[1;36m====================================================================\033[0m\n\n");
    
    FILE* f = fopen(DEFAULT_LOG_FILE, "r");
    if (!f) {
        printf("  Журнал пуст. Завершите хотя бы одну тренировку!\n\n");
    } else {
        char line[256];
        int count = 0;
        while (fgets(line, sizeof(line), f)) {
            printf("  %s", line);
            count++;
        }
        fclose(f);
        if (count == 0) printf("  Журнал пуст.\n\n");
    }
    printf("\nНажмите Enter для возврата...");
    getchar();
}

/* Custom Complex Cycle Builder */
static void create_custom_plan(WorkoutPlan* plan) {
    console_clear_screen();
    memset(plan, 0, sizeof(WorkoutPlan));
    
    printf("\033[1;35m====================================================================\033[0m\n");
    printf("\033[1;35m        СОЗДАНИЕ СЛОЖНОГО ЦИКЛА (CUSTOM COMPLEX WORKOUT)           \033[0m\n");
    printf("\033[1;35m====================================================================\033[0m\n\n");
    
    printf("Введите название плана: ");
    if (fgets(plan->name, sizeof(plan->name), stdin)) {
        plan->name[strcspn(plan->name, "\r\n")] = 0;
    }
    if (strlen(plan->name) == 0) strncpy(plan->name, "Мой Комплексный План", MAX_NAME_LEN - 1);
    
    char buffer[64];
    printf("Секунды на подготовку (prep time, например 5): ");
    if (fgets(buffer, sizeof(buffer), stdin)) plan->prep_seconds = atoi(buffer);
    if (plan->prep_seconds < 0) plan->prep_seconds = 5;
    
    printf("Количество повторений цикла (cycles, например 2): ");
    if (fgets(buffer, sizeof(buffer), stdin)) plan->cycles = atoi(buffer);
    if (plan->cycles <= 0) plan->cycles = 1;
    
    if (plan->cycles > 1) {
        printf("Отдых между циклами в секундах (например 60): ");
        if (fgets(buffer, sizeof(buffer), stdin)) plan->cycle_rest_seconds = atoi(buffer);
    }
    
    int num_sets = 0;
    printf("Сколько сетов в одном цикле (1-%d): ", MAX_SETS);
    if (fgets(buffer, sizeof(buffer), stdin)) num_sets = atoi(buffer);
    if (num_sets <= 0 || num_sets > MAX_SETS) num_sets = 3;
    plan->num_sets = num_sets;
    
    printf("\n-- Настройка каждого сета индивидуально (работа и отдых) --\n");
    for (int i = 0; i < num_sets; i++) {
        printf("\nСет %d:\n", i + 1);
        printf("  Название упражнения (или Enter для 'Сет %d'): ", i + 1);
        if (fgets(plan->sets[i].name, sizeof(plan->sets[i].name), stdin)) {
            plan->sets[i].name[strcspn(plan->sets[i].name, "\r\n")] = 0;
        }
        if (strlen(plan->sets[i].name) == 0) {
            snprintf(plan->sets[i].name, MAX_NAME_LEN, "Сет %d", i + 1);
        }
        
        printf("  Секунды работы: ");
        if (fgets(buffer, sizeof(buffer), stdin)) plan->sets[i].work_seconds = atoi(buffer);
        if (plan->sets[i].work_seconds <= 0) plan->sets[i].work_seconds = 30;
        
        printf("  Секунды отдыха: ");
        if (fgets(buffer, sizeof(buffer), stdin)) plan->sets[i].rest_seconds = atoi(buffer);
        if (plan->sets[i].rest_seconds < 0) plan->sets[i].rest_seconds = 15;
    }
    
    printf("\nСохранить этот план в файл шаблонов? (y/n): ");
    if (fgets(buffer, sizeof(buffer), stdin) && (buffer[0] == 'y' || buffer[0] == 'Y' || buffer[0] == 'д' || buffer[0] == 'Д')) {
        timer_save_preset_to_file(plan, DEFAULT_PRESETS_FILE);
        printf("Шаблон успешно сохранен в %s!\n", DEFAULT_PRESETS_FILE);
    }
    
    printf("\nНажмите Enter для запуска тренировки...");
    getchar();
}

int main(int argc, char* argv[]) {
    (void)argc; (void)argv;
    signal(SIGINT, sigint_handler);
    
    WorkoutPlan presets[MAX_PRESETS];
    int preset_count = 0;
    
    /* Load built-in defaults */
    timer_get_default_presets(presets, &preset_count);
    
    /* Try loading user presets from file */
    int user_loaded = timer_load_presets_from_file(presets + preset_count, MAX_PRESETS - preset_count, DEFAULT_PRESETS_FILE);
    preset_count += user_loaded;
    
    IntervalTimer timer;
    timer_init(&timer);
    
    char choice_buf[64];
    
    while (keep_running) {
        console_clear_screen();
        printf("\033[1;32m ==================================================================== \033[0m\n");
        printf("\033[1;32m       C INTERVAL WORKOUT TIMER  |  ГЛАВНОЕ МЕНЮ                    \033[0m\n");
        printf("\033[1;32m ==================================================================== \033[0m\n\n");
        
        printf("  \033[1;33mДОСТУПНЫЕ ШАБЛОНЫ ТРЕНИРОВОК:\033[0m\n");
        for (int i = 0; i < preset_count; i++) {
            printf("    [%d] %-30s (%d сетов, %d цикл.)\n",
                   i + 1,
                   presets[i].name,
                   presets[i].num_sets,
                   presets[i].cycles);
        }
        
        printf("\n  \033[1;36mДОПОЛНИТЕЛЬНЫЕ ДЕЙСТВИЯ:\033[0m\n");
        printf("    [C] Создать сложный цикл (настройка каждого сета отдельно)\n");
        printf("    [J] Открыть журнал тренировок\n");
        printf("    [Q] Выход\n\n");
        
        printf("  Выберите пункт меню: ");
        if (!fgets(choice_buf, sizeof(choice_buf), stdin)) break;
        
        char c = choice_buf[0];
        if (c == 'q' || c == 'Q') {
            break;
        } else if (c == 'c' || c == 'C' || c == 'с' || c == 'С') {
            WorkoutPlan custom;
            create_custom_plan(&custom);
            timer_set_plan(&timer, &custom);
            run_timer_loop(&timer);
        } else if (c == 'j' || c == 'J' || c == 'о' || c == 'О') {
            show_session_journal();
        } else {
            int selected = atoi(choice_buf);
            if (selected >= 1 && selected <= preset_count) {
                timer_set_plan(&timer, &presets[selected - 1]);
                run_timer_loop(&timer);
            }
        }
    }
    
    console_reset_terminal();
    printf("\nДо свидания! Здоровых и продуктивных тренировок.\n");
    return 0;
}
