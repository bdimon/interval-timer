# Инструкция по сборке и запуску Android-версии Interval Timer
## (Native Kotlin + Jetpack Compose + C NDK / JNI)

### 1. Архитектурный обзор

Проект Android построен по **нативной отказоустойчивой модели**:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Jetpack Compose UI (Material 3)             │
│   (Круговой индикатор, фазы, кнопки управления, редактор)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ StateFlow (UI State)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            TimerForegroundService (Android Service)         │
│  • Partial WakeLock (работа при выключенном экране телефона)│
│  • Notification с Live Countdown & кнопками управления     │
│  • AndroidAudioEngine (синтез тонов 880/440 Гц через PCM)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JNI Callbacks / Commands
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             IntervalTimerNative (JNI Bridge C <-> JVM)      │
│                 (c_src/android/interval_timer_jni.c)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ C99 API Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 C-Ядро (c_src/interval_timer.c)             │
│            • Стейт-машина без дрифта времени                │
│            • Статическая память, 0 утечек, 0 GC             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Структура файлов в репозитории

* `c_src/interval_timer.h` & `c_src/interval_timer.c` — проверенное временем C-ядро проекта.
* `c_src/android/CMakeLists.txt` — конфигуратор компиляции C-кода в `libinterval_timer_native.so` через Android NDK.
* `c_src/android/interval_timer_jni.c` — JNI-мост (C -> JVM callbacks и JVM -> C commands).
* `android/app/src/main/kotlin/com/intervaltimer/core/IntervalTimerNative.kt` — Kotlin-обертка и структуры данных.
* `android/app/src/main/kotlin/com/intervaltimer/audio/AndroidAudioEngine.kt` — нативный синтезатор тонов без внешних файлов.
* `android/app/src/main/kotlin/com/intervaltimer/service/TimerForegroundService.kt` — фоновый сервис с WakeLock и уведомлением.
* `android/app/src/main/AndroidManifest.xml` — декларация разрешений (WakeLock, Foreground Service, Notifications).
* `android/app/build.gradle.kts` — конфигурация Gradle с интеграцией CMake.

---

### 3. Открытие и запуск в Android Studio

1. **Требования:**
   - Android Studio Iguana / Jellyfish / Koala (или новее).
   - Android NDK (версия 25.x или 26.x) и CMake (3.22.1+), устанавливаемые через `SDK Manager` -> `SDK Tools`.
   - JDK 17.

2. **Шаги:**
   - Откройте Android Studio -> **Open** -> выберите каталог `android/`.
   - Gradle выполнит синхронизацию проекта и подтянет `CMakeLists.txt` из `c_src/android/`.
   - Запустите проект на физическом устройстве или эмуляторе (Shift + F10).

3. **Проверка работы в фоне (Screen Off Test):**
   - Запустите таймер (например, Табата).
   - Заблокируйте экран смартфона кнопкой Power.
   - Убедитесь, что звуковые сигналы (880 Гц / 440 Гц / 3-секундный метроном) воспроизводятся с идеальной точностью, а на экране блокировки отображается интерактивный плеер таймера.
