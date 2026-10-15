# Fabrication and assembly handoff

Use `release/gerbers/`, `release/drill/`, `release/assembly-bom.csv` and `release/assembly-cpl.csv` from the same hashed release. Do not mix these with tscircuit's automatically regenerated manufacturing files. The native KiCad project is the copper authority.

Nominal fabrication: 46 × 46 mm R8, four copper layers, 1.0 mm FR-4, 1 oz copper, ENIG, black mask, white silk, 0.10 mm minimum copper clearance/trace, 0.40/0.20 mm through vias, 0.20 mm copper-to-edge minimum. Top SMT assembly only. Through vias require tenting outside component pads; confirm the fabricator's supported soldermask and drill tolerances. No filled via-in-pad process is requested by this design.

Native layers map F.Cu / In1.Cu / In2.Cu / B.Cu. GND pours exist on all four layers and exclude the antenna window. The final fabricator must confirm the stackup and impedance; the 0.34 mm RF feed is a nominal starting width, not a verified impedance certificate. Review continuity of its reference plane and all return paths before ordering.

CPL origin is the lower-left board bounding-box corner: tscircuit (−23,−23), KiCad (77,123) mm. CPL X/Y increase right/up when viewing the top; rotations are source-library rotations. Review all 70 placements in the assembler's actual preview, including J1/J2/J3/J4/J5, U1/U2/U3/U5/U6, diodes, MOSFETs, crystals and switches. A stock match does not establish assembler rotation conventions.

M1 wire pads are excluded from paste, BOM and CPL. LCD, battery, NTC, motor, wiring and enclosure are post-reflow assembly. Apply no unapproved substitutions. Require the assembler to confirm each exact package and stencil aperture, especially WLCSP U5 and QFN thermal pads. Complete programming and first-article testing before increasing batch size.

The release is deliberately marked REVIEW until stackup/RF, procurement, assembly-preview and physical qualification records pass. Gerber existence is not an order approval.
