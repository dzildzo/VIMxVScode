# OnePlus 13 Device Tree for LineageOS / Pixel UI

## Overview
This repository contains the device tree configuration for porting Pixel UI (AOSP-based) to the OnePlus 13 smartphone based on the Qualcomm SM8750 platform.

## Device Specifications
- **Device Name**: OnePlus 13
- **Codename**: oneplus13
- **Platform**: Qualcomm SM8750 (Snapdragon 8 Gen 4)
- **Architecture**: ARM64-v8a
- **Android Version**: 15 (API Level 35)
- **RAM**: 12GB/16GB LPDDR5X
- **Storage**: 256GB/512GB/1TB UFS 4.0
- **Display**: 6.82" AMOLED, 3168x1440, 120Hz
- **Battery**: 6000 mAh with fast charging

## Directory Structure
```
oneplus13-device/
├── Android.mk                 # Main makefile
├── BoardConfig.mk             # Board configuration
├── device.mk                  # Product configuration
├── oneplus13.mk               # Device product definition
├── manifest.xml               # VINTF manifest
├── compatibility_matrix.xml   # Compatibility matrix
├── rootdir/                   # Init scripts and fstab
│   ├── Android.mk
│   ├── etc/
│   │   ├── init.oneplus13.rc
│   │   └── fstab.qcom
│   ├── init.oneplus13.usb.rc
│   └── ueventd.oneplus13.rc
├── overlay/                   # Resource overlays
│   ├── frameworks/base/core/res/res/values/config.xml
│   └── packages/apps/Settings/res/values/config.xml
├── proprietary/               # Proprietary blobs (placeholder)
│   ├── Android.mk
│   └── Android.bp
└── sepolicy/                  # SELinux policies
    └── vendor/
        └── oneplus_sepolicy.te
```

## Prerequisites
To build this device tree, you need:
1. AOSP source code (Android 15 or later)
2. LineageOS source tree (optional, for LineageOS builds)
3. Proprietary vendor blobs from OnePlus 13 stock firmware
4. Kernel source for SM8750 platform
5. Build environment with at least 100GB free disk space

## Build Instructions

### 1. Set up the build environment
```bash
# Clone AOSP or LineageOS
repo init -u https://android.googlesource.com/platform/manifest -b android-15.0.0_r1
repo sync -c -j$(nproc --all)

# Or for LineageOS
repo init -u https://github.com/LineageOS/android.git -b lineage-22.0
repo sync -c -j$(nproc --all)
```

### 2. Add device tree
```bash
cd <aosp-root>/device/oneplus
ln -s /path/to/oneplus13-device oneplus13
```

### 3. Extract proprietary blobs
```bash
# Extract from stock firmware
./extract-files.sh <path-to-stock-firmware>
```

### 4. Build
```bash
# Set up environment
source build/envsetup.sh
lunch lineage_oneplus13-userdebug

# Build bootimage
mka bootimage

# Build system image
mka systemimage

# Build full OTA package
mka bacon
```

## Features
- ✅ Basic AOSP functionality
- ✅ Display and touch support
- ✅ WiFi and Bluetooth
- ✅ Camera (basic)
- ✅ Audio playback and recording
- ✅ Sensors (accelerometer, gyroscope, proximity)
- ✅ USB OTG and MTP
- ✅ Fast charging support
- ✅ Alert slider customization
- ⚠️ VoLTE/VoWiFi (requires carrier configuration)
- ⚠️ Fingerprint sensor (needs vendor implementation)
- ⚠️ Face unlock (needs vendor implementation)

## Known Issues
- Some camera features may not work without proper vendor HAL
- Wireless charging calibration needed
- Some sensors require proprietary calibration data

## Contributing
Contributions are welcome! Please follow these guidelines:
1. Test your changes on actual hardware
2. Follow AOSP coding standards
3. Include detailed commit messages
4. Submit pull requests with clear descriptions

## License
Copyright (C) 2024 The LineageOS Project
SPDX-License-Identifier: Apache-2.0

## Disclaimer
This device tree is provided as-is without any warranty. Flashing custom ROMs may void your device warranty and could potentially brick your device. Use at your own risk.

## Support
For support and discussions, please visit:
- XDA Developers Forum
- LineageOS Gitter channels
- OnePlus community forums
