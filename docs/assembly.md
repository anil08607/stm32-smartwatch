# Assembly instructions

## Manufacturing intent

- PCB: 40 x 40 mm rounded square, 8 mm corner radius, 1 mm finished thickness, four copper layers.
- Solder mask / legend: black mask, white top legend.
- Assembly side: **top only**. Do not place any component on the bottom side.
- Use the exact LCSC codes in `bom-jlcpcb.csv` and the generated centroid/placement data.
- Run JLCDFM and inspect every reported exception before releasing fabrication data.

## Before ordering

1. Run `npm run verify` and confirm every gate passes.
2. Run `npm run check:stock`; review low-margin parts and pre-order them if needed.
3. Compare the fabrication preview with the checked-in PCB, bottom-layer and 3D snapshots.
4. Confirm the board outline remains 40 x 40 mm with 8 mm corners and no component courtyard crosses the edge.
5. Confirm J1 is accessible through the intended case wall and both side switches face the case actuators.
6. Confirm J4 contact direction, pin 1 and LCD flex fold direction using physical samples.

## SMT assembly

- Assemble all fitted PCB components on top. The bottom side carries copper only.
- Pay special attention to U5 (DSBGA), U6 (VSON), U1 (UFQFPN), U2 (LGA), U3 (DFN), J1 shell tabs and J4 fine-pitch contacts.
- Use X-ray or equivalent inspection for hidden-joint packages when available.
- Do not fit the external LCD panel, LiPo, or wire-lead motor during reflow.
- Preserve the exposed connector openings and switch actuation paths during washing and handling.

## Post-SMT installation

1. Inspect for solder bridges, rotated ICs, tombstoned passives and incomplete connector tabs.
2. Attach M1 to the top-side motor pads with correct polarity; add mechanical strain relief outside the pad joint.
3. Verify the battery lead polarity against J2 before mating it. Never use connector color alone as proof of polarity.
4. Insert the no-touch ER-TFT1.28-3 flex into J4 with pin 1 aligned, then close the latch without forcing it.
5. Mount the display, battery and motor so they do not load J4, the crystal, BMA456, or solder joints.

## Mechanical validation

The PCB source does not validate the complete watch stack. Check display fold radius, battery swelling allowance, connector insertion/removal, motor isolation, antenna-free keepouts, case-wall clearances, button travel, gasket compression and service access in the final enclosure CAD.
