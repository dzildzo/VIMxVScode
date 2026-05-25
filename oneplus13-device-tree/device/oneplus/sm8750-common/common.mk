#
# Copyright (C) 2024 The LineageOS Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

COMMON_PATH := device/oneplus/sm8750-common

# AAPT
PRODUCT_AAPT_CONFIG := normal
PRODUCT_AAPT_PREF_CONFIG := xxhdpi

# Boot animation
TARGET_SCREEN_HEIGHT := 3168
TARGET_SCREEN_WIDTH := 1440

# Audio
PRODUCT_PACKAGES += \
    android.hardware.audio@7.1-impl \
    android.hardware.audio.effect@7.0-impl \
    android.hardware.soundtrigger@2.3-impl \
    audio.primary.sm8750 \
    audio.r_submix.default \
    audio.usb.default \
    libaudio-resampler \
    libqcompostprocbundle \
    libqcomvisualizer \
    libqcomvoiceprocessing \
    libvolumelistener \
    tinymix

PRODUCT_COPY_FILES += \
    $(COMMON_PATH)/configs/audio/audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/audio_policy_configuration.xml \
    frameworks/av/services/audiopolicy/config/a2dp_audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/a2dp_audio_policy_configuration.xml \
    frameworks/av/services/audiopolicy/config/a2dp_in_audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/a2dp_in_audio_policy_configuration.xml \
    frameworks/av/services/audiopolicy/config/bluetooth_audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/bluetooth_audio_policy_configuration.xml \
    frameworks/av/services/audiopolicy/config/r_submix_audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/r_submix_audio_policy_configuration.xml \
    frameworks/av/services/audiopolicy/config/usb_audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/usb_audio_policy_configuration.xml

# Bluetooth
PRODUCT_PACKAGES += \
    android.hardware.bluetooth@1.1-impl-qti \
    android.hardware.bluetooth@1.1-service-qti \
    vendor.qti.hardware.bluetooth_audio@2.1-impl \
    vendor.qti.hardware.btconfigstore@1.0-impl \
    vendor.qti.hardware.btconfigstore@2.0-impl

# Camera
PRODUCT_PACKAGES += \
    android.hardware.camera.provider@2.7-impl \
    android.hardware.camera.provider@2.7-service_64 \
    libdng_sdk.vendor \
    libcamera2ndk_vendor \
    libgui_vendor

# Display
PRODUCT_PACKAGES += \
    android.hardware.graphics.allocator@4.0-impl \
    android.hardware.graphics.allocator@4.0-service \
    android.hardware.graphics.composer@2.4-impl \
    android.hardware.graphics.composer@2.4-service \
    android.hardware.graphics.mapper@4.0-impl \
    android.hardware.memtrack@1.0-impl \
    android.hardware.memtrack@1.0-service \
    gralloc.sm8750 \
    hwcomposer.sm8750 \
    memtrack.sm8750 \
    libdisplayconfig.qti \
    libdisplayconfig.system.qti \
    libqdMetaData \
    libsdmcore \
    libsdmutils \
    libtinyxml

# DRM
PRODUCT_PACKAGES += \
    android.hardware.drm@1.4-impl \
    android.hardware.drm@1.4-service.widevine

# Gatekeeper
PRODUCT_PACKAGES += \
    android.hardware.gatekeeper@1.0-impl \
    android.hardware.gatekeeper@1.0-service

# GPS
PRODUCT_PACKAGES += \
    android.hardware.gnss@2.1-impl-qti \
    android.hardware.gnss@2.1-service-qti

# Health
PRODUCT_PACKAGES += \
    android.hardware.health@2.1-impl \
    android.hardware.health@2.1-service

# Keymaster
PRODUCT_PACKAGES += \
    android.hardware.keymaster@4.1-impl \
    android.hardware.keymaster@4.1-service

# Light
PRODUCT_PACKAGES += \
    android.hardware.light@2.0-impl \
    android.hardware.light@2.0-service \
    lights.sm8750

# Media
PRODUCT_PACKAGES += \
    libOmxAacEnc \
    libOmxAmrEnc \
    libOmxCore \
    libOmxEvrcEnc \
    libOmxG711Enc \
    libOmxQcelp13Enc \
    libOmxVdec \
    libOmxVenc \
    libstagefrighthw

# NFC
PRODUCT_PACKAGES += \
    android.hardware.nfc@1.2-service \
    com.android.nfc_extras \
    NfcNci \
    SecureElement \
    Tag

# Power
PRODUCT_PACKAGES += \
    android.hardware.power@1.3-impl \
    android.hardware.power@1.3-service \
    power.sm8750

# QMI
PRODUCT_PACKAGES += \
    libjson

# Radio
PRODUCT_PACKAGES += \
    android.hardware.radio@1.6-impl \
    android.hardware.radio@1.6-service \
    android.hardware.radio.config@1.3-impl \
    android.hardware.radio.config@1.3-service \
    librmnetctl

# RenderScript
PRODUCT_PACKAGES += \
    android.hardware.renderscript@1.0-impl

# Sensors
PRODUCT_PACKAGES += \
    android.hardware.sensors@2.1-impl \
    android.hardware.sensors@2.1-service \
    sensors.sm8750

# Thermal
PRODUCT_PACKAGES += \
    android.hardware.thermal@2.0-impl \
    android.hardware.thermal@2.0-service \
    thermal.sm8750

# USB
PRODUCT_PACKAGES += \
    android.hardware.usb@1.3-impl \
    android.hardware.usb@1.3-service

# Vibrator
PRODUCT_PACKAGES += \
    android.hardware.vibrator@1.3-impl \
    android.hardware.vibrator@1.3-service

# WiFi
PRODUCT_PACKAGES += \
    android.hardware.wifi@1.5-service \
    hostapd \
    libwifi-hal-qcom \
    wpa_supplicant \
    wpa_supplicant.conf

# Init scripts
PRODUCT_PACKAGES += \
    fstab.qcom \
    fstab.qcom.ramdisk \
    init.oneplus.sm8750.rc \
    init.oneplus.sm8750.usb.rc \
    ueventd.oneplus.sm8750.rc

# Soong namespaces
PRODUCT_SOONG_NAMESPACES += \
    $(COMMON_PATH)

# Inherit from proprietary files
$(call inherit-product, vendor/oneplus/sm8750-common/sm8750-common-vendor.mk)
