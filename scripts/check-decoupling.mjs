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

const native = JSON.parse(
	readFileSync("docs/checks/native-geometry.json", "utf8"),
);
for (const net of ["NRF_DEC1", "NRF_DEC2", "NRF_DEC3", "NRF_DEC4"]) {
	const route = native.stats[net];
	assert.equal(
		route.vias,
		0,
		`${net}: regulator decoupling must not change layers`,
	);
	assert.deepEqual(route.layers, ["top"]);
	assert(route.length_mm <= 5, `${net}: decoupling copper exceeds 5 mm`);
}
assert.equal(native.errors.length, 0, JSON.stringify(native.errors));
assert.equal(
	native.rf_reference_corridor_candidates.length,
	0,
	"RF reference corridor is crossed by signal copper",
);
console.log(
	"PASS: Nordic DEC1–DEC4 use short top-layer routes; RF feed reference corridor has no crossing signal tracks.",
);
