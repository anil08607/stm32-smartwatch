import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { runAllRoutingChecks } from "@tscircuit/checks";
import { routingFingerprint } from "./saved-routing.ts";

const [inputPath, circuitPath] = process.argv.slice(2);
assert(
	inputPath && circuitPath,
	"Usage: bun routing/save-reviewed-route.mjs <phase-input.simple-route.json> <reviewed-circuit.json>",
);
const input = JSON.parse(readFileSync(inputPath, "utf8"));
const circuit = JSON.parse(readFileSync(circuitPath, "utf8"));
const diagnostics = [
	...circuit.filter((item) => /error|warning/.test(item.type)),
	...(await runAllRoutingChecks(circuit)),
];
assert.equal(diagnostics.length, 0, JSON.stringify(diagnostics, null, 2));
const existingIds = new Set(
	(input.traces ?? []).map((trace) => trace.pcb_trace_id),
);
// The core assigns source_trace_id/subcircuit_id while applying SRJ routes.
// Replaying those output-only IDs can replace a different explicit trace.
const traces = circuit
	.filter(
		(item) => item.type === "pcb_trace" && !existingIds.has(item.pcb_trace_id),
	)
	.map(({ type, pcb_trace_id, connection_name, connectsTo, route }) => ({
		type,
		pcb_trace_id,
		connection_name,
		connectsTo,
		route,
	}));
assert(traces.length > 0, "No routed traces to save");
writeFileSync(
	new URL("./routed-board.json", import.meta.url),
	`${JSON.stringify(
		{
			description: "Reviewed copper routes; validated before saving.",
			inputFingerprint: routingFingerprint(input),
			traces,
		},
		null,
		2,
	)}\n`,
);
console.log(
	`Saved ${traces.length} reviewed routes. Rebuild and update snapshots.`,
);
