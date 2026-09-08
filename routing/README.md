# Saved PCB routing

`routed-board.json` stores 143 reviewed routes. Together with the three explicit board traces, the built PCB contains **146 copper traces**. Default builds, development previews and snapshots replay this geometry. `SMARTWATCH_ROUTED=0` still selects placement-only output.

The six original clearance errors were removed without relaxing the board's DRC rules:

- Move the shared NRST via from (-8.100001, 4.680001) to (-8.21, 5.37) mm, clear of the MCU's unused oscillator pads. Keep every attached trace endpoint at the new coordinate.
- Add a short BUTTON1 jog on inner2 at x = -8.59 mm, between y = 5.0 and 5.55 mm, to clear that through via.
- Move the shared V3V3 via below U2 from y = 7.174969 to 7.055 mm, clear of ASDA.
- Merge the near-coincident V3V3 via locations near (-10.14, 6.63) mm by using the identical coordinate on every attached route.

The 2026-09-08 saved-route build passes routed connectivity and DRC with zero warnings/errors. All components remain on top; copper uses all four layers. The library represents shared vias once per incident route, so the via-record count is not the number of distinct drill locations.

## Updating the board

`saved-routing.ts` fingerprints the complete routing input: connections, pad geometry, board outline, existing traces and clearance rules. It rejects a stale route after an input change. Do not replace the fingerprint alone to bypass that check.

To generate a new candidate after a design change:

```sh
npm run build -- --inject-props '{"reroute":true}' --autorouter-timeout 5m --autorouter-dump-srj all
```

Review and fix the resulting routing. The CLI may exit successfully with DRC errors, so run `node scripts/check-connectivity.mjs --require-routing` before accepting it. If comparing router versions, clear the disposable `.tscircuit/cache/` first: the installed core's route cache key does not include the pipeline version.

Save the reviewed result using the input SRJ dumped for that same build:

```sh
bun routing/save-reviewed-route.mjs dist/autorouter-debug/phase-0.input.simple-route.json dist/index/circuit.json
npm run format
npm run build:routed
npm run snapshot:update
```

The save command refuses diagnostic-bearing output and reruns all routing checks before writing. Final Gerber/DFM review, power/thermal validation and enclosure fit are separate manufacturing checks.
