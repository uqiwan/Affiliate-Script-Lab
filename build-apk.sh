#!/usr/bin/env bash
set -e

echo "=== Membangun Gagaswara Teleprompter Android APK ==="

# 1. Build frontend web production bundle
echo "1. Membangun bundle web..."
npm run build

# 2. Sinkronisasi aset web ke proyek Android
echo "2. Menyinkronkan aset web ke Android..."
npx cap sync android

# 3. Compile APK Debug menggunakan Gradle
echo "3. Kompilasi APK Android Debug..."
cd android
./gradlew assembleDebug

echo "=== SELESAI ==="
echo "File APK berhasil dibuat di:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
