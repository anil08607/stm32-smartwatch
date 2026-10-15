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
assert(clearance.contacts.length >= 9);
assert(clearance.contacts.every((p) => p.overlap_mm3 < 0.001));
for (const id of [
	"battery",
	"display",
	"display-flex",
	"display-seat-tape",
	"lens-bond",
	"button-plunger-2",
	"button-plunger-10",
	"strap-30",
	"strap--30",
])
	assert(
		models.parts.some((p) => p.id === id),
		`Missing product part ${id}`,
	);
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
