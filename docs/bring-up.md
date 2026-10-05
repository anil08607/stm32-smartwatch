# Prototype bring-up

Use a current-limited bench supply and bring up one bare assembled PCB before connecting the display, battery, and motor.

## 1. Unpowered inspection

- Confirm all IC orientations and connector pin-1 marks.
- Check resistance from USB5V, SYS, BAT and 3V3 to GND for unexpected shorts.
- Confirm no bottom-side components were fitted.
- Inspect U5, U6 and J1 under magnification; inspect hidden-joint packages with X-ray if available.

## 2. USB-C input and PD

1. Leave the LiPo, LCD and motor disconnected.
2. Connect through a USB-C PD analyzer and a current-limited source.
3. Confirm U3 requests **5 V only**; it must not negotiate 9 V or above.
4. Verify about 5 V at USB5V and the filtered PD_VIN node.
5. Check for abnormal current or heating before continuing.

## 3. Power rails

- Confirm the BQ25180 SYS output behaves as expected with no cell attached.
- Confirm TPS63802 output is 3.3 V within component and measurement tolerance.
- Check MCU VDD/VDDA, BMA456 VDD/VDDIO, and display VDD pads.
- Observe rail startup and ripple with an oscilloscope before connecting external loads.

## 4. Debug and firmware

Connect J3 using its custom pinout: 3V3 reference, SWDIO, GND, SWCLK, NRST, BOOT0. The programmer must sense 3V3 and must not backfeed the target. Confirm STM32 identification, erase/program/verify, reset and BOOT0 behavior.

Initial firmware should:

- configure the BQ25180 conservatively for the qualified 400 mAh pack;
- scan I2C and identify BMA456 and PCF8563;
- load the Bosch BMA456 wearable feature configuration;
- keep the LCD backlight and motor off by default;
- log battery ADC, charger interrupt, RTC interrupt and accelerometer interrupts;
- use line/tile display rendering instead of a full RGB565 framebuffer.

## 5. External devices

1. Power off before connecting the LCD flex, motor or LiPo.
2. Connect the LCD, verify SPI initialization at a conservative clock, then ramp brightness using PWM while measuring LED current.
3. Pulse the motor briefly and check Q2/D2 operation, rail droop and accelerometer disturbance.
4. Connect a polarity-verified protected LiPo. Start with a conservative 100–150 mA charge current and verify charge voltage, current, termination, power-path behavior and temperature.

## 6. Qualification before enclosure use

Record quiescent current in run/sleep/STOP modes, battery runtime, regulator ripple, thermal rise, USB attach/detach behavior, charging under system load, ESD robustness, RTC drift, motion calibration, button operation, display-flex reliability and motor-induced resets. Complete battery, sweat, drop and enclosure safety testing before treating the hardware as a wearable product.
