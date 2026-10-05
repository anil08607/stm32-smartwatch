import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { runAllRoutingChecks } from "@tscircuit/checks";

const circuitPath = process.argv[2] ?? "dist/index/circuit.json";
const outputPath = process.argv[3] ?? "dist/index/circuit.repaired.json";
const circuit = JSON.parse(readFileSync(circuitPath, "utf8"));

// beta_pipeline7 occasionally places a shared via exactly on the clearance
// boundary of a neighboring QFN/0402 pad. Keep the routed topology and nudge
// only the affected via plus every incident route endpoint.
const repairs = [
	{
		name: "shared NRST via left/below the unused oscillator pad",
		from: { x: -8.185601331985348, y: 4.679998999999999 },
		to: { x: -8.3, y: 4.4 },
		minimumRoutePoints: 6,
	},
	{
		name: "shared I2C_SCL via above the MCU PB4 pad",
		from: { x: -4.237223516671337, y: 7.100000999999999 },
		to: { x: -4.237223516671337, y: 7.2 },
		minimumRoutePoints: 6,
	},
	{
		name: "BMA456 I2C_SCL escape between the SCL and SDO pads",
		from: { x: 7.870456580178475, y: 7.910057999999999 },
		to: { x: 7.75, y: 8.04 },
		minimumRoutePoints: 6,
	},
];

const samePoint = (point, expected) =>
	Math.abs(point.x - expected.x) < 1e-9 &&
	Math.abs(point.y - expected.y) < 1e-9;

for (const repair of repairs) {
	let routePoints = 0;
	let vias = 0;
	for (const item of circuit) {
		if (item.type === "pcb_trace") {
			for (const point of item.route ?? []) {
				if (!samePoint(point, repair.from)) continue;
				point.x = repair.to.x;
				point.y = repair.to.y;
				routePoints += 1;
			}
		}
		if (item.type === "pcb_via" && samePoint(item, repair.from)) {
			item.x = repair.to.x;
			item.y = repair.to.y;
			vias += 1;
		}
	}
	assert(
		routePoints >= repair.minimumRoutePoints,
		`${repair.name}: routed coordinate was not found`,
	);
	assert(vias >= 1, `${repair.name}: via record was not found`);
}

const bmaEscape = repairs[2].to;
const bmaIncoming = circuit.find(
	(item) =>
		item.type === "pcb_trace" && item.pcb_trace_id === "source_net_9_mst1_0",
);
const bmaOutgoing = circuit.find(
	(item) =>
		item.type === "pcb_trace" && item.pcb_trace_id === "source_net_9_mst2_0",
);
assert(bmaIncoming && bmaOutgoing, "BMA456 SCL reviewed traces are missing");

const incomingViaIndex = bmaIncoming.route.findIndex(
	(point) => point.route_type === "via" && samePoint(point, bmaEscape),
);
const outgoingViaIndex = bmaOutgoing.route.findIndex(
	(point) => point.route_type === "via" && samePoint(point, bmaEscape),
);
assert(
	incomingViaIndex > 0 && outgoingViaIndex > 0,
	"BMA456 SCL escape via is missing",
);

bmaIncoming.route = [
	...bmaIncoming.route.slice(0, incomingViaIndex + 1),
	{ route_type: "wire", ...bmaEscape, width: 0.1, layer: "top" },
	{ route_type: "wire", x: 7.9, y: 8.25, width: 0.1, layer: "top" },
	bmaIncoming.route.at(-1),
];
bmaOutgoing.route = [
	bmaOutgoing.route[0],
	{ route_type: "wire", x: 7.9, y: 8.25, width: 0.1, layer: "top" },
	{ route_type: "wire", ...bmaEscape, width: 0.1, layer: "top" },
	bmaOutgoing.route[outgoingViaIndex],
	...bmaOutgoing.route.slice(outgoingViaIndex + 1),
];

const repaired = circuit.filter((item) => !/error|warning/.test(item.type));
const diagnostics = await runAllRoutingChecks(repaired);
assert.equal(diagnostics.length, 0, JSON.stringify(diagnostics, null, 2));

writeFileSync(outputPath, `${JSON.stringify(repaired, null, 2)}\n`);
console.log(
	`PASS: repaired ${repairs.length} reviewed via locations -> ${outputPath}`,
);
