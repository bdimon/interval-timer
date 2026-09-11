# ⏱️ Interval Timer: C & Web Suite (Интервальный Таймер)

Профессиональный кроссплатформенный комплекс интервального таймера с высокоточным ядром на языке **C (C99)** и интерактивным веб-интерфейсом на **React + TypeScript + Tailwind CSS**.

Комплекс спроектирован для высокоинтенсивных тренировок (HIIT, Табата, бокс, бег, кроссфит, круговые тренировки), а также техники Pomodoro и интервальной работы.

---

## 🌟 Основные возможности

1. **Модульное ядро на чистом Си (C99)**:
   - Стандартная библиотека времени (`<time.h>`, `<unistd.h>` / `<windows.h>`).
   - Конечный автомат состояний (`IDLE`, `PREP`, `WORK`, `REST`, `CYCLE_REST`, `PAUSED`, `COMPLETED`).
   - Поддержка вложенных сложных циклов (раунды, индивидуальные сеты, межцикловый отдых).
   - Поддержка интервалов **только для отдыха** (время работы = 0 секунд).
   - Точный расчет прошедшего и оставшегося времени без накопления ошибки дрейфа.

2. **Аудио-оповещения и звуковой движок**:
   - Настраиваемый 3-секундный метроном перед завершением фазы.
   - Различные звуковые сигналы для старта работы, отдыха и завершения тренировки.
   - **Особый торжественный звуковой сигнал на последнем сете цикла (раунда)**.
   - В C-коде: системные гудки (`Beep` на Windows, `\a` escape-последовательности на POSIX).
   - В Web GUI: Web Audio API синтезатор с 4 звуковыми темами (*Атлетический*, *Боксерский гонг*, *Деревянный темпл-блок*, *Цифровой синтезатор*).
   - Кнопка «Тест финала» для мгновенной проверки звучания.

3. **Интерактивный консольный интерфейс (CLI)**:
   - Псевдографические ASCII/ANSI шкалы прогресса (`[████████░░] 80%`).
   - Крупные цифровые часы в терминале.
   - Управление «на лету» без блокировки:
     - `[P]` / `[Space]` — Пауза / Возобновление.
     - `[R]` — Сброс таймера к началу.
     - `[S]` — Пропуск текущего интервала.
     - `[M]` — Включение / выключение звука.
     - `[Q]` — Выход из программы.

4. **Журнал завершенных сессий (Session Journal)**:
   - Автоматическая запись истории тренировок в файл `workout_journal.csv`.
   - Фиксация даты, времени, названия плана, длительности и процента выполнения.
   - Экспорт в форматы CSV и JSON.

5. **Конструктор и пресеты сложных тренировок**:
   - Быстрый генератор сетов (Табата 20/10, Боксерские раунды 180/60, Беговые ускорения, Pomodoro).
   - Возможность удаления пункта «Работа» (сброс в 0 сек) для построения программ растяжки, дыхательных пауз или циклического отдыха.
   - Создание кастомных сетов с произвольными именами и длительностями.

---

## 📂 Структура проекта

```text
.
├── README.md                      # Документация проекта
├── metadata.json                  # Метаданные приложения
├── package.json                   # Зависимости и скрипты сборки Web-версии
├── index.html                     # HTML5 точка входа Web GUI
├── src/
│   ├── main.tsx                   # Точка входа React
│   ├── App.tsx                    # Главный компонент, синхронизация таймера
│   ├── types.ts                   # Общие TypeScript интерфейсы и перечисления
│   ├── components/
│   │   ├── TimerDisplay.tsx       # Круговой SVG-таймер, индикаторы и бейджи
│   │   ├── TimerControls.tsx       # Кнопки управления, звуковые настройки, горячие клавиши
│   │   ├── WorkoutEditor.tsx      # Конструктор тренировок, быстрый генератор, сброс работы
│   │   ├── TerminalSimulator.tsx  # Интерактивный эмулятор C CLI в браузере
│   │   ├── JournalView.tsx        # Просмотр и экспорт журнала тренировок
│   │   └── CSourceViewer.tsx      # Встроенный просмотрщик исходного кода на Си
│   ├── utils/
│   │   ├── audioEngine.ts         # Синтезатор звуков и сигналов (Web Audio API)
│   │   └── presets.ts             # Предустановленные программы тренировок
│   └── c_code/
│       └── cSourceFiles.ts        # Исходный код C-ядра (interval_timer.h, .c, main_cli.c, Makefile)
```

---

## 🛠️ Сборка и запуск C-версии (CLI)

Исходный код ядра C находится в разделе «Код на C» интерфейса, либо его можно извлечь в отдельные файлы:
- `interval_timer.h`
- `interval_timer.c`
- `main_cli.c`
- `Makefile`

### Сборка с помощью GCC (Linux / macOS / MinGW):

```bash
# Быстрая сборка через Makefile:
make

# Либо прямая компиляция через gcc:
gcc -std=c99 -Wall -Wextra -O2 interval_timer.c main_cli.c -o interval_timer

# Запуск:
./interval_timer
```

### Сборка с помощью Clang:

```bash
clang -std=c99 -Wall -Wextra -O2 interval_timer.c main_cli.c -o interval_timer
./interval_timer
```

### Сборка на Windows (MSVC):

```cmd
cl /W4 /O2 interval_timer.c main_cli.c /Fe:interval_timer.exe
interval_timer.exe
```

---

## 🌐 Запуск Web GUI

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка производственной версии
npm run build
```

---

## 📜 Рекомендуемая история коммитов (Git Commit Log)

Ниже приведена хронологическая последовательность коммитов в соответствии со стандартом **Conventional Commits**:

### 1. `feat(core): initial C interval timer engine and data structures`
```text
feat(core): initial C interval timer engine and data structures

- Implement IntervalTimer state machine in C99 (interval_timer.h, interval_timer.c)
- Define TimerPhase enum (PREP, WORK, REST, CYCLE_REST, PAUSED, COMPLETED)
- Add IntervalSet and WorkoutPlan struct definitions
- Implement timer_init, timer_tick_second, timer_toggle_pause, and timer_reset
- Support multi-cycle repetitions and inter-cycle recovery intervals
```

### 2. `feat(cli): interactive console UI with non-blocking controls and ASCII bars`
```text
feat(cli): interactive console UI with non-blocking controls and ASCII bars

- Implement interactive console loop in main_cli.c
- Add dynamic ASCII progress bar rendering and digital countdown display
- Integrate non-blocking keyboard input polling (kbhit / getch for Win32 and termios for POSIX)
- Support hotkeys: [P] pause/resume, [R] reset, [S] skip, [M] toggle mute, [Q] quit
- Add colored terminal phase indicators
```

### 3. `feat(audio): cross-platform audio notifications and 3-second metronome`
```text
feat(audio): cross-platform audio notifications and 3-second metronome

- Implement timer_play_sound, timer_play_work_signal, timer_play_rest_signal
- Add timer_play_metronome_tick for final 3-second countdown countdown
- Use Win32 Beep API on Windows and terminal ASCII bell \a sequences on POSIX
- Add Web Audio API synthesis engine (audioEngine.ts) with Athletic, Boxing, Wood, and Digital sound profiles
```

### 4. `feat(persistence): session history logger and preset file serialization`
```text
feat(persistence): session history logger and preset file serialization

- Implement timer_log_session_to_file to append completed sessions to CSV
- Add file parser and serializer for custom workout configurations
- Create interactive preset picker with Tabata, Boxing, Sprint, and Pomodoro presets
- Implement Web GUI Journal view with CSV and JSON data export
```

### 5. `feat(gui): responsive web interface and interactive terminal simulator`
```text
feat(gui): responsive web interface and interactive terminal simulator

- Build modern React + TypeScript + Tailwind CSS application
- Implement SVG circular progress ring timer with countdown display
- Add interactive TerminalSimulator replicating the exact C CLI experience
- Include integrated CSourceViewer tab allowing full code inspection and file download
```

### 6. `fix(gui): optimize countdown font sizing for circular timer display`
```text
fix(gui): optimize countdown font sizing for circular timer display

- Reduce digital countdown font size to fit cleanly inside SVG progress circle
- Prevent text clipping on smaller viewport widths and mobile screens
- Improve responsive typography scaling in TimerDisplay
```

### 7. `feat(editor): allow 0-second work intervals and add last-set round fanfare`
```text
feat(editor): allow 0-second work intervals and add last-set round fanfare

- Enable setting work interval duration to 0s in quick generator and per-set inputs
- Add "Reset work in all sets" action for rest-only and recovery routines
- Implement playLastSetSignal with energetic ascending fanfare for the final set of each cycle
- Update timer transition state machines in both TypeScript and C to seamlessly advance through 0s work intervals
- Add "Финал цикла!" badge in TimerDisplay and "Тест финала" audio preview button in TimerControls
```

---

## 📋 Лицензия

Проект распространяется под лицензией **MIT**. Подходит для свободного использования, модификации и внедрения в персональные и коммерческие проекты.
