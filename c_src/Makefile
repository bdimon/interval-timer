# Makefile for C Interval Timer
# Compiles on Linux, macOS, and Windows (MinGW / MSYS2 / WSL)

CC = gcc
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

# Target for WebAssembly (requires emscripten 'emcc')
wasm:
	emcc interval_timer.c -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_timer_init', '_timer_set_plan', '_timer_start', '_timer_pause', '_timer_tick_second', '_timer_reset']" -s MODULARIZE=1 -o interval_timer_wasm.js

.PHONY: all clean wasm
