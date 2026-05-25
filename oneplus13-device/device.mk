# Copyright (C) 2024 The LineageOS Project
# SPDX-License-Identifier: Apache-2.0

PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/rootdir/Android.mk:$(TARGET_COPY_OUT_SYSTEM)/etc/init/hw/init.oneplus13.rc \
    $(LOCAL_PATH)/rootdir/init.oneplus13.usb.rc:$(TARGET_COPY_OUT_VENDOR)/etc/init/hw/init.oneplus13.usb.rc \
    $(LOCAL_PATH)/rootdir/ueventd.oneplus13.rc:$(TARGET_COPY_OUT_VENDOR)/etc/ueventd.rc

PRODUCT_PACKAGES += \
    init.oneplus13

PRODUCT_AAPT_CONFIG := normal
PRODUCT_AAPT_PREF_CONFIG := xxxhdpi

PRODUCT_SHIPPING_API_LEVEL := 35

$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)
