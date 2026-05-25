# Pixel UI for OnePlus 13

Этот проект представляет собой адаптацию интерфейса Pixel UI (на базе AOSP) для устройства OnePlus 13.

## Структура проекта

```
oneplus13_pixel/
├── device/oneplus/oneplus13/    # Конфигурация устройства
├── kernel/oneplus/sm8750/       # Ядро для Snapdragon 8 Gen 4
└── proprietary/                 # Проприетарные файлы (требуют дамп с устройства)
```

## Необходимые компоненты

### 1. Исходный код AOSP/Pixel
- Базовая прошивка Android 15 (Pixel UI)
- Репозитории: https://android.googlesource.com/

### 2. Драйверы OnePlus 13
- Прошивки модема
- Драйверы дисплея
- Драйверы камеры
- Драйверы сенсоров
- Firmware blobs

### 3. Инструменты сборки
- Android Build System
- Jack/Jill или Soong
- Кросс-компилятор для ARM64

## Инструкция по сборке

### Требования
- Ubuntu 20.04/22.04 LTS
- Минимум 256GB свободного места
- 32GB+ RAM
- Python 3.8+

### Шаг 1: Подготовка окружения

```bash
sudo apt update
sudo apt install -y git curl python3 openjdk-17-jdk wget
```

### Шаг 2: Инициализация репозитория

```bash
mkdir ~/pixel_oneplus13
cd ~/pixel_oneplus13
repo init -u https://android.googlesource.com/platform/manifest -b android-15.0.0_r1
```

### Шаг 3: Синхронизация исходников

```bash
repo sync -c -j$(nproc --all)
```

### Шаг 4: Добавление устройства OnePlus 13

Скопируйте файлы из этого репозитория в соответствующие директории:

```bash
cp -r device/oneplus/oneplus13/* $ANDROID_BUILD_TOP/device/oneplus/oneplus13/
```

### Шаг 5: Получение проприетарных файлов

**ВАЖНО**: Проприетарные файлы необходимо получить путем дампа с работающего устройства OnePlus 13 с установленной OxygenOS.

```bash
# Подключите устройство с root-доступом
adb root
adb pull /vendor/lib64 proprietary/vendor/lib64
adb pull /vendor/firmware proprietary/vendor/firmware
# и т.д.
```

### Шаг 6: Сборка

```bash
source build/envsetup.sh
lunch pixel_oneplus13-userdebug
make -j$(nproc --all)
```

### Шаг 7: Прошивка

```bash
fastboot flash boot out/target/product/oneplus13/boot.img
fastboot flash system out/target/product/oneplus13/system.img
fastboot flash vendor out/target/product/oneplus13/vendor.img
fastboot reboot
```

## Особенности Pixel UI

- Чистый Android интерфейс
- Google Now Launcher
- Material You дизайн
- Своевременные обновления безопасности
- Интеграция с сервисами Google

## Предупреждения

⚠️ **ВНИМАНИЕ**: 
- Прошивка кастомных ROM может привести к потере гарантии
- Возможна потеря данных - сделайте резервную копию
- Некоторые функции могут не работать (камера, VoLTE, etc.)
- Используйте на свой страх и риск

## Лицензия

AOSP licensed under Apache 2.0
Проприетарные компоненты принадлежат их правообладателям

## Поддержка

Для вопросов и обсуждения посетите:
- XDA Developers Forum
- Telegram каналы разработки
