# OnePlus 13 Device Tree for Pixel UI

## Информация об устройстве

- **Модель**: OnePlus 13 (CPH2649)
- **Процессор**: Qualcomm Snapdragon 8 Gen 4 (SM8750)
- **Дисплей**: 6.82" AMOLED, 3168x1440, 120Hz
- **ОЗУ**: 12/16/24 GB LPDDR5X
- **ПЗУ**: 256/512/1TB UFS 4.0
- **Камера**: 50MP + 50MP + 50MP тройная камера
- **Батарея**: 6000 mAh с быстрой зарядкой 100W

## Структура device tree

```
device/oneplus/oneplus13/
├── oneplus13.mk                 # Основной файл конфигурации
├── BoardConfig.mk              # Конфигурация сборки
├── AndroidBoard.mk             # Сборка ядра
├── AndroidProducts.mk          # Список продуктов
├── proprietary/                # Проприетарные файлы
│   └── vendor/lib64/           # Библиотеки вендора
├── configs/                    # Конфигурационные файлы
│   ├── audio/                  # Аудио конфигурация
│   ├── display/                # Дисплей конфигурация
│   └── keylayout/              # Раскладка клавиш
├── overlay/                    # Ресурсы для кастомизации
│   └── res/
│       ├── values/            # Строковые ресурсы
│       └── xml/               # XML конфигурации
└── rootdir/                   # Init скрипты
    ├── init.oneplus13.rc
    └── init.oneplus13.usb.rc
```

## Статус поддержки

### Работающее:
- ✅ Загрузка системы
- ✅ Дисплей (базовый)
- ✅ Сенсорный экран
- ✅ Wi-Fi
- ✅ Bluetooth
- ✅ Звук (базовый)
- ✅ Камера (базовая)
- ✅ USB
- ✅ SIM карты

### Возможные проблемы:
- ⚠️ VoLTE/VoWiFi (требует проприетарных библиотек)
- ⚠️ Продвинутые функции камеры
- ⚠️ Быстрая зарядка Warp Charge
- ⚠️ Сканер отпечатков под дисплеем
- ⚠️ NFC (может требовать дополнительной настройки)

## Требования для сборки

1. **AOSP/Pixel исходники** (Android 15)
2. **Проприетарные файлы** с OxygenOS
3. **Ядро** с поддержкой SM8750
4. **Vendor blobs** из стоковой прошивки

## Извлечение проприетарных файлов

Используйте утилиты для дампа:
```bash
# Подключите устройство с root доступом
adb root
adb pull /vendor vendor_dump
adb pull /firmware firmware_dump

# Или используйте oxygenos-dumper скрипт
git clone https://github.com/xyz/oxygenos-dumper
cd oxygenos-dumper
./extract.sh <path_to_oxygenos_zip>
```

## Компиляция ядра

```bash
cd kernel/oneplus/sm8750
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
make oneplus13_defconfig
make -j$(nproc)
```

## Тестирование

Перед прошивкой на основное устройство:
1. Протестируйте в эмуляторе (базовые функции)
2. Используйте тестовое устройство
3. Создайте полную резервную копию
4. Убедитесь в наличии режима восстановления

## Вклад в проект

Если вы хотите помочь с разработкой:
1. Форкните репозиторий
2. Создайте feature ветку
3. Протестируйте изменения
4. Отправьте Pull Request

## Контакты

- XDA Forum: [ссылка]
- Telegram: [ссылка]
- GitHub Issues: [ссылка]

## Лицензия

Device tree распространяется под лицензией Apache 2.0
Проприетарные компоненты принадлежат OnePlus и Qualcomm
