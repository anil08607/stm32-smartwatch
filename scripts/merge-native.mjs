import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { KicadToCircuitJsonConverter } from "kicad-to-circuit-json";
const source = JSON.parse(readFileSync("routing/source.circuit.json", "utf8")),
	cv = new KicadToCircuitJsonConverter();
cv.addFile(
	"smartwatch-nrf52810.kicad_pcb",
	readFileSync("hardware/smartwatch-nrf52810.kicad_pcb", "utf8"),
);
cv.runUntilFinished();
if (cv.getWarnings().length) throw Error(cv.getWarnings().join("\n"));
const native = cv.getOutput(),
	mapping = new Map();
for (const n of native.filter((x) => x.type === "source_net")) {
	const s = source.find((x) => x.type === "source_net" && x.name === n.name);
	if (!s) throw Error(`Unexpected native net ${n.name}`);
	mapping.set(n.source_net_id, s.source_net_id);
}
for (const n of native.filter((x) => x.type === "source_trace")) {
	const id = mapping.get(n.connected_source_net_ids?.[0]);
	const s = source.find(
		(x) =>
			x.type === "source_trace" && x.connected_source_net_ids?.includes(id),
	);
	if (s) mapping.set(n.source_trace_id, s.source_trace_id);
}
for (const p of native.filter((x) => x.type === "pcb_port")) {
	const ns = native.find(
			(x) => x.type === "source_port" && x.source_port_id === p.source_port_id,
		),
		nc = native.find(
			(x) =>
				x.type === "source_component" &&
				x.source_component_id === ns?.source_component_id,
		),
		sc = source.find(
			(x) => x.type === "source_component" && x.name === nc?.name,
		),
		sp = source.find(
			(x) =>
				x.type === "source_port" &&
				x.source_component_id === sc?.source_component_id &&
				x.pin_number === ns?.pin_number,
		),
		pp = source.find(
			(x) => x.type === "pcb_port" && x.source_port_id === sp?.source_port_id,
		);
	if (pp) mapping.set(p.pcb_port_id, pp.pcb_port_id);
}
function remap(x) {
	if (typeof x === "string") return mapping.get(x) ?? x;
	if (Array.isArray(x)) return x.map(remap);
	if (x && typeof x === "object")
		return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, remap(v)]));
	return x;
}
const kinds = new Set(["pcb_trace", "pcb_via", "pcb_copper_pour"]),
	copper = native.filter((x) => x.type === "pcb_copper_pour").map(remap);
const exact = JSON.parse(readFileSync("routing/native-copper.json", "utf8"));
const sub = source.find((x) => x.type === "source_net").subcircuit_id;
const sourceNet = (name) =>
	source.find((x) => x.type === "source_net" && x.name === name)?.source_net_id;
const sourceTrace = (name) =>
	source.find(
		(x) =>
			x.type === "source_trace" &&
			x.connected_source_net_ids?.includes(sourceNet(name)),
	)?.source_trace_id;
for (const [i, t] of exact.tracks.entries())
	copper.push({
		type: "pcb_trace",
		pcb_trace_id: `native_trace_${i}`,
		source_trace_id: sourceTrace(t.net),
		route: t.route,
		trace_length: Math.hypot(
			t.route[1].x - t.route[0].x,
			t.route[1].y - t.route[0].y,
		),
	});
for (const [i, v] of exact.vias.entries()) {
	const { net, ...geometry } = v;
	copper.push({
		type: "pcb_via",
		pcb_via_id: `native_via_${i}`,
		source_net_id: sourceNet(net),
		...geometry,
	});
}
for (const x of copper) {
	x.subcircuit_id = sub;
	if (x.type === "pcb_copper_pour") x.source_net_id = sourceNet(x.net_name);
}
const result = [...source.filter((x) => !kinds.has(x.type)), ...copper];
writeFileSync(
	"routing/reviewed.circuit.json",
	JSON.stringify(result, null, 2) + "\n",
);
mkdirSync("dist/pcb", { recursive: true });
writeFileSync("dist/pcb/circuit.json", JSON.stringify(result, null, 2) + "\n");
console.log(
	`Merged ${copper.length} exact native copper records with editable source schematic and geometry.`,
);
