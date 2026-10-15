# Firmware integration contract

This directory defines the hardware interface; a tested smartwatch application is not supplied. The hardware release remains held until a real image is built, flashed and measured on this PCB.

Use nRF52810 QFAA (192 KiB flash, 24 KiB RAM), 32 MHz HFXO, 32.768 kHz LFXO and internal LDO. Keep `DCDCEN=0`: DCC has no external converter inductor. Configure both UICR PSELRESET registers for P0.21 only when programming this board. Initial programming and recovery use J3 SWD, not USB.

`pins.h` is the authoritative GPIO mapping. Use external pull-ups on the shared I2C bus. Devices: BMA456 0x18, PCF8563 0x51 and BQ25180 0x6A (7-bit addresses). Load the Bosch BMA456 configuration using its official driver. Set both button GPIOs as inputs and haptic/backlight control low before enabling outputs.

GC9A01A is a 240 x 240 RGB565 SPI display. A full 115,200-byte framebuffer cannot fit in the 24,576-byte RAM. Use bounded line/tile buffers (for example two 480-byte lines), and measure linked BLE-stack RAM/flash usage. Do not enable a generic full-framebuffer GUI configuration.

Read BQ25180 registers before changing limits. Initially cap charge current at 100 mA and battery regulation at 4.2 V; retain TS monitoring with the bonded 10 kohm NTC. Verify input current, thermal regulation, watchdog behavior, open/short NTC faults and battery removal. Firmware must never defeat TS faults to enable charging. The exact pack supplier's charge-temperature window takes precedence.

Battery ADC is P0.02/AIN0 through 1 Mohm / 330 kohm with 100 nF. Account for the 1.33/0.33 divider, ADC gain/reference and settling time; calibrate against a DMM. The main rail is nominal 3.05 V, not the LiPo voltage. Keep the motor off by default, limit haptic pulse duration, and use PWM for brightness.

Required acceptance: BLE advertising/connect/disconnect/recovery; display colour and orientation; both buttons; BMA interrupts; RTC retention; battery ADC accuracy; charge/temperature faults; sleep and active current; watchdog; recovery after fully discharged pack; and a flash/readback hash record. No firmware binary or measured runtime is claimed yet.
