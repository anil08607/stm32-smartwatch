# References and verification record

Originally checked on 2026-08-26; the JST programming connector was checked on 2026-08-27. Manufacturer datasheets control over reference-project values, and live JLCPCB inventory must be checked again at order time.

## Open-source smartwatch references

- [Open-Smartwatch Light](https://github.com/Open-Smartwatch/open-smartwatch-light), inspected at commit `55ce0ec0e0254e03b575917788cb001507b01619`. Used for the watch-shaped PCB, fold-over GC9A01 display/FPC implementation, BMA400, side buttons, low-side backlight switching, and wearable component placement precedent.
- [ZSWatch](https://github.com/ZSWatch/ZSWatch), inspected at commit `466a5ae5f3c1cc3dd53da6da2f1c7f50cfae0394`. Used to cross-check modern smartwatch partitioning, sensor placement, debug access, and power-domain practice.

## Manufacturer authorities

- STM32L432KCU6: [ST datasheet](https://www.st.com/resource/en/datasheet/stm32l432kc.pdf) and [STM32L4 hardware development application note](https://www.st.com/resource/en/application_note/dm00125306-getting-started-with-stm32l4-series-and-stm32l4-series-hardware-development-stmicroelectronics.pdf).
- BMA400: [Bosch Sensortec datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bma400-ds000.pdf).
- MAX30102EFD+T: [Analog Devices/Maxim datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf).
- PCF8563TS: [NXP datasheet](https://www.nxp.com/docs/en/data-sheet/PCF8563.pdf).
- BQ25180YBGR: [TI datasheet and reference circuit](https://www.ti.com/lit/ds/symlink/bq25180.pdf).
- TPS63802: [TI product page and datasheet](https://www.ti.com/product/TPS63802).
- TPS7A20: [TI product page and datasheet](https://www.ti.com/product/TPS7A20).
- ER-TFT1.28-3: [EastRising/BuyDisplay panel datasheet](https://www.buydisplay.com/download/manual/ER-TFT1.28-3_Datasheet.pdf) and [official product/ordering page](https://www.buydisplay.com/1-28-inch-tft-lcd-display-240x240-round-circle-screen-for-smart-watch). This is the complete LCD/FPC/backlight assembly, not the bare GC9A01A controller.
- AFC24-S15FIA-00: [JLCPCB manufacturer drawing and assembly listing](https://jlcpcb.com/partdetail/JUSHUO-AFC24_S15FIA00/C6709462). The exact JLC/EasyEDA land pattern was imported using `C6709462` rather than inferred from connector pitch alone.
- VC1026B002F: [Vybronics official datasheet](https://vybronics.hk/wp-content/uploads/datasheet-files/Vybronics-VC1026B002F-datasheet.pdf).
- LP403035: [LiPol Battery pack datasheet](https://www.lipolbattery.com/LiPo-Battery-Datahseet/LiPo_Battery_LP403035_3.7V_400mAh.pdf).
- SM06B-SRSS-TB(LF)(SN): [JST SH-series official datasheet and PCB layout](https://www.jst-mfg.com/product/pdf/eng/eSH.pdf). The 6-circuit side-entry header uses a 1.0 mm contact pitch, 5.0 mm contact span, and 8.0 mm overall body width.

## Critical pin/package checks

### ER-TFT1.28-3 and J4

The selected BuyDisplay panel is in stock, 1.28 inch, 240 x 240, 4-wire SPI, GC9A01A, 35.59 x 37.74 x 1.6 mm, with a plug-in 15-pin 0.5 mm-pitch flex. V1 orders the **no-touch** option. `J4` is JUSHUO `AFC24-S15FIA-00`, JLCPCB `C6709462`: 15 contacts, 0.5 mm pitch, 0.3 mm FPC, double-sided contact, top/bottom entry, hinged lid, 2 mm board height, right-angle SMT.

| J4 / FPC pin | Signal  | V1 use                |
| -----------: | ------- | --------------------- |
|            1 | GND     | GND                   |
|            2 | LEDK    | Q1 drain              |
|            3 | LEDA    | 3V3 through R14       |
|            4 | VDD     | 3V3                   |
|            5 | RS      | LCD D/C GPIO          |
|            6 | CS      | STM32 SPI chip select |
|            7 | SCL     | STM32 SPI clock       |
|            8 | SDA     | STM32 SPI MOSI        |
|            9 | RESET   | STM32 reset GPIO      |
|           10 | CTP_VDD | NC; touch not fitted  |
|           11 | GND     | GND                   |
|        12–15 | CTP_*   | NC; touch not fitted  |

The display datasheet allows 2.5–3.3 V VDD and specifies a 2-chip white backlight at 3.0 V typical, 30 mA typical and 40 mA maximum. V1 retains the reference-derived 22 Ω plus N-MOSFET/PWM topology, which deliberately starts below maximum brightness on a 3.3 V rail; measure actual LED current and brightness before changing R14. The connector's two shell/hold-down pads are mechanical NCs. The bottom-side footprint includes a pin-1 marker; cable insertion orientation must be checked against the physical no-touch panel before production.

### BQ25180YBGR

| Ball    | Signal      | Connection                              |
| ------- | ----------- | --------------------------------------- |
| A1 / A2 | INT / IN    | 3V3 pull-up interrupt / protected USB5V |
| B1 / B2 | SCL / SYS   | shared I2C / buck-boost input           |
| C1 / C2 | SDA / BAT   | shared I2C / protected 1S pack          |
| D1 / D2 | TS/MR / GND | fixed 10 kΩ TS option / ground          |

The implemented local values satisfy the datasheet minimums: IN 1 µF, SYS 10 µF, BAT 1 µF. The fixed TS resistor is valid electrically but is explicitly not a substitute for production pack-temperature qualification.

### MAX30102EFD+T

VDD is 1.8 V with 4.7 µF + 100 nF. VLED pins are 3.3 V with 10 µF + 100 nF. PGND and GND return locally. I2C and active-low INT are open-drain and pulled to 3.3 V, which the datasheet permits independently of the 1.8 V VDD rail.

### PCF8563TS

Pins 1/2 connect only to the FC-135 32.768 kHz crystal; the RTC provides the oscillator load capacitance. Pins 3/4/5/6/7/8 are INT/VSS/SDA/SCL/CLKOUT/VDD respectively. CLKOUT is unused. VDD is on BAT so time survives MCU/regulator shutdown.

### BMA400

VDD and VDDIO use separate 100 nF local capacitors. CSB is high for I2C; SDO is low, selecting address `0x14`. INT1 and INT2 are routed separately.

### Side switches

SW1/SW2 reuse the exact C51927172 land pattern from the older Open-Smartwatch tscircuit board, including its two locating holes and bracket pads. The part is a right-angle, normally-open SPST switch; V1 uses an active-low STM32 input with an external 100 kΩ pull-up. The JLCPCB listing identifies it as an SMT-assembly part in the SMD-4P 4.6 x 1.8 mm family.

### Programming connector

J3 is JST `SM06B-SRSS-TB(LF)(SN)`, LCSC/JLCPCB `C160405`, using the official 6-circuit right-angle JST-SH land pattern. It replaces TP1-TP6 and exposes 3V3 reference, SWDIO, GND, SWCLK, NRST, and BOOT0 through one keyed cable. Its local tscircuit footprint uses the official 0.6 x 1.55 mm contact pads at 1.0 mm pitch and 1.2 x 1.8 mm mechanical pads at x = +/-3.8 mm, cross-checked against the corresponding KiCad official-library footprint `JST_SH_SM06B-SRSS-TB_1x06-1MP_P1.00mm_Horizontal`.

## JLCPCB/LCSC sourcing links

- [STM32L432KCU6 C1337280](https://jlcpcb.com/partdetail/STM32L432KCU6/C1337280)
- [BMA400 C437655](https://jlcpcb.com/partdetail/BMA400/C437655)
- [MAX30102EFD+T C6454833](https://jlcpcb.com/partdetail/MAX30102EFD%2BT/C6454833)
- [PCF8563TS/5,118 C27397](https://jlcpcb.com/partdetail/NXPSemicon-PCF8563TS_5118/C27397)
- [BQ25180YBGR C3682423](https://jlcpcb.com/partdetail/C3682423)
- [TPS63802DLAR C2845237](https://jlcpcb.com/partdetail/TexasInstruments-TPS63802DLAR/C2845237)
- [TPS7A2018PDBVR C963430](https://jlcpcb.com/partdetail/TexasInstruments-TPS7A2018PDBVR/C963430)
- [AFC24-S15FIA-00 C6709462](https://jlcpcb.com/partdetail/JUSHUO-AFC24_S15FIA00/C6709462)
- [VC1026B002F C17215865](https://jlcpcb.com/partdetail/18344943-VC1026B002F/C17215865)
- [AO3400A C20917](https://www.lcsc.com/product-image/C20917.html)
- [2N7002 C8545](https://jlcpcb.com/partdetail/JiangsuChangjingElec-2N7002/C8545)
- [LESD5Z5.0CT1G C136167](https://jlcpcb.com/partdetail/LRC-LESD5Z50CT1G/C136167)
- [1N5819WS C5451629](https://jlcpcb.com/partdetail/HxyMosfet-1N5819WS/C5451629)
- [TS-1806SA-2x4x3.5DY-180X C51927172](https://jlcpcb.com/partdetail/CAX-TS_1806SA_2x4x3_5DY180X/C51927172)
- [SM06B-SRSS-TB(LF)(SN) C160405 at JLCPCB](https://jlcpcb.com/partdetail/171785-SM06B_SRSS_TB_LF_SN/C160405) — SMT Assembly, Economic and Standard PCBA.
- [SM06B-SRSS-TB(LF)(SN) C160405 live LCSC stock](https://www.lcsc.com/product-detail/Wire-To-Board-Connector_JST-SM06B-SRSS-TB-LF-SN_C160405.html)
