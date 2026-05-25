# Copyright (C) 2024 The LineageOS Project
# SPDX-License-Identifier: Apache-2.0

# Device tree for OnePlus 13
# Based on SM8750 platform

PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/rootdir/etc/init.oneplus13.rc:$(TARGET_COPY_OUT_VENDOR)/etc/init/hw/init.oneplus13.rc \
    $(LOCAL_PATH)/rootdir/init.oneplus13.usb.rc:$(TARGET_COPY_OUT_VENDOR)/etc/init/hw/init.oneplus13.usb.rc \
    $(LOCAL_PATH)/rootdir/ueventd.oneplus13.rc:$(TARGET_COPY_OUT_VENDOR)/etc/ueventd.rc

PRODUCT_PACKAGES += \
    init.oneplus13

# Overlays
DEVICE_PACKAGE_OVERLAYS += \
    $(LOCAL_PATH)/overlay/frameworks/base/core/res \
    $(LOCAL_PATH)/overlay/packages/apps/Settings

# AAPT configuration
PRODUCT_AAPT_CONFIG := normal
PRODUCT_AAPT_PREF_CONFIG := xxxhdpi

# Shipping API level (Android 15)
PRODUCT_SHIPPING_API_LEVEL := 35

# Inherit common product settings
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Vendor security patch level
VENDOR_SECURITY_PATCH := 2024-12-01

# Build fingerprint
PRODUCT_BUILD_PROP_OVERRIDES += \
    PRIVATE_BUILD_DESC="oneplus13-user 15 AP3A.240905.015 release-keys" \
    PRODUCT_NAME="oneplus13" \
    PRODUCT_DEVICE="oneplus13" \
    PRODUCT_MODEL="OnePlus 13" \
    PRODUCT_BRAND="OnePlus" \
    PRODUCT_MANUFACTURER="OnePlus"

BUILD_FINGERPRINT := "OnePlus/oneplus13/oneplus13:15/AP3A.240905.015:user/release-keys"
