# OnePlus 13 Device Tree for AOSP/LineageOS

## Устройство
- **Модель**: OnePlus 13 (CPH2659)
- **Процессор**: Qualcomm Snapdragon 8 Elite (SM8750)
- **Память**: 12GB/16GB RAM, 256GB/512GB/1TB storage
- **Дисплей**: 6.82" AMOLED, 3168x1440, 120Hz
- **Батарея**: 6000 mAh с быстрой зарядкой 100W

## Структура проекта

```
oneplus13-device-tree/
├── device/oneplus/
│   ├── sm8750-common/          # Общие файлы для платформы SM8750
│   │   ├── Android.mk
│   │   ├── common.mk           # Конфигурация общих пакетов
│   │   ├── manifest.xml        # VINTF манифест HAL
│   │   ├── compatibility_matrix.xml
│   │   ├── framework_compatibility_matrix.xml
│   │   ├── rootdir/
│   │   │   ├── init.oneplus.sm8750.rc
│   │   │   ├── init.oneplus.sm8750.usb.rc
│   │   │   ├── ueventd.oneplus.sm8750.rc
│   │   │   └── bin/
│   │   │       └── init.oneplus.sm8750.sh
│   │   ├── overlay/            # Ресурсные оверлеи
│   │   └── sepolicy/           # SELinux политики
│   └── oneplus13/              # Специфичные файлы устройства
│       ├── Android.mk
│       ├── BoardConfig.mk      # Конфигурация платы
│       ├── oneplus13.mk        # Продуктовая конфигурация
│       └── rootdir/
│           ├── fstab.qcom
│           ├── init.oneplus13.rc
│           └── init.oneplus13.usb.rc
└── proprietary/                # Проприетарные файлы (требуется извлечь)
```

## Требования для сборки

### 1. Исходный код AOSP/LineageOS
```bash
repo init -u https://github.com/LineageOS/android.git -b lineage-21.0
repo sync
```

### 2. Проприетарные файлы
Необходимо извлечь из стоковой прошивки OnePlus 13:
```bash
# Извлечь vendor раздел
adb pull /vendor/vendor.img
# Или использовать extract-files скрипт
./extract-files.sh
```

### 3. Ядро
Требуется ядро для SM8750 с поддержкой OnePlus 13:
- Исходники: https://github.com/OnePlus-Kernel-MSM
- Или предварительно собранное ядро

### 4. Инструменты сборки
- Ubuntu 20.04/22.04 LTS
- ~100-150 GB свободного места
- 16+ GB RAM рекомендуется
- Пакеты: git, repo, build-essential, libssl-dev и др.

## Сборка

### Настройка окружения
```bash
cd ~/android
source build/envsetup.sh
lunch lineage_oneplus13-userdebug
```

### Компиляция
```bash
# Собрать boot image
mka bootimage

# Собрать system image
mka systemimage

# Полная сборка
mka bacon
```

### Прошивка
```bash
# В режиме fastboot
fastboot flash boot out/target/product/oneplus13/boot.img
fastboot flash system out/target/product/oneplus13/system.img
fastboot flash vendor out/target/product/oneplus13/vendor.img
fastboot flash recovery out/target/product/oneplus13/recovery.img
fastboot reboot
```

## Поддерживаемые компоненты

| Компонент | Статус | Примечание |
|-----------|--------|------------|
| Дисплей | ✅ | 120Hz, HDR10+ |
| Touchscreen | ✅ | Multi-touch |
| WiFi | ✅ | WiFi 6E/7 |
| Bluetooth | ✅ | BT 5.4 |
| GPS | ✅ | Dual-band GNSS |
| Камера | ⚠️ | Требуется дополнительная настройка |
| Аудио | ✅ | Stereo speakers |
| USB | ✅ | USB-C 3.2, OTG |
| NFC | ✅ | Payment support |
| Sensors | ✅ | Accelerometer, Gyro, etc. |
| Fast Charging | ⚠️ | Требуется калибровка |
| Fingerprint | ⚠️ | Under-display sensor |
| Face Unlock | ⚠️ | Camera-based |

## Известные проблемы

1. **Камера**: Требуется точная настройка HAL для полной совместимости
2. **Быстрая зарядка**: Может потребоваться кастомное ядро
3. **Сканер отпечатков**: Нужна интеграция с Goodix/Synaptics драйвером

## Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменений (`git commit -m 'Add amazing feature'`)
4. Push на branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

Copyright (C) 2024 The LineageOS Project

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

## Контакты

- Issues: GitHub Issues
- Discussion: XDA Developers Forum
- Telegram: @OnePlus13Dev

## Disclaimer

Использование данного ПО осуществляется на ваш страх и риск. Авторы не несут ответственности за повреждение устройства, потерю данных или другие последствия.
