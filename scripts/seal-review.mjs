import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const hash = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const n = JSON.parse(readFileSync("docs/checks/native-summary.json")),
	g = JSON.parse(readFileSync("docs/checks/native-geometry.json")),
	r = JSON.parse(readFileSync("docs/checks/circuit-routing.json"));
assert.equal(n.board_sha256, hash("hardware/smartwatch-nrf52810.kicad_pcb"));
assert.equal(g.board_sha256, n.board_sha256);
assert.equal(n.drc_sha256, hash("docs/checks/native-drc.json"));
assert.equal(n.erc_sha256, hash("docs/checks/native-erc.json"));
assert.equal(n.netlist_sha256, hash("hardware/electrical-netlist.xml"));
assert.equal(n.drc_violations + n.erc_violations + n.unconnected, 0);
assert.equal(
	g.errors.length +
		g.rf_reference_corridor_candidates.length +
		r.diagnostics.length,
	0,
);
assert.equal(r.circuit_sha256, hash("routing/reviewed.circuit.json"));
const files = [
	"SMARTWATCH_V1_NRF52810.circuit.tsx",
	"index.circuit.tsx",
	"assembly.circuit.tsx",
	"assembly-exploded.circuit.tsx",
	"pcb.circuit.tsx",
	"routing/native-viewer.ts",
	"tscircuit.config.js",
	"tscircuit.config.json",
	"mechanical/assembly-model.json",
	"mechanical/assembly-manifest.json",
	"hardware-contract.json",
	"board-standards.json",
	"package.json",
	".github/workflows/check.yml",
	"bun.lock",
	"routing/source.circuit.json",
	"routing/native-copper.json",
	"checks/vendor/schematic-placement.mjs",
	"checks/vendor/LICENSE",
];
function collect(dir) {
	for (const name of readdirSync(dir)) {
		const path = `${dir}/${name}`;
		if (statSync(path).isDirectory()) collect(path);
		else if (
			!path.endsWith(".lck") &&
			!path.endsWith(".bak") &&
			!path.endsWith("electrical-netlist.xml")
		)
			files.push(path);
	}
}
collect("mechanical");
collect("imports");
collect("routing/native");
files.push(
	"scripts/inspect-native.py",
	"scripts/merge-native.mjs",
	"scripts/export-schematic.mjs",
	"routing/finalize-native.py",
	"routing/prepare-native.py",
);
collect("hardware");
collect("scripts");
writeFileSync(
	"routing/binding.json",
	JSON.stringify(
		{
			reviewed_at: new Date().toISOString(),
			status: "native_checks_passed_physical_qualification_pending",
			files: Object.fromEntries(
				[...new Set(files)].sort().map((f) => [f, hash(f)]),
			),
		},
		null,
		2,
	) + "\n",
);
console.log(
	`Sealed ${files.length} source/native inputs after independent zero-diagnostic checks.`,
);
