# CMakeLists.txt for Android NDK build of Interval Timer C Core
cmake_minimum_required(VERSION 3.22.1)

project("intervaltimer" C)

# Include parent directory where interval_timer.h and interval_timer.c reside
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/..)

# Define the shared native library
add_library(
    interval_timer_native
    SHARED
    interval_timer_jni.c
    ../interval_timer.c
)

# Find Android system logging library
find_library(
    log-lib
    log
)

# Link native libraries
target_link_libraries(
    interval_timer_native
    ${log-lib}
)
