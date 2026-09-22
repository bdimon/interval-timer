#!/usr/bin/env bash
# ==============================================================================
# Скрипт подготовки окружения для Android NDK + Kotlin разработки
# Платформа: Ubuntu MATE 24.04 LTS (Noble Numbat)
# Проект: Interval Timer C & Android Suite
# ==============================================================================

set -e

echo "=== [1/5] Обновление системных репозиториев apt ==="
sudo apt update

echo "=== [2/5] Установка базовых утилит сборки, Git, C/C++ компиляторов и KVM ==="
sudo apt install -y \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    git \
    curl \
    wget \
    unzip \
    libvulkan1 \
    qemu-kvm \
    libvirt-daemon-system \
    libvirt-clients \
    bridge-utils \
    android-sdk-platform-tools-common

echo "=== [3/5] Установка OpenJDK 17 (стандарт для Android Gradle) ==="
sudo apt install -y openjdk-17-jdk

echo "=== [4/5] Добавление текущего пользователя в группы виртуализации (KVM) ==="
sudo adduser "$USER" kvm || true
sudo usermod -aG libvirt "$USER" || true

echo "=== [5/5] Проверка версий ==="
echo "Java:"
java -version
echo "GCC:"
gcc --version | head -n 1
echo "KVM готовность эмулятора:"
if [ -e /dev/kvm ]; then
    echo "✓ /dev/kvm обнаружен. Аппаратная виртуализация для эмулятора Android доступна!"
else
    echo "⚠ /dev/kvm не найден. Включите Intel VT-x или AMD-V в BIOS/UEFI компьютера."
fi

echo ""
echo "=================================================================="
echo "Базовые пакеты установлены успешно!"
echo ""
echo "Варианты установки Android Studio БЕЗ snap:"
echo "1) Официальный архив .tar.gz (Рекомендуется для Linux):"
echo "   Скачайте с https://developer.android.com/studio"
echo "   Распакуйте в /opt или ~/android-studio и запустите bin/studio.sh"
echo ""
echo "2) Через Snap (если захотите):"
echo "   sudo snap install android-studio --classic"
echo "=================================================================="
