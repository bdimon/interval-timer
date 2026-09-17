export type Language = 'ru' | 'en' | 'uk';

export interface Translations {
  // Navigation
  nav_timer: string;
  nav_editor: string;
  nav_terminal: string;
  nav_presets: string;
  nav_journal: string;
  nav_c_code: string;
  nav_new_cycle: string;
  nav_sound_on: string;
  nav_sound_off: string;
  nav_fullscreen: string;
  core_engine_badge: string;
  core_engine_sub: string;

  // Timer Phases
  phase_idle: string;
  phase_prep: string;
  phase_work: string;
  phase_rest: string;
  phase_cycle_rest: string;
  phase_paused: string;
  phase_completed: string;

  // Timer Display
  timer_cycle: string;
  timer_set: string;
  timer_of: string;
  timer_next: string;
  timer_elapsed: string;
  timer_remaining: string;
  timer_mode_radial: string;
  timer_mode_digital: string;
  timer_mode_minimal: string;
  timer_congrats: string;
  timer_workout_done: string;

  // Controls
  btn_start: string;
  btn_pause: string;
  btn_resume: string;
  btn_reset: string;
  btn_prev_set: string;
  btn_next_set: string;
  sound_settings: string;
  sound_theme: string;
  sound_volume: string;
  sound_metronome: string;
  sound_metronome_desc: string;
  theme_athletic: string;
  theme_boxing: string;
  theme_digital: string;
  theme_wooden: string;
  hotkeys_title: string;
  hotkey_space: string;
  hotkey_r: string;
  hotkey_arrows: string;
  hotkey_m: string;

  // Editor
  editor_title: string;
  editor_subtitle: string;
  editor_plan_name: string;
  editor_plan_desc: string;
  editor_prep_sec: string;
  editor_cycles: string;
  editor_cycle_rest: string;
  editor_sets_title: string;
  editor_add_set: string;
  editor_set_name: string;
  editor_work_sec: string;
  editor_rest_sec: string;
  editor_save_plan: string;
  editor_save_as_new: string;
  editor_cancel_edit: string;
  editor_reset_draft: string;
  editor_editing_badge: string;
  editor_total_time: string;
  editor_work_ratio: string;

  // Presets
  presets_title: string;
  presets_subtitle: string;
  presets_default_tab: string;
  presets_custom_tab: string;
  presets_apply: string;
  presets_edit: string;
  presets_export_json: string;
  presets_import_json: string;
  presets_reset_all: string;
  presets_delete: string;
  presets_no_custom: string;
  presets_active_badge: string;

  // Journal
  journal_title: string;
  journal_subtitle: string;
  journal_clear_all: string;
  journal_empty_title: string;
  journal_empty_desc: string;
  journal_total_sessions: string;
  journal_total_time: string;
  journal_sets_completed: string;
  journal_full_completion: string;
  journal_partial_completion: string;
  journal_date: string;
  journal_cycles_completed: string;

  // Terminal & C Code
  term_title: string;
  term_subtitle: string;
  term_help_hint: string;
  term_run: string;
  term_clear: string;
  c_code_title: string;
  c_code_subtitle: string;
  c_code_copy: string;
  c_code_copied: string;
  c_code_download: string;
  c_code_compile_hint: string;
  c_code_ndk_title: string;

  // PWA & Common
  pwa_install: string;
  pwa_installed: string;
  offline_ready: string;
  language_label: string;

  // Timer extra
  phase_prep_get_ready: string;
  badge_final_round: string;
  test_sound_rest: string;
  test_sound_final: string;
  footer_plan: string;
  footer_metronome: string;
  footer_metronome_on: string;
  footer_metronome_off: string;

  // Editor extra
  editor_c_ready_badge: string;
  editor_autosave_badge: string;
  editor_custom_desc: string;
  editor_btn_new_cycle: string;
  editor_btn_c_header: string;
  editor_btn_saved_as_new: string;
  editor_btn_changes_saved: string;
  editor_btn_save_changes: string;
  editor_btn_start_timer: string;
  editor_warning_invalid_set: string;
  editor_warning_invalid_desc: string;
  editor_plan_name_label: string;
  editor_plan_name_placeholder: string;
  editor_delete_counter: string;
  editor_add_counter: string;
  editor_quick_gen_title: string;
  editor_gen_sets_label: string;
  editor_gen_work_label: string;
  editor_gen_rest_label: string;
  editor_gen_no_work: string;
  editor_gen_no_rest: string;
  editor_gen_btn: string;
  editor_remove_work_all: string;
  editor_remove_rest_all: string;
  editor_add_work_all: string;
  editor_add_rest_all: string;
  editor_set_placeholder: string;
  editor_move_up: string;
  editor_move_down: string;
  editor_duplicate_set: string;
  editor_delete_set: string;
  editor_work_counter_title: string;
  editor_rest_counter_title: string;
  editor_work_counter_empty: string;
  editor_rest_counter_empty: string;
  editor_both_counters_empty: string;
  editor_export_modal_title: string;
  editor_export_modal_hint: string;
  editor_close: string;
  editor_total_sets: string;
  editor_prep: string;
  editor_sets_list_title: string;
  unit_min: string;
  unit_sec: string;

  // Presets extra
  presets_card_create_title: string;
  presets_card_create_desc: string;
  presets_card_create_btn: string;
  presets_badge_active: string;
  presets_badge_custom: string;
  presets_badge_default: string;
  presets_start_workout: string;
  presets_apply_plan: string;
  presets_edit_plan: string;
  presets_delete_plan: string;
  presets_export_header: string;
  presets_modal_export_title: string;
  presets_modal_export_copy: string;
  presets_modal_copied: string;
  presets_confirm_reset: string;

  // Terminal extra
  term_copy_btn: string;
  term_copied_btn: string;
  term_header_title: string;
  term_stat_plan: string;
  term_stat_cycle: string;
  term_stat_set: string;
  term_stat_exercise: string;
  term_stat_phase: string;
  term_stat_audio: string;
  term_stat_audio_on: string;
  term_stat_audio_off: string;
  term_active_clock: string;
  term_time_until_change: string;
  term_phase_progress: string;
  term_total_time: string;
  term_console_controls: string;
  term_ctrl_pause: string;
  term_ctrl_reset: string;
  term_ctrl_skip: string;
  term_ctrl_sound: string;
  term_system_log: string;
  term_log_empty: string;
  term_countdown_warn: string;
  pwa_install_title: string;
  pwa_ios_btn: string;
  pwa_ios_title: string;
  pwa_ios_step1: string;
  pwa_ios_step1_btn: string;
  pwa_ios_step1_desc: string;
  pwa_ios_step2: string;
  pwa_ios_step2_btn: string;
  pwa_ios_step3: string;
  pwa_ios_step3_btn: string;
  pwa_ios_step3_desc: string;
  pwa_ios_got_it: string;
  error_boundary_title: string;
  error_boundary_desc: string;
  error_boundary_reset: string;
  error_boundary_reload: string;
  timer_metronome_label: string;
  timer_no_work: string;
  timer_rest_set_suffix: string;
  timer_rest_short: string;
  timer_rest_cycle_prefix: string;

  // Journal extra
  journal_stat_workouts: string;
  journal_stat_time: string;
  journal_stat_sets: string;
  journal_stat_completed: string;
  journal_export_csv: string;
  journal_table_date: string;
  journal_table_plan: string;
  journal_table_duration: string;
  journal_table_sets: string;
  journal_table_cycles: string;
  journal_table_status: string;
  journal_status_completed: string;
  journal_status_stopped: string;

  // C Code extra
  c_guide_cli_title: string;
  c_guide_cli_desc: string;
  c_guide_apk_title: string;
  c_guide_apk_desc: string;
  c_guide_wasm_title: string;
  c_guide_wasm_desc: string;
  c_view_lines: string;
  c_view_download: string;
  c_view_copy: string;
  c_view_copied: string;

  // Built-in Presets
  preset_tabata_name: string;
  preset_tabata_desc: string;
  preset_pyramid_name: string;
  preset_pyramid_desc: string;
  preset_boxing_name: string;
  preset_boxing_desc: string;
  preset_sprint_name: string;
  preset_sprint_desc: string;
  preset_core_name: string;
  preset_core_desc: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    // Navigation
    nav_timer: 'Таймер (GUI)',
    nav_editor: 'Сложные циклы',
    nav_terminal: 'C Консоль (CLI)',
    nav_presets: 'Шаблоны',
    nav_journal: 'Журнал сессий',
    nav_c_code: 'C Код & Android',
    nav_new_cycle: 'Новый цикл',
    nav_sound_on: 'Включить звук (M)',
    nav_sound_off: 'Выключить звук (M)',
    nav_fullscreen: 'Полноэкранный режим',
    core_engine_badge: 'Core Engine v2.0',
    core_engine_sub: 'ANSI CLI + Web GUI + Android APK Bridge',

    // Timer Phases
    phase_idle: 'Готов к старту',
    phase_prep: 'Подготовка',
    phase_work: 'РАБОТА',
    phase_rest: 'ОТДЫХ',
    phase_cycle_rest: 'ОТДЫХ МЕЖДУ ЦИКЛАМИ',
    phase_paused: 'ПАУЗА',
    phase_completed: 'ТРЕНИРОВКА ЗАВЕРШЕНА!',

    // Timer Display
    timer_cycle: 'Цикл',
    timer_set: 'Сет',
    timer_of: 'из',
    timer_next: 'Далее',
    timer_elapsed: 'Прошло',
    timer_remaining: 'Осталось',
    timer_mode_radial: 'Круговой',
    timer_mode_digital: 'Цифровой',
    timer_mode_minimal: 'Минимализм',
    timer_congrats: 'Отличная работа!',
    timer_workout_done: 'Вы полностью завершили все раунды тренировки.',

    // Controls
    btn_start: 'СТАРТ',
    btn_pause: 'ПАУЗА',
    btn_resume: 'ПРОДОЛЖИТЬ',
    btn_reset: 'Сброс',
    btn_prev_set: 'Предыдущий сет',
    btn_next_set: 'Следующий сет',
    sound_settings: 'Настройки аудио',
    sound_theme: 'Тема звука',
    sound_volume: 'Громкость',
    sound_metronome: 'Метроном обратного отсчёта',
    sound_metronome_desc: 'Звуковые сигналы на последних 3-2-1 секундах',
    theme_athletic: 'Атлетический зуммер',
    theme_boxing: 'Боксёрский гонг',
    theme_digital: 'Электронный писк',
    theme_wooden: 'Деревянный метроном',
    hotkeys_title: 'Горячие клавиши',
    hotkey_space: 'Пробел — Старт / Пауза',
    hotkey_r: 'R — Сброс таймера',
    hotkey_arrows: '← / → — Предыдущий / Следующий сет',
    hotkey_m: 'M — Звук Вкл/Выкл',

    // Editor
    editor_title: 'Конструктор сложных тренировочных циклов',
    editor_subtitle: 'Настройте интервалы, суперсеты, циклы и периоды восстановления с сохранением в C-совместимый формат',
    editor_plan_name: 'Название тренировки',
    editor_plan_desc: 'Краткое описание / примечания',
    editor_prep_sec: 'Подготовка (сек)',
    editor_cycles: 'Количество циклов',
    editor_cycle_rest: 'Отдых между циклами (сек)',
    editor_sets_title: 'Интервальные сеты внутри одного цикла',
    editor_add_set: 'Добавить интервал',
    editor_set_name: 'Название раунда / упражнения',
    editor_work_sec: 'Работа (с)',
    editor_rest_sec: 'Отдых (с)',
    editor_save_plan: 'Применить и сохранить',
    editor_save_as_new: 'Сохранить как новый шаблон',
    editor_cancel_edit: 'Отменить редактирование',
    editor_reset_draft: 'Сбросить черновик',
    editor_editing_badge: 'Редактируется шаблон',
    editor_total_time: 'Общее время цикла',
    editor_work_ratio: 'Доля полезной нагрузки',

    // Presets
    presets_title: 'Библиотека готовых шаблонов',
    presets_subtitle: 'Классические протоколы (Табата, бокс, HIIT, EMOM) и ваши персональные программы',
    presets_default_tab: 'Стандартные протоколы',
    presets_custom_tab: 'Мои программы',
    presets_apply: 'Выбрать для тренировки',
    presets_edit: 'Изменить в конструкторе',
    presets_export_json: 'Экспорт шаблонов (JSON)',
    presets_import_json: 'Импорт шаблонов (JSON)',
    presets_reset_all: 'Восстановить по умолчанию',
    presets_delete: 'Удалить',
    presets_no_custom: 'Вы пока не создали ни одного собственного шаблона. Воспользуйтесь конструктором сложных циклов!',
    presets_active_badge: 'Текущий активный',

    // Journal
    journal_title: 'Журнал тренировок',
    journal_subtitle: 'Локальная история завершенных сессий с детализацией циклов и времени',
    journal_clear_all: 'Очистить журнал',
    journal_empty_title: 'Журнал тренировок пока пуст',
    journal_empty_desc: 'Завершите тренировку в основном окне таймера, и сессия автоматически сохранится здесь.',
    journal_total_sessions: 'Всего сессий',
    journal_total_time: 'Общее время',
    journal_sets_completed: 'Выполнено сетов',
    journal_full_completion: 'Завершено полностью',
    journal_partial_completion: 'Остановлено досрочно',
    journal_date: 'Дата сессии',
    journal_cycles_completed: 'Завершено циклов',

    // Terminal & C Code
    term_title: 'ANSI CLI Консоль (Эмулятор C ядра)',
    term_subtitle: 'Прямой терминальный вывод и симуляция консольного приложения на ANSI C',
    term_help_hint: 'Доступные команды: help, start, pause, reset, skip, next, status, clear',
    term_run: 'Выполнить',
    term_clear: 'Очистить вывод',
    c_code_title: 'Чистый исходный код на ANSI C (C99 / C11)',
    c_code_subtitle: 'Полностью автономная программа на языке C с поддержкой POSIX терминалов, termios и Android NDK',
    c_code_copy: 'Скопировать код C',
    c_code_copied: 'Скопировано в буфер!',
    c_code_download: 'Скачать timer.c',
    c_code_compile_hint: 'Скомпилируйте на Linux/macOS/Termux командой:',
    c_code_ndk_title: 'Сборка для Android NDK / Termux',

    // PWA & Common
    pwa_install: 'Установить приложение',
    pwa_installed: 'Приложение установлено',
    offline_ready: 'Работает автономно офлайн',
    language_label: 'Язык',

    // Timer extra
    phase_prep_get_ready: 'Приготовьтесь',
    badge_final_round: 'Финал',
    test_sound_rest: 'Тест отдыха',
    test_sound_final: 'Тест финала',
    footer_plan: 'План',
    footer_metronome: 'Метроном',
    footer_metronome_on: '3-2-1 сек',
    footer_metronome_off: 'Выкл',

    // Editor extra
    editor_c_ready_badge: 'C-Ready Struct',
    editor_autosave_badge: 'Автосохранение при смене вкладок ✓',
    editor_custom_desc: 'Индивидуальная настройка интервалов: вы можете установить счетчик в 0с или удалить любой счетчик (работы или отдыха) в сете.',
    editor_btn_new_cycle: 'Создать новый сложный цикл',
    editor_btn_c_header: 'C Заголовок (.h)',
    editor_btn_saved_as_new: 'Сохранен как новый ✓',
    editor_btn_changes_saved: 'Изменения сохранены ✓',
    editor_btn_save_changes: 'Сохранить изменения',
    editor_btn_start_timer: 'Запустить таймер',
    editor_warning_invalid_set: 'Внимание: в одном или нескольких сетах удалены оба счетчика (работа 0с и отдых 0с).',
    editor_warning_invalid_desc: 'В каждом сете должен присутствовать хотя бы один счетчик (работа или отдых), либо удалите пустой сет кнопкой корзины.',
    editor_plan_name_label: 'Название тренировки / программы',
    editor_plan_name_placeholder: 'Например: HIIT Пирамида',
    editor_delete_counter: 'Удалить (0с)',
    editor_add_counter: '+ Добавить',
    editor_quick_gen_title: 'Быстрый генератор равномерных сетов:',
    editor_gen_sets_label: 'Сетов:',
    editor_gen_work_label: 'Работа:',
    editor_gen_rest_label: 'Отдых:',
    editor_gen_no_work: '0с (без работы)',
    editor_gen_no_rest: '0с (без отдыха)',
    editor_gen_btn: 'Сгенерировать',
    editor_remove_work_all: 'Удалить работу во всех (0с)',
    editor_remove_rest_all: 'Удалить отдых во всех (0с)',
    editor_add_work_all: '+30с работы всем',
    editor_add_rest_all: '+15с отдыха всем',
    editor_set_placeholder: 'Название упражнения',
    editor_move_up: 'Переместить сет вверх',
    editor_move_down: 'Переместить сет вниз',
    editor_duplicate_set: 'Дублировать сет',
    editor_delete_set: 'Удалить весь этот сет',
    editor_work_counter_title: 'Счетчик работы:',
    editor_rest_counter_title: 'Счетчик отдыха:',
    editor_work_counter_empty: 'Счетчик удален: фаза работы пропущена (0с)',
    editor_rest_counter_empty: 'Счетчик удален: отдых пропущен (переход к след. сету)',
    editor_both_counters_empty: 'В сете удалены оба счетчика (0с работы и 0с отдыха). Добавьте работу или отдых, либо удалите этот сет.',
    editor_export_modal_title: 'Экспорт плана в структуру C (.h)',
    editor_export_modal_hint: 'Вставьте этот код в c_src/ для использования в C программе.',
    editor_close: 'Закрыть',
    editor_total_sets: 'Сетов',
    editor_prep: 'Подготовка',
    editor_sets_list_title: 'Список сетов и интервалов',
    unit_min: 'мин',
    unit_sec: 'сек',

    // Presets extra
    presets_card_create_title: 'Создать новый шаблон',
    presets_card_create_desc: 'Сконструировать произвольную тренировку с нуля: сеты, интервалы работы и отдыха, циклы и C-экспорт.',
    presets_card_create_btn: 'Открыть в конструкторе →',
    presets_badge_active: 'Активный',
    presets_badge_custom: 'Пользовательский',
    presets_badge_default: 'Встроенный',
    presets_start_workout: 'Запустить',
    presets_apply_plan: 'Применить',
    presets_edit_plan: 'Редактировать',
    presets_delete_plan: 'Удалить',
    presets_export_header: 'Экспорт C (.h)',
    presets_modal_export_title: 'C Заголовок (.h) для C программы',
    presets_modal_export_copy: 'Копировать C код',
    presets_modal_copied: 'Скопировано!',
    presets_confirm_reset: 'Восстановить заводские шаблоны по умолчанию?',

    // Terminal extra
    term_copy_btn: 'Копировать',
    term_copied_btn: 'Скопировано!',
    term_header_title: 'ИНТЕРВАЛЬНЫЙ ТАЙМЕР НА C',
    term_stat_plan: 'План / Workout',
    term_stat_cycle: 'Цикл / Cycle',
    term_stat_set: 'Сет / Set',
    term_stat_exercise: 'Упражнение',
    term_stat_phase: 'ФАЗА',
    term_stat_audio: 'ЗВУК / AUDIO',
    term_stat_audio_on: 'ВКЛ / ENABLED',
    term_stat_audio_off: 'ВЫКЛ / MUTED',
    term_active_clock: 'ТАЙМЕР АКТИВЕН — СТАНДАРТНОЕ ВРЕМЯ',
    term_time_until_change: 'ВРЕМЯ ДО СМЕНЫ ИНТЕРВАЛА',
    term_phase_progress: 'Фаза прогресс:',
    term_total_time: 'Общее время:',
    term_console_controls: 'УПРАВЛЕНИЕ В КОНСОЛИ:',
    term_ctrl_pause: 'Пауза/Старт',
    term_ctrl_reset: 'Сброс',
    term_ctrl_skip: 'Пропуск',
    term_ctrl_sound: 'Звук',
    term_system_log: 'Системный журнал событий C ядра (stdout / stderr):',
    term_log_empty: 'Событий пока нет. Запустите таймер.',
    term_countdown_warn: 'ВНИМАНИЕ! ОБРАТНЫЙ ОТСЧЕТ',
    pwa_install_title: 'Установить приложение (PWA)',
    pwa_ios_btn: 'На экран',
    pwa_ios_title: 'Установка на iPhone / iPad',
    pwa_ios_step1: '1. В браузере Safari нажмите кнопку',
    pwa_ios_step1_btn: 'Поделиться',
    pwa_ios_step1_desc: '(иконка со стрелкой вверх внизу экрана).',
    pwa_ios_step2: '2. Прокрутите список вниз и выберите',
    pwa_ios_step2_btn: 'На экран «Домой»',
    pwa_ios_step3: '3. Нажмите',
    pwa_ios_step3_btn: 'Добавить',
    pwa_ios_step3_desc: 'в правом верхнем углу.',
    pwa_ios_got_it: 'Понятно',
    error_boundary_title: 'Обнаружена ошибка отображения',
    error_boundary_desc: 'Возможно, в браузере сохранились устаревшие или несовместимые данные тренировочных сессий.',
    error_boundary_reset: 'Восстановить исходные шаблоны (сбросить кэш)',
    error_boundary_reload: 'Перезагрузить страницу',
    timer_metronome_label: 'Метроном:',
    timer_no_work: 'Без работы (0с)',
    timer_rest_set_suffix: '(Отдых)',
    timer_rest_short: 'Передышка',
    timer_rest_cycle_prefix: 'Отдых перед циклом',

    // Journal extra
    journal_stat_workouts: 'Всего тренировок',
    journal_stat_time: 'Общее время',
    journal_stat_sets: 'Пройдено сетов',
    journal_stat_completed: 'Завершено на 100%',
    journal_export_csv: 'Экспорт в CSV',
    journal_table_date: 'Дата и время',
    journal_table_plan: 'План',
    journal_table_duration: 'Длительность',
    journal_table_sets: 'Сеты',
    journal_table_cycles: 'Циклы',
    journal_table_status: 'Статус',
    journal_status_completed: 'Завершена',
    journal_status_stopped: 'Остановлена',

    // C Code extra
    c_guide_cli_title: '1. CLI & GUI (Стандарт C99)',
    c_guide_cli_desc: 'Чистый C с разделением ядра и UI. Компилируется в консольное приложение через GCC/Clang или подключается к Raylib / ImGui / GTK.',
    c_guide_apk_title: '2. Android APK (NDK + JNI)',
    c_guide_apk_desc: 'Ядро компилируется в нативную библиотеку .so через Android NDK и работает внутри фонового Android Service без пауз.',
    c_guide_wasm_title: '3. Web & WebAssembly',
    c_guide_wasm_desc: 'Компиляция исходного C кода напрямую в бинарный Wasm модуль с помощью Emscripten (emcc) для веб-браузеров.',
    c_view_lines: 'строк',
    c_view_download: 'Скачать файл',
    c_view_copy: 'Копировать код',
    c_view_copied: 'Скопировано!',

    // Built-in Presets
    preset_tabata_name: 'Табата Классик',
    preset_tabata_desc: 'Высокоинтенсивный интервальный тренинг: 8 раундов по 20 сек работы и 10 сек отдыха.',
    preset_pyramid_name: 'HIIT Пирамида (Сложные сеты)',
    preset_pyramid_desc: 'Сложный цикл с переменной длительностью работы и отдыха для каждого сета.',
    preset_boxing_name: 'Боксёрские Раунды (3 мин)',
    preset_boxing_desc: '5 классических раундов по 3 минуты работы с 1 минутой отдыха между раундами.',
    preset_sprint_name: 'Интервальный Бег / Спринт',
    preset_sprint_desc: 'Взрывные ускорения 30 секунд с активным шагом 60 секунд. 2 цикла с отдыхом 2 минуты.',
    preset_core_name: 'Круговая для Пресса (Core)',
    preset_core_desc: '4 упражнения на пресс по 45 секунд работы и 15 секунд перехода. 3 круга.',
  },

  en: {
    // Navigation
    nav_timer: 'Timer (GUI)',
    nav_editor: 'Complex Cycles',
    nav_terminal: 'C Console (CLI)',
    nav_presets: 'Presets',
    nav_journal: 'Session Log',
    nav_c_code: 'C Code & Android',
    nav_new_cycle: 'New Cycle',
    nav_sound_on: 'Enable sound (M)',
    nav_sound_off: 'Mute sound (M)',
    nav_fullscreen: 'Fullscreen mode',
    core_engine_badge: 'Core Engine v2.0',
    core_engine_sub: 'ANSI CLI + Web GUI + Android APK Bridge',

    // Timer Phases
    phase_idle: 'Ready to start',
    phase_prep: 'PREPARATION',
    phase_work: 'WORK',
    phase_rest: 'REST',
    phase_cycle_rest: 'CYCLE REST',
    phase_paused: 'PAUSED',
    phase_completed: 'WORKOUT COMPLETED!',

    // Timer Display
    timer_cycle: 'Cycle',
    timer_set: 'Set',
    timer_of: 'of',
    timer_next: 'Next',
    timer_elapsed: 'Elapsed',
    timer_remaining: 'Remaining',
    timer_mode_radial: 'Radial',
    timer_mode_digital: 'Digital',
    timer_mode_minimal: 'Minimalist',
    timer_congrats: 'Great job!',
    timer_workout_done: 'You have completed all rounds of this workout session.',

    // Controls
    btn_start: 'START',
    btn_pause: 'PAUSE',
    btn_resume: 'RESUME',
    btn_reset: 'Reset',
    btn_prev_set: 'Previous set',
    btn_next_set: 'Next set',
    sound_settings: 'Audio settings',
    sound_theme: 'Sound theme',
    sound_volume: 'Volume',
    sound_metronome: 'Countdown metronome',
    sound_metronome_desc: 'Audio beeps on final 3-2-1 seconds',
    theme_athletic: 'Athletic buzzer',
    theme_boxing: 'Boxing bell',
    theme_digital: 'Digital beep',
    theme_wooden: 'Wooden metronome',
    hotkeys_title: 'Keyboard Shortcuts',
    hotkey_space: 'Space — Start / Pause',
    hotkey_r: 'R — Reset timer',
    hotkey_arrows: '← / → — Previous / Next set',
    hotkey_m: 'M — Toggle sound',

    // Editor
    editor_title: 'Complex Workout Cycle Designer',
    editor_subtitle: 'Configure intervals, supersets, cycle loops and recovery periods with C-compatible export',
    editor_plan_name: 'Workout Name',
    editor_plan_desc: 'Short description / notes',
    editor_prep_sec: 'Preparation (sec)',
    editor_cycles: 'Cycles count',
    editor_cycle_rest: 'Cycle rest (sec)',
    editor_sets_title: 'Interval sets per cycle',
    editor_add_set: 'Add interval',
    editor_set_name: 'Round / Exercise name',
    editor_work_sec: 'Work (s)',
    editor_rest_sec: 'Rest (s)',
    editor_save_plan: 'Apply and Save',
    editor_save_as_new: 'Save as new preset',
    editor_cancel_edit: 'Cancel editing',
    editor_reset_draft: 'Reset draft',
    editor_editing_badge: 'Editing preset',
    editor_total_time: 'Total cycle duration',
    editor_work_ratio: 'Active work ratio',

    // Presets
    presets_title: 'Workout Presets Library',
    presets_subtitle: 'Classic protocols (Tabata, Boxing, HIIT, EMOM) and your custom saved routines',
    presets_default_tab: 'Standard Protocols',
    presets_custom_tab: 'My Routines',
    presets_apply: 'Select for workout',
    presets_edit: 'Edit in designer',
    presets_export_json: 'Export presets (JSON)',
    presets_import_json: 'Import presets (JSON)',
    presets_reset_all: 'Restore defaults',
    presets_delete: 'Delete',
    presets_no_custom: 'You have not created custom routines yet. Use the cycle designer to create one!',
    presets_active_badge: 'Current active',

    // Journal
    journal_title: 'Workout Session Journal',
    journal_subtitle: 'Local log of completed training sessions with round and duration details',
    journal_clear_all: 'Clear log',
    journal_empty_title: 'Session journal is currently empty',
    journal_empty_desc: 'Complete a workout in the main timer view, and it will be recorded here automatically.',
    journal_total_sessions: 'Total sessions',
    journal_total_time: 'Total time',
    journal_sets_completed: 'Sets finished',
    journal_full_completion: 'Completed fully',
    journal_partial_completion: 'Stopped early',
    journal_date: 'Date & Time',
    journal_cycles_completed: 'Cycles done',

    // Terminal & C Code
    term_title: 'ANSI CLI Console (C Engine Emulator)',
    term_subtitle: 'Direct terminal emulation and ANSI C CLI runner',
    term_help_hint: 'Commands: help, start, pause, reset, skip, next, status, clear',
    term_run: 'Execute',
    term_clear: 'Clear output',
    c_code_title: 'Pure ANSI C Source Code (C99 / C11)',
    c_code_subtitle: 'Standalone C implementation supporting POSIX terminals, termios and Android NDK',
    c_code_copy: 'Copy C code',
    c_code_copied: 'Copied to clipboard!',
    c_code_download: 'Download timer.c',
    c_code_compile_hint: 'Compile on Linux/macOS/Termux using:',
    c_code_ndk_title: 'Android NDK / Termux build',

    // PWA & Common
    pwa_install: 'Install App',
    pwa_installed: 'App Installed',
    offline_ready: 'Works offline',
    language_label: 'Language',

    // Timer extra
    phase_prep_get_ready: 'Get Ready',
    badge_final_round: 'Final Set',
    test_sound_rest: 'Test Rest',
    test_sound_final: 'Test Final',
    footer_plan: 'Plan',
    footer_metronome: 'Metronome',
    footer_metronome_on: '3-2-1 sec',
    footer_metronome_off: 'Off',

    // Editor extra
    editor_c_ready_badge: 'C-Ready Struct',
    editor_autosave_badge: 'Autosaved on tab switch ✓',
    editor_custom_desc: 'Custom interval setup: you can set counter to 0s or delete any counter (work or rest) in a set.',
    editor_btn_new_cycle: 'Create New Complex Cycle',
    editor_btn_c_header: 'C Header (.h)',
    editor_btn_saved_as_new: 'Saved as New ✓',
    editor_btn_changes_saved: 'Changes Saved ✓',
    editor_btn_save_changes: 'Save Changes',
    editor_btn_start_timer: 'Start Timer',
    editor_warning_invalid_set: 'Warning: one or more sets have both counters deleted (0s work and 0s rest).',
    editor_warning_invalid_desc: 'Each set must contain at least one counter (work or rest), or remove the empty set using the trash button.',
    editor_plan_name_label: 'Workout / Program Name',
    editor_plan_name_placeholder: 'e.g., HIIT Pyramid',
    editor_delete_counter: 'Remove (0s)',
    editor_add_counter: '+ Add',
    editor_quick_gen_title: 'Quick Uniform Sets Generator:',
    editor_gen_sets_label: 'Sets:',
    editor_gen_work_label: 'Work:',
    editor_gen_rest_label: 'Rest:',
    editor_gen_no_work: '0s (no work)',
    editor_gen_no_rest: '0s (no rest)',
    editor_gen_btn: 'Generate',
    editor_remove_work_all: 'Remove work from all (0s)',
    editor_remove_rest_all: 'Remove rest from all (0s)',
    editor_add_work_all: '+30s work to all',
    editor_add_rest_all: '+15s rest to all',
    editor_set_placeholder: 'Exercise name',
    editor_move_up: 'Move set up',
    editor_move_down: 'Move set down',
    editor_duplicate_set: 'Duplicate set',
    editor_delete_set: 'Delete this set',
    editor_work_counter_title: 'Work counter:',
    editor_rest_counter_title: 'Rest counter:',
    editor_work_counter_empty: 'Counter deleted: work phase skipped (0s)',
    editor_rest_counter_empty: 'Counter deleted: rest phase skipped (advance to next set)',
    editor_both_counters_empty: 'Both counters are deleted in this set (0s work & 0s rest). Add work or rest, or delete this set.',
    editor_export_modal_title: 'Export Plan to C Structure (.h)',
    editor_export_modal_hint: 'Insert this code into c_src/ for use in the C program.',
    editor_close: 'Close',
    editor_total_sets: 'Sets',
    editor_prep: 'Preparation',
    editor_sets_list_title: 'List of sets and intervals',
    unit_min: 'min',
    unit_sec: 'sec',

    // Presets extra
    presets_card_create_title: 'Create New Preset',
    presets_card_create_desc: 'Construct a custom workout from scratch: sets, work/rest intervals, cycles, and C-export.',
    presets_card_create_btn: 'Open in Designer →',
    presets_badge_active: 'Active',
    presets_badge_custom: 'Custom',
    presets_badge_default: 'Built-in',
    presets_start_workout: 'Start',
    presets_apply_plan: 'Apply',
    presets_edit_plan: 'Edit',
    presets_delete_plan: 'Delete',
    presets_export_header: 'Export C (.h)',
    presets_modal_export_title: 'C Header (.h) for C Program',
    presets_modal_export_copy: 'Copy C Code',
    presets_modal_copied: 'Copied!',
    presets_confirm_reset: 'Restore factory default presets?',

    // Terminal extra
    term_copy_btn: 'Copy',
    term_copied_btn: 'Copied!',
    term_header_title: 'C INTERVAL TIMER',
    term_stat_plan: 'Workout',
    term_stat_cycle: 'Cycle',
    term_stat_set: 'Set',
    term_stat_exercise: 'Exercise',
    term_stat_phase: 'PHASE',
    term_stat_audio: 'AUDIO',
    term_stat_audio_on: 'ENABLED',
    term_stat_audio_off: 'MUTED',
    term_active_clock: 'TIMER ACTIVE — STANDARD TIME',
    term_time_until_change: 'TIME UNTIL NEXT INTERVAL',
    term_phase_progress: 'Phase progress:',
    term_total_time: 'Total time:',
    term_console_controls: 'CONSOLE CONTROLS:',
    term_ctrl_pause: 'Pause/Start',
    term_ctrl_reset: 'Reset',
    term_ctrl_skip: 'Skip',
    term_ctrl_sound: 'Sound',
    term_system_log: 'C Core System Event Log (stdout / stderr):',
    term_log_empty: 'No events yet. Start the timer.',
    term_countdown_warn: 'ATTENTION! COUNTDOWN',
    pwa_install_title: 'Install App (PWA)',
    pwa_ios_btn: 'To Home Screen',
    pwa_ios_title: 'Install on iPhone / iPad',
    pwa_ios_step1: '1. In Safari browser tap the button',
    pwa_ios_step1_btn: 'Share',
    pwa_ios_step1_desc: '(arrow pointing up icon at the bottom).',
    pwa_ios_step2: '2. Scroll down and choose',
    pwa_ios_step2_btn: 'Add to Home Screen',
    pwa_ios_step3: '3. Tap',
    pwa_ios_step3_btn: 'Add',
    pwa_ios_step3_desc: 'in the top right corner.',
    pwa_ios_got_it: 'Got it',
    error_boundary_title: 'Display Error Encountered',
    error_boundary_desc: 'Browser cache may contain outdated or incompatible workout session data.',
    error_boundary_reset: 'Restore original presets (clear cache)',
    error_boundary_reload: 'Reload page',
    timer_metronome_label: 'Metronome:',
    timer_no_work: 'No work (0s)',
    timer_rest_set_suffix: '(Rest)',
    timer_rest_short: 'Short rest',
    timer_rest_cycle_prefix: 'Rest before cycle',

    // Journal extra
    journal_stat_workouts: 'Total Workouts',
    journal_stat_time: 'Total Time',
    journal_stat_sets: 'Sets Completed',
    journal_stat_completed: '100% Completed',
    journal_export_csv: 'Export to CSV',
    journal_table_date: 'Date & Time',
    journal_table_plan: 'Plan',
    journal_table_duration: 'Duration',
    journal_table_sets: 'Sets',
    journal_table_cycles: 'Cycles',
    journal_table_status: 'Status',
    journal_status_completed: 'Completed',
    journal_status_stopped: 'Stopped',

    // C Code extra
    c_guide_cli_title: '1. CLI & GUI (C99 Standard)',
    c_guide_cli_desc: 'Pure C with core/UI separation. Compiles to console app via GCC/Clang or hooks into Raylib / ImGui / GTK.',
    c_guide_apk_title: '2. Android APK (NDK + JNI)',
    c_guide_apk_desc: 'Core compiles into native .so library via Android NDK and runs inside background Android Service without pauses.',
    c_guide_wasm_title: '3. Web & WebAssembly',
    c_guide_wasm_desc: 'Direct compilation of C source into binary Wasm module using Emscripten (emcc) for modern web browsers.',
    c_view_lines: 'lines',
    c_view_download: 'Download file',
    c_view_copy: 'Copy code',
    c_view_copied: 'Copied!',

    // Built-in Presets
    preset_tabata_name: 'Tabata Classic',
    preset_tabata_desc: 'High-intensity interval training: 8 rounds of 20s work and 10s rest.',
    preset_pyramid_name: 'HIIT Pyramid (Variable Sets)',
    preset_pyramid_desc: 'Complex cycle with variable work and rest durations for every step.',
    preset_boxing_name: 'Boxing Rounds (3 min)',
    preset_boxing_desc: '5 classic rounds of 3 minutes work with 1 minute rest between rounds.',
    preset_sprint_name: 'Interval Sprint / Run',
    preset_sprint_desc: 'Explosive 30-second sprints with 60 seconds active walking. 2 cycles with 2 min rest.',
    preset_core_name: 'Core & Abs Circuit',
    preset_core_desc: '4 core exercises with 45s work and 15s transition. 3 complete rounds.',
  },

  uk: {
    // Navigation
    nav_timer: 'Таймер (GUI)',
    nav_editor: 'Складні цикли',
    nav_terminal: 'C Консоль (CLI)',
    nav_presets: 'Шаблони',
    nav_journal: 'Журнал сесій',
    nav_c_code: 'C Код & Android',
    nav_new_cycle: 'Новий цикл',
    nav_sound_on: 'Увімкнути звук (M)',
    nav_sound_off: 'Вимкнути звук (M)',
    nav_fullscreen: 'Повноекранний режим',
    core_engine_badge: 'Core Engine v2.0',
    core_engine_sub: 'ANSI CLI + Web GUI + Android APK Bridge',

    // Timer Phases
    phase_idle: 'Готовий до старту',
    phase_prep: 'ПІДГОТОВКА',
    phase_work: 'РОБОТА',
    phase_rest: 'ВІДПОЧИНОК',
    phase_cycle_rest: 'ВІДПОЧИНОК МІЖ ЦИКЛАМИ',
    phase_paused: 'ПАУЗА',
    phase_completed: 'ТРЕНУВАННЯ ЗАВЕРШЕНО!',

    // Timer Display
    timer_cycle: 'Цикл',
    timer_set: 'Сет',
    timer_of: 'з',
    timer_next: 'Далі',
    timer_elapsed: 'Минуло',
    timer_remaining: 'Залишилось',
    timer_mode_radial: 'Круговий',
    timer_mode_digital: 'Цифровий',
    timer_mode_minimal: 'Мінімалізм',
    timer_congrats: 'Чудова робота!',
    timer_workout_done: 'Ви повністю завершили всі раунди тренування.',

    // Controls
    btn_start: 'СТАРТ',
    btn_pause: 'ПАУЗА',
    btn_resume: 'ПРОДОВЖИТИ',
    btn_reset: 'Скидання',
    btn_prev_set: 'Попередній сет',
    btn_next_set: 'Наступний сет',
    sound_settings: 'Налаштування аудіо',
    sound_theme: 'Тема звуку',
    sound_volume: 'Гучність',
    sound_metronome: 'Метроном зворотного відліку',
    sound_metronome_desc: 'Звукові сигнали на останніх 3-2-1 секундах',
    theme_athletic: 'Атлетичний зумер',
    theme_boxing: 'Боксерський гонг',
    theme_digital: 'Електронний писк',
    theme_wooden: 'Дерев’яний метроном',
    hotkeys_title: 'Гарячі клавіші',
    hotkey_space: 'Пробіл — Старт / Пауза',
    hotkey_r: 'R — Скинути таймер',
    hotkey_arrows: '← / → — Попередній / Наступний сет',
    hotkey_m: 'M — Звук Увімк/Вимк',

    // Editor
    editor_title: 'Конструктор складних тренувальних циклів',
    editor_subtitle: 'Налаштуйте інтервали, суперсети, цикли та відновлення з експортом у C-сумісний формат',
    editor_plan_name: 'Назва тренування',
    editor_plan_desc: 'Короткий опис / примітки',
    editor_prep_sec: 'Підготовка (сек)',
    editor_cycles: 'Кількість циклів',
    editor_cycle_rest: 'Відпочинок між циклами (сек)',
    editor_sets_title: 'Інтервальні сети всередині циклу',
    editor_add_set: 'Додати інтервал',
    editor_set_name: 'Назва раунду / вправи',
    editor_work_sec: 'Робота (с)',
    editor_rest_sec: 'Відпочинок (с)',
    editor_save_plan: 'Застосувати та зберегти',
    editor_save_as_new: 'Зберегти як новий шаблон',
    editor_cancel_edit: 'Скасувати редагування',
    editor_reset_draft: 'Скинути чернетку',
    editor_editing_badge: 'Редагується шаблон',
    editor_total_time: 'Загальний час циклу',
    editor_work_ratio: 'Частка корисного навантаження',

    // Presets
    presets_title: 'Бібліотека готових шаблонів',
    presets_subtitle: 'Класичні протоколи (Табата, бокс, HIIT, EMOM) та ваші власні програми',
    presets_default_tab: 'Стандартні протоколи',
    presets_custom_tab: 'Мої програми',
    presets_apply: 'Обрати для тренування',
    presets_edit: 'Змінити в конструкторі',
    presets_export_json: 'Експорт шаблонів (JSON)',
    presets_import_json: 'Імпорт шаблонів (JSON)',
    presets_reset_all: 'Відновити за замовчуванням',
    presets_delete: 'Видалити',
    presets_no_custom: 'Ви поки що не створили власних шаблонів. Скористайтеся конструктором циклів!',
    presets_active_badge: 'Поточний активний',

    // Journal
    journal_title: 'Журнал тренувань',
    journal_subtitle: 'Локальна історія завершених занять з деталями раундів та тривалості',
    journal_clear_all: 'Очистити журнал',
    journal_empty_title: 'Журнал тренувань порожній',
    journal_empty_desc: 'Завершіть тренування у вікні таймера, і сесія автоматично збережеться тут.',
    journal_total_sessions: 'Усього сесій',
    journal_total_time: 'Загальний час',
    journal_sets_completed: 'Виконано сетів',
    journal_full_completion: 'Завершено повністю',
    journal_partial_completion: 'Зупинено завчасно',
    journal_date: 'Дата та час',
    journal_cycles_completed: 'Завершено циклів',

    // Terminal & C Code
    term_title: 'ANSI CLI Консоль (Емулятор C ядра)',
    term_subtitle: 'Прямий термінальний вивід та емуляція консольної програми на ANSI C',
    term_help_hint: 'Команди: help, start, pause, reset, skip, next, status, clear',
    term_run: 'Виконати',
    term_clear: 'Очистити вивід',
    c_code_title: 'Чистий вихідний код на ANSI C (C99 / C11)',
    c_code_subtitle: 'Повністю автономна програма мовою C з підтримкою POSIX терміналів та Android NDK',
    c_code_copy: 'Скопіювати код C',
    c_code_copied: 'Скопійовано в буфер!',
    c_code_download: 'Завантажити timer.c',
    c_code_compile_hint: 'Скомпілюйте на Linux/macOS/Termux командою:',
    c_code_ndk_title: 'Збірка для Android NDK / Termux',

    // PWA & Common
    pwa_install: 'Встановити додаток',
    pwa_installed: 'Додаток встановлено',
    offline_ready: 'Працює автономно офлайн',
    language_label: 'Мова',

    // Timer extra
    phase_prep_get_ready: 'Приготуйтесь',
    badge_final_round: 'Фінал',
    test_sound_rest: 'Тест відпочинку',
    test_sound_final: 'Тест фіналу',
    footer_plan: 'План',
    footer_metronome: 'Метроном',
    footer_metronome_on: '3-2-1 сек',
    footer_metronome_off: 'Вимк',

    // Editor extra
    editor_c_ready_badge: 'C-Ready Struct',
    editor_autosave_badge: 'Автозбереження при зміні вкладок ✓',
    editor_custom_desc: 'Індивідуальне налаштування інтервалів: ви можете встановити лічильник у 0с або видалити будь-який лічильник (роботи чи відпочинку) в сеті.',
    editor_btn_new_cycle: 'Створити новий складний цикл',
    editor_btn_c_header: 'C Заголовок (.h)',
    editor_btn_saved_as_new: 'Збережено як новий ✓',
    editor_btn_changes_saved: 'Зміни збережено ✓',
    editor_btn_save_changes: 'Зберегти зміни',
    editor_btn_start_timer: 'Запустити таймер',
    editor_warning_invalid_set: 'Увага: в одному або декількох сетах видалено обидва лічильники (робота 0с і відпочинок 0с).',
    editor_warning_invalid_desc: 'У кожному сеті має бути принаймні один лічильник (робота чи відпочинок), або видаліть порожній сет кнопкою кошика.',
    editor_plan_name_label: 'Назва тренування / програми',
    editor_plan_name_placeholder: 'Наприклад: HIIT Піраміда',
    editor_delete_counter: 'Видалити (0с)',
    editor_add_counter: '+ Додати',
    editor_quick_gen_title: 'Швидкий генератор рівномірних сетів:',
    editor_gen_sets_label: 'Сетів:',
    editor_gen_work_label: 'Робота:',
    editor_gen_rest_label: 'Відпочинок:',
    editor_gen_no_work: '0с (без роботи)',
    editor_gen_no_rest: '0с (без відпочинку)',
    editor_gen_btn: 'Згенерувати',
    editor_remove_work_all: 'Видалити роботу в усіх (0с)',
    editor_remove_rest_all: 'Видалити відпочинок в усіх (0с)',
    editor_add_work_all: '+30с роботи всім',
    editor_add_rest_all: '+15с відпочинку всім',
    editor_set_placeholder: 'Назва вправи',
    editor_move_up: 'Перемістити сет вгору',
    editor_move_down: 'Перемістити сет вниз',
    editor_duplicate_set: 'Дублювати сет',
    editor_delete_set: 'Видалити цей сет',
    editor_work_counter_title: 'Лічильник роботи:',
    editor_rest_counter_title: 'Лічильник відпочинку:',
    editor_work_counter_empty: 'Лічильник видалено: фазу роботи пропущено (0с)',
    editor_rest_counter_empty: 'Лічильник видалено: відпочинок пропущено (перехід до наст. сету)',
    editor_both_counters_empty: 'У сеті видалено обидва лічильники (0с роботи та 0с відпочинку). Додайте роботу чи відпочинок, або видаліть цей сет.',
    editor_export_modal_title: 'Експорт плану у структуру C (.h)',
    editor_export_modal_hint: 'Вставте цей код у c_src/ для використання в C програмі.',
    editor_close: 'Закрити',
    editor_total_sets: 'Сетів',
    editor_prep: 'Підготовка',
    editor_sets_list_title: 'Список сетів та інтервалів',
    unit_min: 'хв',
    unit_sec: 'сек',

    // Presets extra
    presets_card_create_title: 'Створити новий шаблон',
    presets_card_create_desc: 'Сконструювати довільне тренування з нуля: сети, інтервали роботи та відпочинку, цикли та C-експорт.',
    presets_card_create_btn: 'Відкрити в конструкторі →',
    presets_badge_active: 'Активний',
    presets_badge_custom: 'Користувацький',
    presets_badge_default: 'Вбудований',
    presets_start_workout: 'Запустити',
    presets_apply_plan: 'Застосувати',
    presets_edit_plan: 'Редагувати',
    presets_delete_plan: 'Видалити',
    presets_export_header: 'Експорт C (.h)',
    presets_modal_export_title: 'C Заголовок (.h) для C програми',
    presets_modal_export_copy: 'Копіювати C код',
    presets_modal_copied: 'Скопійовано!',
    presets_confirm_reset: 'Відновити заводські шаблони за замовчуванням?',

    // Terminal extra
    term_copy_btn: 'Копіювати',
    term_copied_btn: 'Скопійовано!',
    term_header_title: 'ІНТЕРВАЛЬНИЙ ТАЙМЕР НА C',
    term_stat_plan: 'План / Workout',
    term_stat_cycle: 'Цикл / Cycle',
    term_stat_set: 'Сет / Set',
    term_stat_exercise: 'Вправа',
    term_stat_phase: 'ФАЗА',
    term_stat_audio: 'ЗВУК / AUDIO',
    term_stat_audio_on: 'УВІМК / ENABLED',
    term_stat_audio_off: 'ВИМК / MUTED',
    term_active_clock: 'ТАЙМЕР АКТИВНИЙ — СТАНДАРТНИЙ ЧАС',
    term_time_until_change: 'ЧАС ДО ЗМІНИ ІНТЕРВАЛУ',
    term_phase_progress: 'Фаза прогрес:',
    term_total_time: 'Загальний час:',
    term_console_controls: 'КЕРУВАННЯ В КОНСОЛІ:',
    term_ctrl_pause: 'Пауза/Старт',
    term_ctrl_reset: 'Скидання',
    term_ctrl_skip: 'Пропуск',
    term_ctrl_sound: 'Звук',
    term_system_log: 'Системний журнал подій C ядра (stdout / stderr):',
    term_log_empty: 'Подій поки немає. Запустіть таймер.',
    term_countdown_warn: 'УВАГА! ЗВОРОТНИЙ ВІДЛІК',
    pwa_install_title: 'Встановити додаток (PWA)',
    pwa_ios_btn: 'На екран',
    pwa_ios_title: 'Встановлення на iPhone / iPad',
    pwa_ios_step1: '1. У браузері Safari натисніть кнопку',
    pwa_ios_step1_btn: 'Поділитися',
    pwa_ios_step1_desc: '(значок зі стрілкою вгору внизу екрана).',
    pwa_ios_step2: '2. Прокрутіть список вниз і виберіть',
    pwa_ios_step2_btn: 'На початковий екран',
    pwa_ios_step3: '3. Натисніть',
    pwa_ios_step3_btn: 'Додати',
    pwa_ios_step3_desc: 'у правому верхньому куті.',
    pwa_ios_got_it: 'Зрозуміло',
    error_boundary_title: 'Виявлено помилку відображення',
    error_boundary_desc: 'Можливо, у браузері збереглися застарілі або несумісні дані тренувальних сесій.',
    error_boundary_reset: 'Відновити початкові шаблони (скинути кеш)',
    error_boundary_reload: 'Перезавантажити сторінку',
    timer_metronome_label: 'Метроном:',
    timer_no_work: 'Без роботи (0с)',
    timer_rest_set_suffix: '(Відпочинок)',
    timer_rest_short: 'Перепочинок',
    timer_rest_cycle_prefix: 'Відпочинок перед циклом',

    // Journal extra
    journal_stat_workouts: 'Усього тренувань',
    journal_stat_time: 'Загальний час',
    journal_stat_sets: 'Пройдено сетів',
    journal_stat_completed: 'Завершено на 100%',
    journal_export_csv: 'Експорт у CSV',
    journal_table_date: 'Дата та час',
    journal_table_plan: 'План',
    journal_table_duration: 'Тривалість',
    journal_table_sets: 'Сети',
    journal_table_cycles: 'Цикли',
    journal_table_status: 'Статус',
    journal_status_completed: 'Завершено',
    journal_status_stopped: 'Зупинено',

    // C Code extra
    c_guide_cli_title: '1. CLI & GUI (Стандарт C99)',
    c_guide_cli_desc: 'Чистий C з розділенням ядра та UI. Компілюється у консольний додаток через GCC/Clang або підключається до Raylib / ImGui / GTK.',
    c_guide_apk_title: '2. Android APK (NDK + JNI)',
    c_guide_apk_desc: 'Ядро компілюється в нативну бібліотеку .so через Android NDK і працює всередині фонового Android Service без пауз.',
    c_guide_wasm_title: '3. Web & WebAssembly',
    c_guide_wasm_desc: 'Пряма компіляція сирцевого C коду у бінарний Wasm модуль за допомогою Emscripten (emcc) для веб-браузерів.',
    c_view_lines: 'рядків',
    c_view_download: 'Завантажити файл',
    c_view_copy: 'Копіювати код',
    c_view_copied: 'Скопійовано!',

    // Built-in Presets
    preset_tabata_name: 'Табата Класик',
    preset_tabata_desc: 'Високоінтенсивний інтервальний тренінг: 8 раундів по 20 сек роботи та 10 сек відпочинку.',
    preset_pyramid_name: 'HIIT Піраміда (Складні сети)',
    preset_pyramid_desc: 'Складний цикл зі змінною тривалістю роботи та відпочинку для кожного сету.',
    preset_boxing_name: 'Боксерські Раунди (3 хв)',
    preset_boxing_desc: '5 класичних раундів по 3 хвилини роботи з 1 хвилиною відпочинку між раундами.',
    preset_sprint_name: 'Інтервальний Біг / Спринт',
    preset_sprint_desc: 'Вибухові прискорення 30 секунд з активною ходьбою 60 секунд. 2 цикли з відпочинком 2 хвилини.',
    preset_core_name: 'Колове тренування для Преса (Core)',
    preset_core_desc: '4 вправи на прес по 45 секунд роботи та 15 секунд переходу. 3 кола.',
  },
};

export function getLocalizedPresetMeta(
  planId: string,
  t: (key: keyof Translations) => string
): { name?: string; description?: string } {
  switch (planId) {
    case 'tabata-classic':
      return { name: t('preset_tabata_name'), description: t('preset_tabata_desc') };
    case 'hiit-pyramid':
      return { name: t('preset_pyramid_name'), description: t('preset_pyramid_desc') };
    case 'boxing-rounds':
      return { name: t('preset_boxing_name'), description: t('preset_boxing_desc') };
    case 'sprint-intervals':
      return { name: t('preset_sprint_name'), description: t('preset_sprint_desc') };
    case 'core-abs-circuit':
      return { name: t('preset_core_name'), description: t('preset_core_desc') };
    default:
      return {};
  }
}

