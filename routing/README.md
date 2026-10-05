# Reviewed PCB routing

`routed-board.json` stores 150 reviewed autorouted connections. Together with three explicit board traces, the built PCB contains **153 copper traces**. The route uses top, inner1, inner2 and bottom copper while all assembly stays on the top side.

Default builds, development previews and snapshots replay this saved geometry. `SMARTWATCH_ROUTED=0` selects the placement-only design.

## Review result

The 2026-10-05 rounded-square route passes full named-net connectivity and routing DRC with zero reported warnings/errors. Three deterministic corrections were applied to the raw `beta_pipeline7` result without relaxing clearance rules:

- Move the shared NRST via to `(-8.3, 4.4)` mm to clear adjacent MCU geometry.
- Move the shared I2C_SCL via above the MCU to `(-4.237223516671337, 7.2)` mm.
- Move the BMA456 I2C_SCL escape point to `(7.75, 8.04)` mm and reconnect its top-layer segments cleanly.

`repair-autoroute.mjs` encodes those reviewed changes and reruns all routing checks before producing `dist/index/circuit.repaired.json`.

## Regenerating after a design change

`saved-routing.ts` fingerprints the complete routing input: connections, pad geometry, board outline, existing traces and clearance rules. It rejects a stale route after any relevant source change. Do not replace the fingerprint alone to bypass that protection.

Generate and inspect a new candidate:

```sh
npm run build -- --inject-props '{"reroute":true}' \
  --autorouter-timeout 5m --autorouter-dump-srj all
node routing/repair-autoroute.mjs
```

After visual review, save only a diagnostic-free result generated from the matching input SRJ:

```sh
bun routing/save-reviewed-route.mjs \
  dist/autorouter-debug/phase-0.input.simple-route.json \
  dist/index/circuit.repaired.json
npm run format
npm run verify
npm run snapshot:update
```

The save tool refuses diagnostic-bearing output and reruns routing checks. A successful source build is still followed by external Gerber/DFM review, enclosure fit, and prototype validation before ordering production quantities.
