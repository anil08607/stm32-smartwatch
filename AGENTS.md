# Smartwatch hardware rules

Use the current user request, manufacturer datasheets, `hardware-contract.json`, and `board-standards.json` in that order. The circuit entrypoint is `index.circuit.tsx`. Preserve Anil's repository and commit identity. Do not transfer assumptions from unrelated products.

Every topology, footprint, position or copper change invalidates saved routing and the release fingerprint. Run the source, style, connectivity, native DRC/ERC, assembly, sourcing and manifest checks before regenerating a handoff. Do not hide diagnostics, reduce clearances to make a test pass, invent stock, or call unmeasured hardware qualified. Bare motor wire pads are not a pick-and-place part. All fitted components are top-side.

The complete product includes the LCD, protected battery, bonded NTC and its lead, motor, enclosure, retainer, lens, fasteners, strap and SWD/charging equipment. Keep their purchase requirements and mechanical envelopes synchronized. Keep manufacturer and required dependency notices intact. `release/` must always state whether it is a review package or an order-authorized package.

Use Bun 1.3.14 and the committed lockfile. Native checks require KiCad 10 and its Python module. Keep all checker evidence hash-bound to its actual input. Never replace a failed hardware gate with a successful file-existence check.
