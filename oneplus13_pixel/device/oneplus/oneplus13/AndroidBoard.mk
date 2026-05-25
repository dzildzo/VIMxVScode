LOCAL_PATH := $(call my-dir)

ifeq ($(TARGET_DEVICE),oneplus13)

include $(CLEAR_VARS)
LOCAL_MODULE := kernel
LOCAL_MODULE_SUFFIX := .img
LOCAL_MODULE_CLASS := KERNEL
LOCAL_KERNEL := $(TARGET_KERNEL_SOURCE)/arch/arm64/boot/Image.gz-dtb
include $(BUILD_SYSTEM)/base_rules.mk

$(LOCAL_BUILT_MODULE): $(LOCAL_KERNEL)
	@echo "Building Kernel"
	$(hide) cp $(LOCAL_KERNEL) $@

endif
