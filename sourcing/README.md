# JLCPCB sourcing and replacement policy

The current audit queried each exact LCSC/JLCPCB code through the public JLC Search index on **2026-10-05 at 09:45 UTC**. The 34 selected line items cover all **59 fitted PCB components per board**, and every line had enough reported stock for five boards at that moment.

- Machine-readable evidence: [jlcpcb-stock-2026-10-05.json](./jlcpcb-stock-2026-10-05.json)
- JLCPCB upload BOM: [bom-jlcpcb.csv](../bom-jlcpcb.csv)
- Engineering BOM: [bom.csv](../bom.csv)

Stock is live and is not reserved by this repository. Always run `npm run check:stock` immediately before ordering and review the actual JLCPCB assembly cart.

## Low-margin items

The recorded audit found only 7 pieces of `R4`/C11616 (510 kΩ) and 6 pieces of `R5`/C4147 (91 kΩ), against five of each required for five boards. They passed the exact quantity check but leave little room for JLCPCB attrition.

Preferred order-time action:

1. Pre-order C11616 and C4147 into the JLCPCB parts library, or reduce the build quantity.
2. If either becomes unavailable, choose a 0402, 1%, same-resistance part with at least the same voltage/power rating.
3. Update the source MPN and LCSC code, regenerate both BOMs and the stock audit, then run `npm run verify`.
4. Do not change the 510 kΩ / 91 kΩ ratio without recalculating and validating the TPS63802 output voltage.

The MCU `U1`/C1337558 also had limited but sufficient stock (34 pieces). The motor `M1`/C7424783 had 85 pieces and is manually lead-soldered after SMT assembly.

## Exact-part rules

- `U3` must remain a HUSB238-compatible PD sink whose pin mapping and VSET/ISET strap behavior match the implemented DFN-10 circuit. The selected exact part is `HUSB238_002DD`, C7471904.
- `J4` must preserve the 15-pin, 0.5 mm, right-angle, double-contact FPC geometry and physical contact orientation of AFC24-S15FIA-00, C6709462.
- `J1`, `J2`, `J3`, `SW1` and `SW2` cannot be replaced solely by electrical equivalence; their shell, locating, mating and side-actuation geometry must match.
- `U5`, `U6`, `U1`, `U2` and `U4` are not generic footprint substitutions. A replacement requires a complete schematic, firmware and layout review.
- Passive alternatives must match value, tolerance, voltage rating, dielectric where applicable, package, and temperature/power requirements.

## External and post-assembly items

- `LCD1`: order the ER-TFT1.28-3 in the no-touch configuration and install its flex after SMT assembly. Verify pin 1 and connector contact direction on a physical sample.
- `BT1`: use only a protected, qualified 3.7 V 1S LiPo with verified connector polarity. The selected reference pack has no NTC; final wearable safety qualification remains required.
- `M1`: JLCPCB may supply the motor, but its wire leads are attached manually to the top-side motor pads. Confirm polarity and strain relief.

The historical 2026-09-08 JSON is retained as an audit record only; it is not the current order basis.
