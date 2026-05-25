# oneshot properties
setprop vendor.radio.atfwd.dsm_retry 1

# USB properties
setprop persist.vendor.usb.config diag,serial_cdev,rmnet,dpl,nmea,qdss,mtp
setprop sys.usb.config diag,serial_cdev,rmnet,dpl,nmea,qdss,mtp
setprop sys.usb.config.func.count 7

# Display properties
setprop debug.sf.enable_gl_tracing 0
setprop ro.surface_flinger.use_content_detection_for_refresh_rate true
setprop ro.surface_flinger.max_frame_buffer_acquired_buffers 3

# Audio properties
setprop ro.audio.samplerate 96000
setprop vendor.audio_hal.period_size 192

# Camera properties
setprop vendor.camera.aux.packagelist org.codeaurora.snapcam,com.android.camera

# Thermal properties
setprop persist.vendor.thermal.debug 0

# WiFi properties
setprop wlan.driver.config /data/misc/wifi/WCNSS_qcom_cfg.ini

# Start essential services
start vendor.audio-hal-7-1
start vendor.bluetooth-hal-1-1
start vendor.camera-provider-2-7
start vendor.gnss-2-1
start vendor.graphics.allocator-4-0
start vendor.graphics.composer-2-4
start vendor.health-hal-2-1
start vendor.light-hal-2-0
start vendor.power-hal-1-3
start vendor.sensors-hal-2-1
start vendor.thermal-hal-2-0
start vendor.usb-gadget-hal-1-3
start vendor.wifi-hal-1-5

# Set system properties
setprop ro.build.characteristics nosdcard

# Enable doze mode
setprop doze.enabled 1

# Enable quick tap
setprop config.quick_tap_enabled true
