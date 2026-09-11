# Кроссплатформенная архитектура C Interval Timer
## (Console, GUI, WebAssembly, Android APK)

Данная реализация создана с четким разделением логики ядра (`interval_timer.h`, `interval_timer.c`) и уровня отображения (CLI / GUI / Web / Android).

---

### 1. Сборка и запуск Консольной версии (CLI)

#### Linux / macOS:
```bash
cd c_src
make
./interval_timer
```
Или напрямую через gcc:
```bash
gcc -O2 -std=c99 main.c interval_timer.c -o interval_timer
./interval_timer
```

#### Windows (MinGW / PowerShell / CMD):
```powershell
gcc -O2 main.c interval_timer.c -o interval_timer.exe
.\interval_timer.exe
```

---

### 2. Подключение графического интерфейса (GUI)

Ядро таймера использует архитектуру на функциях обратного вызова (Callbacks):
- `on_tick(timer, user_data)`
- `on_phase_change(old_phase, new_phase, timer, user_data)`
- `on_metronome(remaining_seconds, timer, user_data)`
- `on_complete(timer, user_data)`

Благодаря этому вы можете легко подключить:
- **Raylib** (легкий C GUI для всех платформ)
- **Dear ImGui** (C/C++ быстрый интерфейс)
- **GTK 3/4** или **Qt**
- **SDL2 / SDL3**

Пример интеграции с Raylib:
```c
#include "raylib.h"
#include "interval_timer.h"

int main(void) {
    InitWindow(600, 700, "Interval Timer GUI");
    SetTargetFPS(60);
    
    IntervalTimer timer;
    timer_init(&timer);
    // ... Настройка плана
    
    while (!WindowShouldClose()) {
        // Вызов timer_tick_second раз в секунду
        BeginDrawing();
        ClearBackground(RAYWHITE);
        DrawText(TextFormat("%02d:%02d", timer.seconds_in_phase / 60, timer.seconds_in_phase % 60), 200, 250, 60, DARKBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
```

---

### 3. Компиляция в Web (WebAssembly / Wasm)

С помощью **Emscripten** ядро компилируется напрямую в высокопроизводительный бинарный модуль WebAssembly:
```bash
emcc interval_timer.c -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS="['_timer_init', '_timer_set_plan', '_timer_start', '_timer_pause', '_timer_reset', '_timer_tick_second']" \
  -s MODULARIZE=1 -o interval_timer.js
```

---

### 4. Создание Android APK (Android NDK + JNI)

Для Android используется **Android NDK** (Native Development Kit):
1. Поместите `interval_timer.h` и `interval_timer.c` в папку `app/src/main/cpp/`.
2. Создайте мост JNI (`android_jni.c`):

```c
#include <jni.h>
#include "interval_timer.h"

static IntervalTimer g_timer;

JNIEXPORT void JNICALL
Java_com_example_intervaltimer_TimerService_initTimer(JNIEnv* env, jobject thiz) {
    timer_init(&g_timer);
}

JNIEXPORT jint JNICALL
Java_com_example_intervaltimer_TimerService_getSecondsRemaining(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.seconds_in_phase;
}

JNIEXPORT void JNICALL
Java_com_example_intervaltimer_TimerService_togglePause(JNIEnv* env, jobject thiz) {
    timer_toggle_pause(&g_timer);
}
```

3. В `app/build.gradle` добавьте `externalNativeBuild { cmake { path "src/main/cpp/CMakeLists.txt" } }`.
4. В Kotlin / Jetpack Compose / Flutter вы получаете доступ к C-ядру с нулевыми задержками и надежной фоновой работой сервиса.
