# Reviewed native routing

`source.circuit.json` is generated from the editable TypeScript design. The CLI's self-referential whole-folder MD5 metadata is removed; electrical and geometry records are retained, and explicit source/native files receive SHA-256 bindings. Canonical JSON sorts object keys and retains twelve significant digits, eliminating platform floating-point serialization noise while preserving picofarad/nanohenry values. Array/path order remains unchanged. `reviewed.circuit.json` combines that schematic/placement with exact-width native track segments, through vias and filled copper. The default tscircuit entry renders the original JSX component definitions, then replays only the reviewed native routing phase through a board ref. This avoids the pinned core's incomplete crystal JSON inflator. Source, placement, schematic and DRC phases remain enabled. The adapter compares all component, net, pin, board and pad geometry before accepting copper. Source edits must run the build; they never silently reuse an accepted route.

`binding.json` seals source, package lock, exact native board/schematics/libraries, and the native copper extraction after independent DRC/ERC, source-pin parity and routed-viewer checks pass. `bun run build` regenerates source and rejects stale bindings before merging copper.

## Reproduce the committed copper

The exact placement board, normalized routing seed, protected DSN input and Freerouting 2.5.0 SES result are in `native/`. Run KiCad 10's Python on `routing/finalize-native.py build/replayed`. It imports only copper into the original placements, maps nets by name, preserves every footprint/pad, completes the motor-enable escape, moves the V3V0 trunk to the bottom to preserve the RF reference plane, fills ground and removes crowded automatic silk. Geometry-specific finishing is guarded and must be reviewed again for a new route.

The committed seed/SES replay was regenerated and passed zero-violation, zero-unconnected KiCad DRC. Run KiCad DRC on the replay with the same project rules. `scripts/inspect-native.py` compares native pad nets with the source manifest and measures all critical clock/decoupling paths. `scripts/check-native.mjs` runs actual DRC/ERC; `scripts/check-netlist.py` independently compares the exported native schematic netlist with source pins. No error suppression or lower-clearance waiver is used.

To rerun the saved DSN, set `JAVA_BIN` and `FREEROUTING_JAR`, then run `bun routing/run-router.mjs`. The reviewed environment used Java 25 and Freerouting 2.5.0. Routing completion is not acceptance; run all checks and inspect the result before replacing the committed SES/native board.

## After an electrical or placement change

1. Run `bun run build:source`; export a fresh native placement using `bun scripts/export-native.mjs routing/source.circuit.json build/native`, then generate native sheets with `bun scripts/export-schematic.mjs build/native`.
2. Review exact pads, component orientations, all-layer antenna keepout and protected RF/clock/decoupling paths. Run KiCad Python on `routing/prepare-native.py` for a fresh `build/input.dsn` and normalized world pad geometry; the saved DSN is not valid for changed pads or nets. Route and review in KiCad/Freerouting.
3. Regenerate portable symbols/footprints and copper, run native DRC/ERC with all severities, and compare the native XML netlist against the source manifest. Inspect power widths, reference-plane continuity, oscillator and regulator paths.
4. Extract native geometry, merge it with the source, then pass connectivity, routed-viewer, style, assembly, package/stock and mechanical checks. Refresh drawings, BOM/CPL, models and release evidence.
5. `bun run seal:review` records an engineering review only. It cannot close physical qualification or purchase gates. `bun run check:order` remains the strict ordering gate.
