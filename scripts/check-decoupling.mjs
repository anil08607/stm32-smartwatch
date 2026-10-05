import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const circuit = JSON.parse(
	readFileSync(process.argv[2] ?? "dist/index/circuit.json", "utf8"),
);
const sources = circuit.filter((item) => item.type === "source_component");
const pcbs = circuit.filter((item) => item.type === "pcb_component");

function center(name) {
	const source = sources.find((item) => item.name === name);
	assert(source, `Missing ${name}`);
	const component = pcbs.find(
		(item) => item.source_component_id === source.source_component_id,
	);
	assert(component, `Missing PCB placement for ${name}`);
	return component.center;
}

const checks = [
	["U1", ["C8", "C9", "C10", "C11", "C12"], 5.5],
	["U2", ["C16", "C17"], 3],
	["U3", ["C6"], 3.7],
	["U4", ["C22"], 2.6],
	["U5", ["C1", "C2", "C3"], 4.1],
	["U6", ["C4", "C5"], 4],
];

for (const [device, capacitors, maximumDistance] of checks) {
	const origin = center(device);
	for (const capacitor of capacitors) {
		const target = center(capacitor);
		const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
		assert(
			distance <= maximumDistance,
			`${device}/${capacitor}: ${distance.toFixed(2)} mm exceeds ${maximumDistance} mm placement limit`,
		);
	}
}

console.log(
	`PASS: ${checks.length} IC power groups keep their required local capacitors within reviewed placement limits.`,
);
