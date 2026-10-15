import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { runAllRoutingChecks } from "@tscircuit/checks";
const bytes = readFileSync("dist/index/circuit.json"),
	circuit = JSON.parse(bytes),
	diagnostics = [
		...circuit.filter((x) => /error|warning/.test(x.type)),
		...(await runAllRoutingChecks(circuit)),
	];
const traces = circuit.filter((x) => x.type === "pcb_trace"),
	vias = circuit.filter((x) => x.type === "pcb_via"),
	pours = circuit.filter((x) => x.type === "pcb_copper_pour");
assert(
	traces.length > 500 && vias.length > 0 && pours.length >= 4,
	"Reviewed native copper missing",
);
const report = {
	circuit_sha256: createHash("sha256").update(bytes).digest("hex"),
	traces: traces.length,
	vias: vias.length,
	pours: pours.length,
	diagnostics,
};
writeFileSync(
	"docs/checks/circuit-routing.json",
	JSON.stringify(report, null, 2) + "\n",
);
assert.equal(diagnostics.length, 0, JSON.stringify(diagnostics, null, 2));
console.log(
	`PASS: ${traces.length} native-width segments, ${vias.length} vias and ${pours.length} filled polygons; zero routing diagnostics.`,
);
