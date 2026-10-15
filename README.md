# Anil nRF52810 Smartwatch V1

A 46 × 46 mm, four-layer Bluetooth smartwatch PCB with a Nordic nRF52810-QFAA, 240 × 240 SPI LCD interface, BMA456 accelerometer, battery-backed PCF8563 RTC, USB-C 5 V charging, protected single-cell battery interface, bonded battery NTC, two buttons and haptic motor output. USB-C faces the left side, clear of both straps; two buttons form a centred pair on the right side.

**Release status: engineering review / prototype handoff. Production ordering is blocked until the explicit gates in `release/readiness.json` are closed.** Passing software checks does not establish RF performance, battery safety, assembly orientation or enclosure fit. No hardware test results or working smartwatch firmware are claimed.

## Open the design

- `index.circuit.tsx`: complete compact product assembly by default, with the actual routed PCB underneath.
- `pcb.circuit.tsx`: dedicated routed PCB/schematic view and PCB-only inspection.
- `assembly-exploded.circuit.tsx`: separated product stack for battery, display, buttons, wiring and enclosure inspection.
- `assembly.circuit.tsx`: routed PCB plus external product assembly in the tscircuit 3D viewer.
- `SMARTWATCH_V1_NRF52810.circuit.tsx`: editable electrical design, exact parts, placement and protected critical routes.
- `hardware/smartwatch-nrf52810.kicad_pro`: portable native KiCad 10 project, seven electrical sheets and local symbol/footprint libraries.
- `mechanical/index.html`: interactive compact/exploded assembly. Run `bun run preview:assembly`, then open http://127.0.0.1:8766/mechanical/.
- `mechanical/`: compact/exploded GLB, five printable STL parts and dimension/part manifest. The provisional case is 54 × 54 × 18 mm with 22 mm strap lugs. Bodies and harnesses are fit envelopes.
- `release/full-purchase-list.csv`: fitted SMT parts, LCD, battery, NTC, motor, harnesses, enclosure, lens, fastening, strap and tools, with purchase URLs.

## Reproduce the checks

Install Bun 1.3.14, then `bun install --frozen-lockfile`. Run `bun run verify` for formatting, type checks, a fresh editable-source build, strict saved-route binding, connectivity, routing, assembly, schematic-style checks, all four actual viewer entries and the hosted multi-file CLI build and a stale-geometry rejection test. `bun run check:native` runs the actual KiCad DRC and ERC (KiCad 10 required; set `KICAD_CLI` if it is not on PATH). `bun run check:stock` refreshes public exact-part JLCPCB inventory. `bun run check:order` is intentionally strict and fails while any qualification or purchasing gate is unresolved.

The hosted build uses `bun run build:site` and only the four public entrypoints. Its optional parts engine is off because footprints and exact MPNs are committed and audited separately; inventory is checked by `check:stock`. No DRC or warning-ignore flags are used. Connector pin-1 display annotations cannot invalidate routing; changes to pads, positions, nets or copper still do.

Source/geometry edits invalidate the routed artifact and release evidence. Follow `routing/README.md`; never bypass the fingerprint or regenerate only the screenshots. Manufacturing outputs come from the reviewed native board, not from an unrouted viewer export.

## Hardware boundaries

The nRF52810 has 192 KiB flash and 24 KiB RAM. A 240 × 240 RGB565 framebuffer needs 115,200 bytes; firmware must use line/tile rendering. This revision has BLE, a no-touch LCD, motion sensing, RTC, buttons and haptics. It does not include Wi-Fi, a touch controller or an optical heart-rate sensor.

The main rail is nominally 3.05 V (510 kΩ / 100 kΩ feedback). The MCU uses its internal LDO; DCC is unconnected and firmware must leave DCDCEN=0. RF matching values are reference starting values. The antenna keepout spans all copper layers; final fabricator stackup, impedance and enclosure tuning remain mandatory.

Only the 70 fitted top-side parts belong in the SMT BOM/CPL. M1 is a pair of motor wire pads with no paste; the motor is installed after reflow. J2 and J5 use identical connector families but carry battery power and NTC respectively: label harnesses and verify polarity before connection.

See [assembly](docs/assembly.md), [fabrication](docs/fabrication.md), [bring-up](docs/bring-up.md), [sourcing](sourcing/README.md), [firmware interface](firmware/README.md) and [manufacturer references](REFERENCES.md).
