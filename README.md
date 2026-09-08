# SMARTWATCH V1 — STM32L432 Health & Fitness Watch Hardware

> A compact 40 mm round smartwatch PCB with a 240 x 240 color display, motion tracking, accurate battery-backed timekeeping, vibration alerts, USB-C charging, and a protected 400 mAh LiPo battery.

SMARTWATCH V1 is a standalone, non-radio wearable hardware platform built around the low-power STM32L432. It combines the display, sensors, controls, charging system, power rails, programming connector, and haptic driver required for a practical watch in one four-layer board design.

This repository contains the complete tscircuit PCB source, component models, schematic and routed PCB snapshots, procurement BOM, and hardware documentation. It defines the **watch electronics**; application firmware and the final enclosure are separate deliverables.

![SMARTWATCH V1 3D PCB preview](./__snapshots__/SMARTWATCH_V1_STM32.circuit-3d.snap.png)

_The preview shows the electronics PCB. The display panel folds over the board; the battery, enclosure, and wire-lead motor are installed separately._

## What this watch can support

- A full-color round watch interface on a 1.28-inch 240 x 240 IPS display.
- Time, date, alarm, and wake scheduling using a dedicated battery-backed RTC.
- Step counting, motion detection, and wrist-wake gestures using a BMA456 accelerometer.
- Silent vibration alerts through a MOSFET-driven coin vibration motor.
- Menu and select/back input through two physical side buttons.
- USB-C battery charging and simultaneous system operation through a charger with power-path management.
- Stable 3.3 V operation across the LiPo discharge curve using a buck-boost regulator.
- Battery-voltage measurement by the MCU for a software charge-level estimate.
- Direct firmware flashing and debugging through a keyed SWD connector.

These are hardware capabilities. Their user-facing behavior depends on the firmware, display UI, algorithms, calibration, and final enclosure.

## Hardware at a glance

| Subsystem | Part / implementation | What it provides |
| --- | --- | --- |
| Main controller | STM32L432KCU3 | 80 MHz Cortex-M4F, 256 KB flash, 64 KB SRAM |
| Display | ER-TFT1.28-3 / GC9A01A | 1.28-inch round 240 x 240 color IPS UI |
| Motion sensor | Bosch BMA456 | Steps, movement, orientation, and wake interrupts |
| Real-time clock | PCF8563TS + 32.768 kHz crystal | Accurate timekeeping, alarm, and timer interrupts |
| User controls | Two side buttons | Active-low menu and select/back inputs |
| Haptics | 12 mm coin vibration motor | Silent alerts and interaction feedback |
| Charger / power path | TI BQ25180 | Protected 1-cell LiPo charging and USB/battery power management |
| Main regulator | TI TPS63802 | Regulated 3.3 V buck-boost supply |
| Battery | Protected LP403035 1S LiPo | 3.7 V nominal, 400 mAh energy storage |
| External power | Power-only USB-C | 5 V charging input with CC resistors and VBUS TVS protection |
| Programming | Keyed 6-pin JST-SH SWD | SWDIO, SWCLK, reset, BOOT0, target reference, and ground |
| PCB | 40 mm round, 1 mm thick | Four layers with all components assembled on top |

## Deliberately not included in V1

V1 has no Bluetooth, Wi-Fi, cellular radio, GPS, NFC, touchscreen, speaker, microphone, external flash, or dedicated fuel-gauge IC. USB-C is used for power only; its USB data pins are not connected. The watch is therefore intended as a standalone embedded platform rather than a phone-connected notification watch.

## Current project status

- Schematic, component selection, pin allocation, placement, BOM, and 3D review assets are implemented.
- The placement build and strict electrical/connectivity checks pass.
- Firmware, enclosure, flex integration, and production validation are still required.
- **The PCB copper routing is not Gerber/order-ready.** Autorouted trials still have clearance/contact violations that must be resolved before fabrication.

## Schematic organization

The electrical design is separated into five named ANSI B schematic sheets. Named nets carry power and signals between sheets while all components remain part of the same physical PCB.

| Sheet | Contents |
| --- | --- |
| 1. Power, USB-C & Charging | USB-C input, protection, LiPo charger/power path, battery connector, and 3.3 V buck-boost |
| 2. MCU, Battery Monitor & Programming | STM32L432, local decoupling, reset/BOOT0, I2C pull-ups, battery ADC divider, and SWD connector |
| 3. Display & Backlight | LCD FPC connector, display control nets, backlight current limiting, and PWM MOSFET driver |
| 4. Motion & RTC | BMA456 accelerometer, PCF8563 RTC, crystal, interrupt pull-ups, and decoupling |
| 5. Buttons & Haptics | Two side buttons, pull-ups, vibration motor, MOSFET driver, flyback diode, and local bulk capacitor |

IC symbol bodies are sized to their pin groups rather than their physical package dimensions. The motion/RTC sheet keeps local decoupling close to each compact symbol.

The design follows the older Open-Smartwatch code pattern: one main board file contains the complete board, native passives, device instances, placement, and connections. Only reusable/custom package definitions live under `imports/`; there is no `blocks/` directory or separate `components.tsx`. The root `index.circuit.tsx` exports the board. `tscircuit.config.json` enables routing for builds, and `tscircuit.config.js` enables it for development previews and snapshots by default.

## What is implemented

- STM32L432KCU3, 80 MHz Cortex-M4, 256 KB flash, 64 KB SRAM, 26 GPIO, UFQFPN-32.
- EastRising/BuyDisplay ER-TFT1.28-3 complete 1.28-inch 240 x 240 GC9A01A IPS LCD panel, selected in the no-touch configuration. Its 15-pin, 0.5 mm-pitch plug-in FPC mates with a JLC-assembled JUSHUO AFC24-S15FIA-00 connector (`J4`, `C6709462`); unused touch pins are deliberately NC.
- PCF8563TS RTC on the battery rail with an FC-135 32.768 kHz crystal. The PCF8563 has internal oscillator load capacitance; external crystal capacitors are not fitted.
- BMA456 in I2C mode at address `0x18`: CSB high, SDO low, both interrupt outputs routed.
- BQ25180 USB charger/power-path IC and TPS63802 3.3 V buck-boost regulator.
- Sink-only USB-C with independent 5.1 kΩ CC1/CC2 pull-downs, grounded shell, and VBUS TVS protection. USB data pins are NC.
- Two side buttons using the old board's exact C51927172 footprint and pin map, a keyed 6-pin JST-SH SWD/programming connector, battery-voltage ADC divider, PWM LCD backlight, and MOSFET-driven coin vibration motor with flyback diode. The STM32 buttons are active-low with 100 kΩ external pull-ups: switch pin 1 goes to the GPIO, pin 2 goes to GND, and the two bracket/retention pads remain electrically unconnected.

## Power tree

```text
USB-C 5 V ──> BQ25180 IN ──> SYS ──> TPS63802 ──> 3V3
                      └────> BAT <── protected 1S LiPo
3V3 ─────────────────> MCU, display, BMA456
BAT ─────────────────> PCF8563 and MCU battery ADC divider
```

`SYS` is not used directly as the digital rail because it can exceed 3.3 V while USB is attached. TPS63802 uses 510 kΩ/91 kΩ feedback resistors: `0.5 V × (1 + 510/91) ≈ 3.30 V`.

## MCU resource check and pin map

The selected MCU is sufficient for this V1. A 240 x 240 RGB565 full framebuffer consumes 115,200 bytes, so it does not fit in 64 KB SRAM; firmware must render by lines/tiles or draw directly into the GC9A01 GRAM. Program flash (256 KB), one SPI bus, one I2C bus, ADC, timers/PWM, and the allocated GPIO are otherwise adequate.

| STM32 pin       | Function                             |
| --------------- | ------------------------------------ |
| PA0 / PA1       | Buttons 1 / 2                        |
| PA2             | Motor enable PWM/GPIO                |
| PA3             | BQ25180 interrupt                    |
| PA4 / PA5 / PA7 | LCD CS / SCK / MOSI                  |
| PA6             | Battery ADC (1 MΩ / 330 kΩ divider)  |
| PA8 / PA9       | BMA456 INT1 / INT2                   |
| PA10            | RTC interrupt                        |
| PA11            | Unused (NC)                         |
| PA13 / PA14     | SWDIO / SWCLK                        |
| PA15            | LCD backlight PWM                    |
| PB0 / PB1       | LCD D/C / reset                      |
| PB6 / PB7       | Shared I2C SCL / SDA                 |
| PH3             | BOOT0, 100 kΩ pull-down and J3       |

The MCU uses its internal high-speed oscillator; the only external crystal is the RTC crystal.

## Programming connector

`J3` replaces the six loose programming test pads with a keyed JST `SM06B-SRSS-TB(LF)(SN)` side-entry connector (`C160405`). Its cable pinout is custom and must not be confused with the ARM 10-pin Cortex-Debug pinout.

| J3 pin | Signal | Programmer connection                    |
| -----: | ------ | ---------------------------------------- |
|      1 | 3V3    | Target-voltage reference; do not backfeed |
|      2 | SWDIO  | SWD bidirectional data                   |
|      3 | GND    | Common ground                            |
|      4 | SWCLK  | SWD clock                                |
|      5 | NRST   | Target reset                             |
|      6 | BOOT0  | Optional boot-mode control               |

Use the matching JST `SHR-06V-S` cable housing with `SSH-003T-P0.2-H` crimp contacts. Normal flashing only needs 3V3 reference, SWDIO, GND, SWCLK, and NRST; leave BOOT0 low unless the ROM bootloader is intentionally required.

## Firmware requirements

At first boot, firmware must configure BQ25180 for the qualified pack. For the listed 400 mAh pack, use a conservative 100–150 mA charge current, 4.20 V regulation, and an appropriate USB input current limit. The charger starts in a low default charge-current state until configured over I2C.

Use the [Bosch BMA456 SensorAPI](https://github.com/boschsensortec/BMA456_SensorAPI), including the wearable feature configuration, at I2C address `0x18`. Disable the unused auxiliary interface (ASDA/ASCL are NC); the previous BMA400 driver at `0x14` is incompatible. Use STOP mode, BMA456 interrupts, RTC alarm interrupt, and display/backlight shutdown for practical battery life. The BMA456, PCF8563, and BQ25180 share I2C; the display has a dedicated SPI bus.

## Mechanical and safety constraints

- The PCB diameter is 40 mm (reduced from 50 mm, a 36% reduction in board area), with four layers and all components assembled on the top/display side. This is the PCB size, not a validated enclosure diameter. The USB-C receptacle is top-mounted at the lower edge; its mouth opens through the case sidewall. All pads retain the 0.2 mm board-edge clearance; no component uses `allowOffBoard`.
- `J4` is mounted on the top at the left side of the circular PCB. Insert the ER-TFT1.28-3 flex with its pin 1 aligned to the PCB pin-1 marker, lock the hinged lid, and fold the panel over the electronics PCB. The external LCD outline is intentionally not drawn as FR-4, so the placement render stays circular.
- The ER-TFT1.28-3 flex folds around the top-side connector. Validate contact orientation, pin-1 alignment, bend radius and connector access in an enclosure model. The listed rectangular battery, display, connector heights, case wall and cover still require a complete mechanical fit check; a 40 mm PCB alone does not establish a 40 mm finished watch.
- Keep the BMA456 away from the motor and mechanically isolate the motor where possible. Recalibrate step algorithms in the final case.
- Only use a protected, qualified 1S 4.20 V LiPo. The selected LP403035 pack has PCM protection but no NTC. R3=10 kΩ is the BQ25180 datasheet's fixed-TS option; it disables real pack-temperature monitoring. A production wearable should use a qualified NTC pack/connector revision and must pass charging, thermal, drop, sweat, and enclosure testing.
- Verify battery-connector polarity on every incoming lot. The listed battery needs a correctly polarized JST-SH pigtail/custom lead.

## Assembly status

The SMT BOM is JLCPCB-oriented. `LCD1` is the deliberate exception: order exact panel `ER-TFT1.28-3` directly from BuyDisplay in the **no-touch** configuration and install its flex after SMT assembly. JLCPCB can assemble `J4` (`AFC24-S15FIA-00`, `C6709462`), but its listing requires an assembly support fixture. `M1` is a wire-lead motor and is normally attached after SMT assembly. `BT1` is external.

The 2026-09-08 direct JLCPCB stock audit covers all 32 JLCPCB line items (56 components per board) for **5 boards**. All selected JLCPCB parts had sufficient available-to-order quantities when checked. [bom.csv](./bom.csv) records the quantities, timestamps, and source links; [bom-jlcpcb.csv](./bom-jlcpcb.csv) is the upload-format assembly BOM. See [sourcing/README.md](./sourcing/README.md) for replacement details and manual motor-assembly instructions. Stock is not reserved; JLCPCB adds assembly attrition during ordering. LCD1 and BT1 remain externally sourced, with current availability unverified.

## 3D CAD preview

The [routed PCB preview](./__snapshots__/SMARTWATCH_V1_STM32.circuit-pcb.snap.svg) shows the copper tracks. The [bottom-layer preview](./__snapshots__/SMARTWATCH_V1_STM32.circuit-bottom.snap.svg) shows bottom copper with no components mounted there. Regenerate it with `SMARTWATCH_ROUTED=1 npx tsci snapshot SMARTWATCH_V1_STM32.circuit.tsx --update --layer bottom --disable-parts-engine`.

Exact EasyEDA/JLCPCB OBJ and STEP model metadata is attached for J1–J4, U1–U2, U5–U6, L1, Y1, Q1–Q2, and SW1–SW2. The side switches face the right case wall with rotations of 104° and 76°; their placement anchors are x = 16.1 mm, y = ±4.5 mm. Their pad bounds and courtyards pass placement checks without an off-board exemption. These models are served by the tscircuit model CDN, so an offline or blocked-CDN session will still show placeholders.

`M1` deliberately remains a PCB connection-pad representation rather than a board-mounted CAD body. The LEADER LCM1234A3523F is a wire-lead external motor, 12 mm in diameter and 3.4 mm body height, mounted to the enclosure or a qualified keepout location. Its 3.0-4.5 V operating range includes the existing 3.3 V supply; the 3.7 V rated speed/current figures do not describe performance at 3.3 V. Its enclosure space and lead attachment must be reviewed. A motor body at the solder-pad coordinates would misrepresent the assembly.

## Build and verification

```sh
cd /Users/manishchaudhary/repo/ts/SMARTWATCH_V1_STM32
npm install
npm run typecheck
npm test
npm run dev
npm run snapshot:update
npm run build:routed
```

`build`, `dev`, and snapshot commands replay the reviewed copper routing by default. The checked-in PCB, bottom and 3D snapshots include routed copper. `snapshot:update` first requires a passing routed build. `build:placement` and `test` explicitly disable routing for schematic, component placement, source connectivity, and custom MOSFET pin mapping checks. Set `SMARTWATCH_ROUTED=0` for placement-only development previews. `test` also rejects every Circuit JSON warning/error, unexpected open pin, merged named net, or incorrect Q1/Q2 gate-source-drain connection. It checks generated pad associations, the shared I2C connections, unused PA11, connector placement and the 40 mm round board. The custom MOSFET symbol explicitly maps SOT-23 pins 1/2/3 to gate/source/drain; the default symbol uses a different numbering and must not be substituted without remapping.

`build:routed` runs with `SMARTWATCH_ROUTED=1` and checks DRC diagnostics and routed copper on every named net. The 2026-09-08 reviewed route contains **146 copper traces** and passes with **zero DRC warnings/errors**. The original six clearance errors were fixed by relocating two shared vias, aligning a near-coincident shared via, and adding a short BUTTON1 jog on inner2. Component placement and clearance rules remain unchanged. [routing/README.md](./routing/README.md) describes the saved geometry and regeneration workflow. An input fingerprint rejects the saved route if pads, connections, outline, existing traces or routing rules change. Generated Gerbers still require final JLCDFM review, and the power/thermal and mechanical constraints above remain applicable before ordering.

## Files

- `SMARTWATCH_V1_STM32.circuit.tsx` — complete board, functional sections, passives, placement, and interconnect.
- `index.circuit.tsx` — standard `tsci init` entry point exporting the smartwatch board.
- `package.json`, `tsconfig.json`, `tscircuit.config.json`, `tscircuit.config.js`, `.npmrc` — standalone project configuration.
- `scripts/check-connectivity.mjs` — strict electrical and mechanical regression checks on generated Circuit JSON.
- `imports/` — verified reusable/custom package and pin definitions, including the copied old-watch switch footprint.
- `bom.csv` — complete procurement BOM with stock evidence and quantities for five boards.
- `bom-jlcpcb.csv` — JLCPCB upload BOM for the 56 components on each board, including manual motor lead attachment.
- `sourcing/` — dated JLCPCB stock audit, replacement compatibility notes, and ordering limitations.
- `REFERENCES.md` — project commits, official datasheets, and sourcing links.
- `routing/` — reviewed copper geometry, stale-route protection, and a checked route-save tool.
- `__snapshots__/` — schematic and routed PCB, bottom-layer, and 3D review artifacts.
