import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import jscad from "@jscad/modeling";
import stl from "@jscad/stl-serializer";
const { cuboid, roundedCuboid, cylinder } = jscad.primitives,
	{ union, subtract } = jscad.booleans,
	{ translate, rotateY } = jscad.transforms,
	{ measureVolume, measureBoundingBox } = jscad.measurements;
mkdirSync("mechanical", { recursive: true });
const box = (size, center = [0, 0, 0]) => cuboid({ size, center }),
	round = (size, center, r = 0.3) =>
		translate(
			[center[0], center[1], center[2] - size[2] / 2],
			jscad.extrusions.extrudeLinear(
				{ height: size[2] },
				jscad.primitives.roundedRectangle({
					size: size.slice(0, 2),
					roundRadius: Math.min(r, size[0] / 2 - 0.001, size[1] / 2 - 0.001),
					segments: 48,
				}),
			),
		),
	cyl = (r, h, x, y, z) =>
		cylinder({ radius: r, height: h, center: [x, y, z], segments: 48 }),
	parts = [];
const add = (id, solid, color, stage, explode = 0, production = false) => {
	parts.push({ id, solid, color, stage, explode, production });
	if (production)
		writeFileSync(
			`mechanical/${id}.stl`,
			Buffer.concat(
				stl.serialize({ binary: true }, solid).map((x) => Buffer.from(x)),
			),
		);
	return solid;
};
// PCB top is Z=0. Bottom is -1. All mechanical coordinates are millimetres.
const screws = [
	[-22.8, -22.8],
	[-22.8, 22.8],
	[22.8, -22.8],
	[22.8, 22.8],
];
let base = subtract(
	round([54, 54, 12.8], [0, 0, -2.1], 6),
	round([49, 49, 15], [0, 0, 0.5], 5),
);
const ledge = subtract(
	round([47.2, 47.2, 0.8], [0, 0, -1.4], 8),
	round([43.5, 43.5, 2], [0, 0, -1.4], 7),
);
base = union(
	base,
	ledge,
	...screws.map(([x, y]) => cyl(2.5, 11.5, x, y, -2.25)),
);
for (const [x, y] of screws) base = subtract(base, cyl(1.6, 4.2, x, y, 1.5));
base = subtract(
	base,
	box([11, 8, 6], [0, -26, 1]),
	box([8, 7, 6], [26, -2, 1.2]),
	box([8, 7, 6], [26, -10, 1.2]),
);
for (const y of [-30, 30])
	for (const x of [-12.5, 12.5]) {
		let lug = round([3, 10, 5], [x, y, -2], 0.7);
		lug = subtract(
			lug,
			translate(
				[x, y, -2],
				rotateY(
					Math.PI / 2,
					cylinder({ radius: 0.8, height: 5, segments: 24 }),
				),
			),
		);
		base = union(base, lug);
	}
add(
	"case-base",
	base,
	[0.11, 0.14, 0.18, 1],
	"Custom printed base, PETG prototype",
	-14,
	true,
);
let retainer = subtract(
	round([47.4, 47.4, 0.8], [0, 0, 3.9], 8),
	round([36.3, 38.5, 3], [-3.5, 0, 3.9], 0.4),
);
retainer = union(
	retainer,
	...screws.map(([x, y]) =>
		union(
			cyl(2.3, 0.8, x, y, 3.9),
			box([5, 5, 0.8], [Math.sign(x) * 21.2, Math.sign(y) * 21.2, 3.9]),
		),
	),
	box([1.2, 3, 3.5], [-22.2, 12, 1.75]),
	box([2, 2, 3.5], [20, 17, 1.75]),
	box([2, 2, 3.5], [-17, -20, 1.75]),
	box([2, 2, 3.5], [17, -20, 1.75]),
);
for (const [x, y] of screws)
	retainer = subtract(retainer, cyl(1.15, 3, x, y, 3.9));
add(
	"display-retainer",
	retainer,
	[0.25, 0.28, 0.32, 1],
	"Printed PCB/display retainer",
	12,
	true,
);
let bezel = subtract(
	round([54, 54, 5.2], [0, 0, 6.9], 2.5),
	round([47.6, 47.6, 2.4], [0, 0, 4.4], 0.8),
	round([38.4, 40.4, 3.4], [-3.5, 0, 5.6], 0.5),
	cyl(16.6, 8, -3.5, 0, 7),
);
bezel = union(bezel, ...screws.map(([x, y]) => cyl(2.3, 1.3, x, y, 4.95)));
for (const [x, y] of screws)
	bezel = subtract(bezel, cyl(1.15, 8, x, y, 7), cyl(2.05, 1.8, x, y, 9));
add(
	"bezel",
	bezel,
	[0.14, 0.18, 0.23, 1],
	"Printed bezel with lens pocket",
	30,
	true,
);
add(
	"lens",
	round([38, 40, 1], [-3.5, 0, 6.7], 3),
	[0.4, 0.7, 0.85, 0.28],
	"Clear polycarbonate; custom cut",
	26,
);
add(
	"display",
	box([35.59, 37.74, 1.6], [-3.5, 0, 5.2]),
	[0.03, 0.04, 0.055, 1],
	"ER-TFT1.28-3 no-touch envelope",
	20,
);
add(
	"display-active",
	cyl(16.2, 0.03, -3.5, 0, 6.015),
	[0.03, 0.28, 0.43, 1],
	"Display active face",
	20,
);
add(
	"battery",
	round([30, 35, 4], [-6, -2, -3.8], 0.4),
	[0.68, 0.7, 0.73, 1],
	"LP403035 protected pack envelope; swelling reserve below",
	-7,
);
add(
	"motor",
	cyl(6, 3.4, 16.5, 16, -3.8),
	[0.5, 0.52, 0.55, 1],
	"LCM1234A3523F wired motor",
	-7,
);
add(
	"battery-cushion",
	box([29, 34, 0.5], [-6, -2, -6.75]),
	[0.22, 0.25, 0.28, 1],
	"Nonconductive battery cushion; supplier approval needed",
	-7,
);
add(
	"ntc",
	round([2.5, 3, 1.2], [-6, -18, -3.8], 0.35),
	[0.15, 0.14, 0.12, 1],
	"SEMITEC insulated NTC bonded to pack",
	-7,
);
for (const [i, [x, y]] of screws.entries()) {
	add(
		`insert-${i + 1}`,
		subtract(cyl(1.6, 4, x, y, 1.5), cyl(0.8, 4.2, x, y, 1.5)),
		[0.68, 0.48, 0.12, 1],
		"M2 insert envelope; exact insert drawing pending",
		0,
	);
	add(
		`screw-${i + 1}`,
		union(cyl(1, 8, x, y, 4.1), cyl(1.9, 1.6, x, y, 8.9)),
		[0.55, 0.57, 0.6, 1],
		"M2 x 8 screw envelope",
		36,
	);
}
for (const y of [-30, 30]) {
	add(
		`spring-bar-${y}`,
		translate(
			[0, y, -2],
			rotateY(Math.PI / 2, cylinder({ radius: 0.7, height: 26, segments: 24 })),
		),
		[0.65, 0.68, 0.72, 1],
		"22 mm quick-release spring bar envelope",
		0,
	);
	add(
		`strap-${y}`,
		round([22, 52, 2], [0, y * 1.85, -3.5], 0.8),
		[0.075, 0.1, 0.14, 1],
		"22 mm purchased silicone strap envelope",
		0,
	);
}
for (const y of [-2, -10])
	add(
		`button-plunger-${-y}`,
		round([5.5, 3, 2.5], [24.2, y, 1.5], 0.5),
		[0.35, 0.4, 0.45, 1],
		"Prototype button plunger; fit verification required",
		0,
		true,
	);
// Nonconductive harness envelopes use piecewise cylinders, not electrical copper.
function wire(id, points, r, color, explode = -3) {
	let segments = [];
	for (let i = 1; i < points.length; i++) {
		const a = points[i - 1],
			b = points[i],
			d = b.map((v, j) => v - a[j]),
			h = Math.hypot(...d);
		segments.push(
			jscad.transforms.transform(
				jscad.maths.mat4.fromVectorRotation(
					jscad.maths.mat4.create(),
					[0, 0, 1],
					d,
				),
				cylinder({ radius: r, height: h, segments: 12, center: [0, 0, 0] }),
			),
		);
		segments[segments.length - 1] = translate(
			a.map((v, j) => (v + b[j]) / 2),
			segments.at(-1),
		);
	}
	add(
		id,
		union(...segments),
		color,
		"Harness route envelope; dress and strain-relieve during fit test",
		explode,
	);
}
wire(
	"battery-positive",
	[
		[-9, 15, -3.8],
		[-13, 16, -2],
		[-14, 19, 1.4],
	],
	0.35,
	[0.8, 0.07, 0.04, 1],
);
wire(
	"battery-return",
	[
		[-7, 15, -3.8],
		[-11, 17, -2],
		[-13, 19, 1.4],
	],
	0.35,
	[0.05, 0.05, 0.06, 1],
);
wire(
	"ntc-harness",
	[
		[-6, -18, -3.8],
		[-17, -17, -3.8],
		[-19, -10, 1],
	],
	0.4,
	[0.85, 0.75, 0.3, 1],
);
wire(
	"motor-harness",
	[
		[16.5, 16, -2.2],
		[14, 18, -1.6],
		[13.3, 15, 1],
	],
	0.4,
	[0.8, 0.35, 0.1, 1],
);
add(
	"display-flex",
	union(
		box([0.15, 8, 4], [-22, 0, 2.5]),
		box([5, 8, 0.15], [-19.5, 0, 0.6]),
		box([3, 8, 0.15], [-20.5, 0, 4.3]),
	),
	[0.65, 0.38, 0.08, 1],
	"FPC envelope; actual fold length/contact orientation must be confirmed",
	16,
);
const source = JSON.parse(readFileSync("dist/index/circuit.json")),
	names = new Map(
		source
			.filter((x) => x.type === "source_component")
			.map((x) => [x.source_component_id, x.name]),
	);
add(
	"pcb",
	round([46, 46, 1], [0, 0, -0.5], 8),
	[0.025, 0.12, 0.09, 1],
	"46 x 46 R8 board represented by the native PCB artifact",
	0,
);
for (const f of source.filter(
	(x) => x.type === "pcb_component" && !x.do_not_place,
)) {
	const name = names.get(f.source_component_id),
		h = name.startsWith("J")
			? 3.2
			: name.startsWith("SW")
				? 3.5
				: name === "L1"
					? 2.2
					: name.startsWith("U")
						? 1
						: 0.6;
	add(
		name,
		box(
			[Math.max(0.3, f.width * 0.8), Math.max(0.3, f.height * 0.8), h],
			[f.center.x, f.center.y, h / 2],
		),
		name.startsWith("J") ? [0.62, 0.65, 0.68, 1] : [0.13, 0.14, 0.15, 1],
		"Component envelope; use native PCB/footprint for exact lands",
		0,
	);
}
function glb(items, exploded) {
	let chunks = [],
		offset = 0;
	const json = {
		asset: {
			version: "2.0",
			generator: "Anil smartwatch mechanical generator; millimetre coordinates",
		},
		scene: 0,
		scenes: [{ nodes: [] }],
		nodes: [],
		meshes: [],
		materials: [],
		buffers: [],
		bufferViews: [],
		accessors: [],
	};
	function accessor(data) {
		const buf = Buffer.from(new Float32Array(data).buffer),
			i = json.bufferViews.length;
		chunks.push(buf);
		json.bufferViews.push({
			buffer: 0,
			byteOffset: offset,
			byteLength: buf.length,
			target: 34962,
		});
		offset += buf.length;
		const a = json.accessors.length,
			min = [Infinity, Infinity, Infinity],
			max = [-Infinity, -Infinity, -Infinity];
		for (let k = 0; k < data.length; k++) {
			const j = k % 3;
			min[j] = Math.min(min[j], data[k]);
			max[j] = Math.max(max[j], data[k]);
		}
		json.accessors.push({
			bufferView: i,
			componentType: 5126,
			count: data.length / 3,
			type: "VEC3",
			min,
			max,
		});
		return a;
	}
	for (const part of items) {
		const positions = [],
			normals = [];
		for (const poly of part.solid.polygons) {
			const v = poly.vertices;
			for (let i = 1; i < v.length - 1; i++) {
				const a = v[0],
					b = v[i],
					c = v[i + 1],
					u = b.map((n, j) => n - a[j]),
					w = c.map((n, j) => n - a[j]),
					n = [
						u[1] * w[2] - u[2] * w[1],
						u[2] * w[0] - u[0] * w[2],
						u[0] * w[1] - u[1] * w[0],
					],
					l = Math.hypot(...n);
				if (l < 1e-10) continue;
				for (const p of [a, b, c]) {
					positions.push(...p);
					normals.push(...n.map((x) => x / l));
				}
			}
		}
		const pi = accessor(positions),
			ni = accessor(normals),
			material = json.materials.length;
		json.materials.push({
			name: part.id,
			pbrMetallicRoughness: {
				baseColorFactor: part.color,
				metallicFactor: part.id.startsWith("screw") ? 0.7 : 0,
				roughnessFactor: 0.7,
			},
			alphaMode: part.color[3] < 1 ? "BLEND" : "OPAQUE",
			doubleSided: true,
		});
		json.meshes.push({
			name: part.id,
			primitives: [{ attributes: { POSITION: pi, NORMAL: ni }, material }],
		});
		json.scenes[0].nodes.push(json.nodes.length);
		json.nodes.push({
			name: part.id,
			mesh: json.meshes.length - 1,
			translation: [0, 0, exploded ? part.explode : 0],
			extras: { stage: part.stage },
		});
	}
	json.buffers = [{ byteLength: offset }];
	let js = Buffer.from(JSON.stringify(json));
	js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 32)]);
	const bin = Buffer.concat(chunks),
		head = Buffer.alloc(12),
		jh = Buffer.alloc(8),
		bh = Buffer.alloc(8);
	head.writeUInt32LE(0x46546c67);
	head.writeUInt32LE(2, 4);
	head.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
	jh.writeUInt32LE(js.length);
	jh.writeUInt32LE(0x4e4f534a, 4);
	bh.writeUInt32LE(bin.length);
	bh.writeUInt32LE(0x004e4942, 4);
	return Buffer.concat([head, jh, js, bh, bin]);
}
writeFileSync("mechanical/complete-assembly.glb", glb(parts, false));
writeFileSync("mechanical/exploded-assembly.glb", glb(parts, true));
writeFileSync(
	"mechanical/external-assembly.glb",
	glb(
		parts.filter(
			(p) =>
				!names.has(p.id) &&
				!source.some((x) => x.type === "source_component" && x.name === p.id) &&
				p.id !== "pcb",
		),
		false,
	),
);
const manifest = {
	datum: "PCB top Z=0 mm; +Y toward battery connector, -Y toward USB; Z up",
	case_mm: [54, 54, 18],
	includes:
		"case, bezel, retainer, lens, display, flex envelope, battery, cushion, NTC, harness envelopes, motor, fasteners, spring bars, straps, board and all fitted component envelopes",
	status:
		"provisional fit model; exact supplier CAD, flex folding, battery protection volume, harness lengths and hardware fit require physical validation",
	parts: parts.map(({ solid, ...p }) => ({
		...p,
		bounds_mm: measureBoundingBox(solid),
		volume_mm3: measureVolume(solid),
	})),
};
writeFileSync(
	"mechanical/assembly-manifest.json",
	JSON.stringify(manifest, null, 2) + "\n",
);
if (
	manifest.parts.some(
		(p) => !Number.isFinite(p.volume_mm3) || p.volume_mm3 <= 0,
	)
)
	throw Error("Non-solid mechanical part");
console.log(
	`Generated ${parts.length} assembly solids, 5 printable components, compact/exploded GLB and dimension manifest.`,
);

writeFileSync(
	"mechanical/assembly-model.json",
	JSON.stringify({
		external:
			"data:model/gltf-binary;base64," +
			readFileSync("mechanical/external-assembly.glb").toString("base64"),
	}) + "\n",
);
