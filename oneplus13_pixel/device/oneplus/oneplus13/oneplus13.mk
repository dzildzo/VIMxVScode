# Device configuration for OnePlus 13
# Pixel UI adaptation

PRODUCT_NAME := pixel_oneplus13
PRODUCT_DEVICE := oneplus13
PRODUCT_MANUFACTURER := OnePlus
PRODUCT_BRAND := OnePlus
PRODUCT_MODEL := CPH2649
PRODUCT_SYSTEM_NAME := oneplus13

# Inherit from AOSP/Pixel base
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Device path
DEVICE_PACKAGE_OVERLAYS := device/oneplus/oneplus13/overlay
DEVICE_PATH := device/oneplus/oneplus13

# Boot animation
TARGET_SCREEN_WIDTH := 1440
TARGET_SCREEN_HEIGHT := 3168

# Properties
PRODUCT_PROPERTY_OVERRIDES += \
    ro.build.fingerprint=OnePlus/CPH2649/oneplus13:15/AP3A.240905.011.A2/user/release-keys \
    ro.product.device=oneplus13 \
    ro.product.manufacturer=OnePlus \
    ro.product.model=CPH2649 \
    ro.product.name=pixel_oneplus13

# Hardware features
PRODUCT_COPY_FILES += \
    frameworks/native/data/etc/handheld_core_hardware.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/handheld_core_hardware.xml \
    frameworks/native/data/etc/android.hardware.telephony.gsm.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.telephony.gsm.xml \
    frameworks/native/data/etc/android.hardware.camera.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.camera.xml \
    frameworks/native/data/etc/android.hardware.wifi.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.wifi.xml \
    frameworks/native/data/etc/android.hardware.bluetooth.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.bluetooth.xml \
    frameworks/native/data/etc/android.hardware.nfc.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.nfc.xml \
    frameworks/native/data/etc/android.hardware.usb.host.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.usb.host.xml

# Audio configuration
PRODUCT_COPY_FILES += \
    $(DEVICE_PATH)/configs/audio/audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/audio_policy_configuration.xml

# Display configuration
PRODUCT_COPY_FILES += \
    $(DEVICE_PATH)/configs/display/display_id_4630946755890129025.xml:$(TARGET_COPY_OUT_VENDOR)/etc/displayconfig/display_id_4630946755890129025.xml

# Keylayout files
PRODUCT_COPY_FILES += \
    $(DEVICE_PATH)/configs/keylayout/uinput-fpc.kl:$(TARGET_COPY_OUT_VENDOR)/usr/keylayout/uinput-fpc.kl \
    $(DEVICE_PATH)/configs/keylayout/uinput-goodix.kl:$(TARGET_COPY_OUT_VENDOR)/usr/keylayout/uinput-goodix.kl

# Init scripts
PRODUCT_PACKAGES += \
    init.oneplus13.rc \
    init.oneplus13.usb.rc

# Soong namespaces
PRODUCT_SOONG_NAMESPACES += \
    $(DEVICE_PATH)

# Vendor blob list (to be extracted from stock ROM)
PRODUCT_COPY_FILES += \
    $(DEVICE_PATH)/proprietary/vendor/lib64/libOmxVdec.so:$(TARGET_COPY_OUT_VENDOR)/lib64/libOmxVdec.so \
    $(DEVICE_PATH)/proprietary/vendor/lib64/libOmxVenc.so:$(TARGET_COPY_OUT_VENDOR)/lib64/libOmxVenc.so

# Call the proprietary setup
$(call inherit-product, vendor/oneplus/oneplus13/oneplus13-vendor.mk)
