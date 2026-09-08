# JLCPCB sourcing for five boards

Checked directly against public JLCPCB part-detail responses on **2026-09-08**. The selected 32 line items cover 56 components per board, including the motor's manually soldered leads. Every selected JLCPCB part had sufficient **available order quantity** for five boards at the recorded time. The [machine-readable audit](./jlcpcb-stock-2026-09-08.json) and [procurement BOM](../bom.csv) contain per-part timestamps and source links.

The audit uses the catalog's `overseasStockCount` (stock) and `canPresaleNumber` (available order quantity). A listing, an old search result, or LCSC inventory alone was not accepted as proof of JLCPCB availability. Inventory is not reserved. Quantities in the BOM exclude JLCPCB's assembly attrition allowance; confirm the final quantity in the BOM tool before purchasing.

## Replaced parts

| Reference | Previous part / reason | Selected part | JLCPCB stock / available order qty | Five-board requirement |
| --- | --- | --- | ---: | ---: |
| U1 | STM32L432KCU6, C1337280: 100 stock but **0 available to order** | [STM32L432KCU3, C1337558](https://jlcpcb.com/partdetail/STM32L432KCU3/C1337558) | 22 / 17 | 5 |
| U2 | BMA400, C437655: **0 stock / 0 orderable** | [BMA456, C189518](https://jlcpcb.com/partdetail/BMA456/C189518) | 2,821 / 2,809 | 5 |
| M1 | VC1026B002F, C17215865: **0 stock / 0 orderable** | [LCM1234A3523F, C7424783](https://jlcpcb.com/partdetail/LCM1234A3523F/C7424783) | 100 / 98 | 5 |

The switches, charging IC, regulator, RTC, connectors, crystal, semiconductors and passives were retained after verification. U1 has the smallest stock margin, and the grade-3 part is more expensive (the catalog showed a one-piece price of USD 12.0793 when checked).

## Compatibility checks

- **U1:** ST's STM32L432KB/KC datasheet, ordering table 86, identifies the last digit as the temperature grade. KCU3 retains the 32-pin UFQFPN 5 x 5 mm package, 256 KB flash, 64 KB SRAM, peripherals and pinout. It extends the ambient range to -40 to +125 C. The existing verified footprint and pin mapping are retained; supplier and CAD identifiers are updated. [ST datasheet](https://www.st.com/resource/en/datasheet/stm32l432kc.pdf).
- **U2:** Bosch's pin table matches the existing primary bus, supplies and interrupt pins. The exact C189518 supplier footprint was independently imported and its pad geometry compared with the previous footprint. Pins 4 and 11 are ASDA/ASCL; they remain NC with the auxiliary interface disabled. SDO low selects **0x18**. The firmware must use Bosch's BMA456 wearable feature configuration for hardware steps/activity rather than the old BMA400 driver. Both 100 nF decoupling capacitors remain. [Bosch datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bma456-ds000.pdf), [Bosch SensorAPI](https://github.com/boschsensortec/BMA456_SensorAPI).
- **M1:** The manufacturer specifies **3.0-4.5 V operation**, 3.7 V nominal, 100 mA maximum rated current and 200 mA maximum starting current. The existing 3.3 V rail, AO3400A switch and Schottky flyback topology can drive it; performance at 3.3 V will differ from the 3.7 V rated figures. Its body is **12 mm diameter x 3.4 mm**, with adhesive/foam and lead strain relief adding space. Review enclosure clearance because the previous motor was 10 mm. The 10 mm LCM1027B3605F candidate was not selected because its 3.3 V maximum leaves no positive supply-tolerance margin. [LEADER specification and drawing](https://wmsc.lcsc.com/wmsc/upload/file/pdf/v2/lcsc/2306261204_LEADER-LCM1234A3523F_C7424783.pdf).

## BOM upload and manual assembly

Use [bom-jlcpcb.csv](../bom-jlcpcb.csv) with board quantity **5**. This file lists quantities per board and excludes the external LCD and battery. It does not reserve or buy any parts.

M1 denotes two connection pads, not the center of the external motor body. Specify manual lead attachment after reflow: **red (+) to M1 pin 1 / V3V3; blue (-) to M1 pin 2 / MOTOR_NEG**. Mount the motor in its enclosure location and provide lead strain relief. JLCPCB's motor listing is for assembly service, so an ordinary SMT placement operation at M1's pad-center coordinates is insufficient. Confirm manual assembly handling with the order.

The BQ25180 requires Standard PCBA and X-ray inspection. Follow the fixture/manual handling requirements returned by JLCPCB for the connectors and motor.

## Items not covered by the stock claim

- **LCD1:** ER-TFT1.28-3, no-touch, is externally purchased from BuyDisplay and connected after assembly. The supplier page returned HTTP 403 during this audit, so current stock for five panels is **not verified**.
- **BT1:** LP403035 protected 400 mAh battery is an external/custom pack. Current stock, protection and correctly polarized JST-SH lead supply require supplier confirmation.
- **Fabrication:** The 2026-09-08 reviewed routing fixes the six earlier clearance errors. The built PCB has 146 copper traces and passes routed connectivity/DRC with zero warnings/errors; see [routing notes](../routing/README.md). Final Gerber/JLCDFM review, power/thermal validation, manual assembly handling and enclosure fit remain separate from this stock audit.
