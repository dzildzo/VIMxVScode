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

$(call inherit-product, device/oneplus/sm8750-common/common.mk)

# Device identifier
PRODUCT_DEVICE := oneplus13
PRODUCT_NAME := oneplus13
PRODUCT_BRAND := OnePlus
PRODUCT_MODEL := CPH2659
PRODUCT_MANUFACTURER := OnePlus

# Inherit from common
PRODUCT_SYSTEM_DEFAULT_PROPERTIES += \
    ro.product.model=CPH2659 \
    ro.product.brand=OnePlus \
    ro.product.device=oneplus13 \
    ro.build.product=oneplus13 \
    ro.manufacturer=OnePlus

# Overlay
DEVICE_PACKAGE_OVERLAYS += \
    device/oneplus/oneplus13/overlay

# Init
PRODUCT_PACKAGES += \
    init.oneplus13.rc \
    init.oneplus13.usb.rc

# Soong namespaces
PRODUCT_SOONG_NAMESPACES += \
    device/oneplus/oneplus13

# Inherit from proprietary files
$(call inherit-product, vendor/oneplus/oneplus13/oneplus13-vendor.mk)
