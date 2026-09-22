/**
 * @file interval_timer_jni.c
 * @brief Android JNI Bridge for Interval Timer C Core.
 * Connects com.intervaltimer.core.IntervalTimerNative to interval_timer.c
 */

#include <jni.h>
#include <android/log.h>
#include <string.h>
#include <pthread.h>
#include "../interval_timer.h"

#define LOG_TAG "IntervalTimerJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static IntervalTimer g_timer;
static JavaVM* g_jvm = NULL;
static jobject g_listener_obj = NULL;
static pthread_mutex_t g_timer_mutex = PTHREAD_MUTEX_INITIALIZER;

/* Cached JNI Method IDs for fast callback dispatch */
static jmethodID g_mid_on_tick = NULL;
static jmethodID g_mid_on_phase_change = NULL;
static jmethodID g_mid_on_metronome = NULL;
static jmethodID g_mid_on_complete = NULL;

/* JNI LifeCycle */
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    g_jvm = vm;
    LOGI("JNI_OnLoad: Interval Timer Native Module Loaded");
    return JNI_VERSION_1_6;
}

/* Helper to get JNIEnv for current thread */
static JNIEnv* get_jni_env(int* should_detach) {
    *should_detach = 0;
    if (!g_jvm) return NULL;
    
    JNIEnv* env = NULL;
    jint res = (*g_jvm)->GetEnv(g_jvm, (void**)&env, JNI_VERSION_1_6);
    if (res == JNI_EDETACHED) {
        if ((*g_jvm)->AttachCurrentThread(g_jvm, &env, NULL) == JNI_OK) {
            *should_detach = 1;
        } else {
            return NULL;
        }
    }
    return env;
}

/* C Callbacks delegating to JVM/Kotlin */
static void jni_on_tick_callback(const IntervalTimer* timer, void* user_data) {
    if (!g_listener_obj || !g_mid_on_tick) return;
    int should_detach = 0;
    JNIEnv* env = get_jni_env(&should_detach);
    if (!env) return;

    (*env)->CallVoidMethod(env, g_listener_obj, g_mid_on_tick,
                          (jint)timer->current_phase,
                          (jint)timer->seconds_in_phase,
                          (jint)timer->total_phase_seconds,
                          (jint)timer->current_set_index,
                          (jint)timer->current_cycle_index,
                          (jint)timer->total_elapsed_seconds);

    if (should_detach) {
        (*g_jvm)->DetachCurrentThread(g_jvm);
    }
}

static void jni_on_phase_change_callback(TimerPhase old_phase, TimerPhase new_phase, const IntervalTimer* timer, void* user_data) {
    if (!g_listener_obj || !g_mid_on_phase_change) return;
    int should_detach = 0;
    JNIEnv* env = get_jni_env(&should_detach);
    if (!env) return;

    (*env)->CallVoidMethod(env, g_listener_obj, g_mid_on_phase_change,
                          (jint)old_phase,
                          (jint)new_phase);

    if (should_detach) {
        (*g_jvm)->DetachCurrentThread(g_jvm);
    }
}

static void jni_on_metronome_callback(int remaining_seconds, const IntervalTimer* timer, void* user_data) {
    if (!g_listener_obj || !g_mid_on_metronome) return;
    int should_detach = 0;
    JNIEnv* env = get_jni_env(&should_detach);
    if (!env) return;

    (*env)->CallVoidMethod(env, g_listener_obj, g_mid_on_metronome, (jint)remaining_seconds);

    if (should_detach) {
        (*g_jvm)->DetachCurrentThread(g_jvm);
    }
}

static void jni_on_complete_callback(const IntervalTimer* timer, void* user_data) {
    if (!g_listener_obj || !g_mid_on_complete) return;
    int should_detach = 0;
    JNIEnv* env = get_jni_env(&should_detach);
    if (!env) return;

    (*env)->CallVoidMethod(env, g_listener_obj, g_mid_on_complete,
                          (jint)timer->total_elapsed_seconds);

    if (should_detach) {
        (*g_jvm)->DetachCurrentThread(g_jvm);
    }
}

/* JNI Native Methods */

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeInit(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_init(&g_timer);
    
    /* Hook our JNI callbacks */
    g_timer.on_tick = jni_on_tick_callback;
    g_timer.on_phase_change = jni_on_phase_change_callback;
    g_timer.on_metronome = jni_on_metronome_callback;
    g_timer.on_complete = jni_on_complete_callback;
    
    pthread_mutex_unlock(&g_timer_mutex);
    LOGI("nativeInit completed");
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeRegisterListener(JNIEnv* env, jobject thiz, jobject listener) {
    pthread_mutex_lock(&g_timer_mutex);
    if (g_listener_obj) {
        (*env)->DeleteGlobalRef(env, g_listener_obj);
        g_listener_obj = NULL;
    }
    
    if (listener) {
        g_listener_obj = (*env)->NewGlobalRef(env, listener);
        jclass clazz = (*env)->GetObjectClass(env, listener);
        
        g_mid_on_tick = (*env)->GetMethodID(env, clazz, "onNativeTick", "(IIIIII)V");
        g_mid_on_phase_change = (*env)->GetMethodID(env, clazz, "onNativePhaseChange", "(II)V");
        g_mid_on_metronome = (*env)->GetMethodID(env, clazz, "onNativeMetronome", "(I)V");
        g_mid_on_complete = (*env)->GetMethodID(env, clazz, "onNativeComplete", "(I)V");
    }
    pthread_mutex_unlock(&g_timer_mutex);
    LOGI("nativeRegisterListener completed");
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeUnregisterListener(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    if (g_listener_obj) {
        (*env)->DeleteGlobalRef(env, g_listener_obj);
        g_listener_obj = NULL;
        g_mid_on_tick = NULL;
        g_mid_on_phase_change = NULL;
        g_mid_on_metronome = NULL;
        g_mid_on_complete = NULL;
    }
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeSetPlan(
    JNIEnv* env, jobject thiz,
    jstring jname,
    jint prepSeconds,
    jint cycles,
    jint cycleRestSeconds,
    jobjectArray setsArray) {

    pthread_mutex_lock(&g_timer_mutex);
    WorkoutPlan plan;
    memset(&plan, 0, sizeof(WorkoutPlan));

    const char* c_name = (*env)->GetStringUTFChars(env, jname, NULL);
    if (c_name) {
        strncpy(plan.name, c_name, MAX_NAME_LEN - 1);
        (*env)->ReleaseStringUTFChars(env, jname, c_name);
    } else {
        strcpy(plan.name, "Workout");
    }

    plan.prep_seconds = prepSeconds;
    plan.cycles = cycles;
    plan.cycle_rest_seconds = cycleRestSeconds;

    jsize num_sets = (*env)->GetArrayLength(env, setsArray);
    if (num_sets > MAX_SETS) num_sets = MAX_SETS;
    plan.num_sets = num_sets;

    if (num_sets > 0) {
        jobject first_set = (*env)->GetObjectArrayElement(env, setsArray, 0);
        jclass set_cls = (*env)->GetObjectClass(env, first_set);
        jfieldID fid_name = (*env)->GetFieldID(env, set_cls, "name", "Ljava/lang/String;");
        jfieldID fid_work = (*env)->GetFieldID(env, set_cls, "workSeconds", "I");
        jfieldID fid_rest = (*env)->GetFieldID(env, set_cls, "restSeconds", "I");
        jfieldID fid_sf_work = (*env)->GetFieldID(env, set_cls, "soundWorkFreq", "I");
        jfieldID fid_sf_rest = (*env)->GetFieldID(env, set_cls, "soundRestFreq", "I");

        for (int i = 0; i < num_sets; i++) {
            jobject set_obj = (*env)->GetObjectArrayElement(env, setsArray, i);
            jstring jset_name = (jstring)(*env)->GetObjectField(env, set_obj, fid_name);
            const char* set_name_str = jset_name ? (*env)->GetStringUTFChars(env, jset_name, NULL) : NULL;

            if (set_name_str) {
                strncpy(plan.sets[i].name, set_name_str, MAX_NAME_LEN - 1);
                (*env)->ReleaseStringUTFChars(env, jset_name, set_name_str);
            } else {
                snprintf(plan.sets[i].name, MAX_NAME_LEN, "Set %d", i + 1);
            }

            plan.sets[i].work_seconds = (*env)->GetIntField(env, set_obj, fid_work);
            plan.sets[i].rest_seconds = (*env)->GetIntField(env, set_obj, fid_rest);
            plan.sets[i].sound_work_freq = (*env)->GetIntField(env, set_obj, fid_sf_work);
            plan.sets[i].sound_rest_freq = (*env)->GetIntField(env, set_obj, fid_sf_rest);

            (*env)->DeleteLocalRef(env, set_obj);
            if (jset_name) (*env)->DeleteLocalRef(env, jset_name);
        }
        (*env)->DeleteLocalRef(env, first_set);
        (*env)->DeleteLocalRef(env, set_cls);
    }

    timer_set_plan(&g_timer, &plan);
    pthread_mutex_unlock(&g_timer_mutex);
    LOGI("nativeSetPlan: configured %d sets, %d cycles", plan.num_sets, plan.cycles);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeStart(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_start(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativePause(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_pause(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeResume(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_resume(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeTogglePause(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_toggle_pause(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeReset(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_reset(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeSkipNext(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_skip_next(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

JNIEXPORT void JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeTickSecond(JNIEnv* env, jobject thiz) {
    pthread_mutex_lock(&g_timer_mutex);
    timer_tick_second(&g_timer);
    pthread_mutex_unlock(&g_timer_mutex);
}

/* Fast getters */
JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetPhase(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.current_phase;
}

JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetSecondsRemaining(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.seconds_in_phase;
}

JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetTotalPhaseSeconds(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.total_phase_seconds;
}

JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetCurrentSet(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.current_set_index;
}

JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetCurrentCycle(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.current_cycle_index;
}

JNIEXPORT jint JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeGetTotalElapsed(JNIEnv* env, jobject thiz) {
    return (jint)g_timer.total_elapsed_seconds;
}

JNIEXPORT jboolean JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeIsRunning(JNIEnv* env, jobject thiz) {
    return (jboolean)g_timer.is_running;
}

JNIEXPORT jboolean JNICALL
Java_com_intervaltimer_core_IntervalTimerNative_nativeIsPaused(JNIEnv* env, jobject thiz) {
    return (jboolean)g_timer.is_paused;
}
