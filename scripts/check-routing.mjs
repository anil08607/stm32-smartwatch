import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runAllRoutingChecks } from "@tscircuit/checks";

const circuit = JSON.parse(
	readFileSync(process.argv[2] ?? "dist/index/circuit.json", "utf8"),
);
const generatedDiagnostics = circuit.filter((item) =>
	/error|warning/.test(item.type),
);
const routingDiagnostics = await runAllRoutingChecks(circuit);
assert.equal(
	generatedDiagnostics.length,
	0,
	JSON.stringify(generatedDiagnostics, null, 2),
);
assert.equal(
	routingDiagnostics.length,
	0,
	JSON.stringify(routingDiagnostics, null, 2),
);

const traces = circuit.filter((item) => item.type === "pcb_trace");
const routedLayers = new Set(
	traces.flatMap((trace) =>
		(trace.route ?? []).map((point) => point.layer).filter(Boolean),
	),
);
assert.equal(traces.length, 153, "Unexpected routed-trace count");
for (const layer of ["top", "inner1", "inner2", "bottom"])
	assert(routedLayers.has(layer), `${layer}: no routed copper`);

console.log(
	`PASS: ${traces.length} copper traces pass routing DRC and use all four copper layers.`,
);
