import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const hash = (file) =>
	createHash("sha256").update(readFileSync(file)).digest("hex");
const manifest = JSON.parse(readFileSync("mechanical/assembly-manifest.json"));
function inspect(bytes, expected, exploded = false) {
	assert.equal(bytes.readUInt32LE(0), 0x46546c67);
	const length = bytes.readUInt32LE(12),
		j = JSON.parse(bytes.subarray(20, 20 + length).toString());
	assert.equal(j.nodes.length, expected.length);
	for (const p of expected) {
		const node = j.nodes.find((n) => n.name === p.id);
		assert(node, `Missing ${p.id}`);
		const a =
			j.accessors[j.meshes[node.mesh].primitives[0].attributes.POSITION];
		for (let axis = 0; axis < 3; axis++) {
			const delta = axis === 2 && exploded ? p.explode : 0;
			for (const [actual, expectedValue] of [
				[a.min[axis] + node.translation[axis], p.bounds_mm[0][axis] + delta],
				[a.max[axis] + node.translation[axis], p.bounds_mm[1][axis] + delta],
			])
				assert(
					Math.abs(actual - expectedValue) < 0.0001,
					`${p.id}: exported GLB transform/bounds changed`,
				);
		}
	}
}
for (const [file, exploded] of [
	["complete-assembly.glb", false],
	["exploded-assembly.glb", true],
])
	inspect(readFileSync(`mechanical/${file}`), manifest.parts, exploded);
const models = JSON.parse(readFileSync("mechanical/assembly-model.json"));
for (const m of models.parts)
	inspect(Buffer.from(m.glb.split(",")[1], "base64"), [
		manifest.parts.find((p) => p.id === m.id),
	]);
const clearance = JSON.parse(
	readFileSync("docs/checks/mechanical-clearance.json"),
);
assert(clearance.contacts.length >= 39);
assert(clearance.contacts.every((p) => p.overlap_mm3 < 0.001));
for (const id of [
	"battery",
	"display",
	"display-flex",
	"display-seat-tape",
	"lens-bond",
	"button-plunger-SW1",
	"button-plunger-SW2",
	"strap-30",
	"strap--30",
])
	assert(
		models.parts.some((p) => p.id === id),
		`Missing product part ${id}`,
	);
// Keep case controls tied to the actual electrical component placements.
const circuit = JSON.parse(readFileSync("routing/reviewed.circuit.json"));
const components = new Map(
	circuit
		.filter((p) => p.type === "source_component")
		.map((p) => [p.source_component_id, p.name]),
);
const placement = (name) =>
	circuit.find(
		(p) =>
			p.type === "pcb_component" &&
			components.get(p.source_component_id) === name,
	);
const usb = placement("J1");
assert.equal(usb.rotation, 270);
assert(Math.abs(usb.center.y) < 0.0001 && usb.cable_insertion_center.x < -21);
for (const [i, name] of ["SW1", "SW2"].entries()) {
	const sw = placement(name),
		part = manifest.parts.find((p) => p.id === `button-plunger-${name}`);
	assert.equal(sw.rotation, 90);
	assert(Math.abs(sw.center.x - 20.2) < 0.0001);
	assert(Math.abs(sw.center.y - clearance.buttons.centres_y_mm[i]) < 0.0001);
	assert(
		Math.abs((part.bounds_mm[0][1] + part.bounds_mm[1][1]) / 2 - sw.center.y) <
			0.0001,
	);
}
assert(
	Math.abs(placement("SW1").center.y + placement("SW2").center.y) < 0.0001,
	"Button pair must remain centred",
);
assert.equal(clearance.usb_access.side, "-X");
assert.equal(clearance.buttons.side, "+X");
writeFileSync(
	"docs/checks/mechanical-export.json",
	JSON.stringify(
		{
			parts: manifest.parts.length,
			external_subassemblies: models.parts.length,
			all_exported_part_bounds_match: true,
			nominal_collision_pairs: clearance.contacts.length,
			inputs: Object.fromEntries(
				[
					"mechanical/assembly-manifest.json",
					"mechanical/assembly-model.json",
					"mechanical/complete-assembly.glb",
					"mechanical/exploded-assembly.glb",
					"docs/checks/mechanical-clearance.json",
				].map((f) => [f, hash(f)]),
			),
		},
		null,
		2,
	) + "\n",
);
console.log(
	`PASS: ${manifest.parts.length} parts retain their world transforms in compact/exploded GLB; ${models.parts.length} individual assembly models, ${clearance.contacts.length} nominal collision checks.`,
);
