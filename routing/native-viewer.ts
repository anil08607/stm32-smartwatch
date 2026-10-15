import type { Board } from "@tscircuit/core";
import type { AnyCircuitElement } from "circuit-json";
import reviewed from "./reviewed.circuit.json";

type RecordData = Record<string, any>;
const kinds = new Set(["pcb_trace", "pcb_via", "pcb_copper_pour"]);

// Fail after an electrical/placement edit instead of displaying stale copper.
function signature(records: RecordData[]) {
	const labels = new Map<string, string>();
	for (const x of records.filter(
		(x) => x.type === "source_component" && x.ftype !== "subassembly",
	))
		labels.set(x.source_component_id, x.name);
	for (const x of records.filter((x) => x.type === "source_net"))
		labels.set(x.source_net_id, x.name);
	for (const x of records.filter((x) => x.type === "source_port"))
		labels.set(
			x.source_port_id,
			`${labels.get(x.source_component_id)}.${x.pin_number ?? x.name}`,
		);
	for (const x of records.filter((x) => x.type === "pcb_component"))
		labels.set(x.pcb_component_id, labels.get(x.source_component_id)!);
	for (const x of records.filter((x) => x.type === "pcb_port"))
		labels.set(x.pcb_port_id, labels.get(x.source_port_id)!);
	const keep = new Set([
		"source_component",
		"source_port",
		"source_net",
		"source_trace",
		"pcb_board",
		"pcb_component",
		"pcb_port",
		"pcb_smtpad",
		"pcb_plated_hole",
		"pcb_hole",
	]);
	const normalize = (x: any): any => {
		if (typeof x === "number") return Math.round(x * 1e6) / 1e6;
		if (typeof x === "string") return labels.get(x) ?? x;
		if (Array.isArray(x)) return x.map(normalize);
		if (x && typeof x === "object")
			return Object.fromEntries(
				Object.entries(x)
					.filter(
						([k]) =>
							!k.endsWith("_id") &&
							!k.includes("connectivity_map") &&
							k !== "pcb_port_ids" &&
							k !== "source_group_ids" &&
							k !== "source_component_ids" &&
							k !== "source_trace_ids",
					)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([k, v]) => [k, normalize(v)]),
			);
		return x;
	};
	return records
		.filter((x) => keep.has(x.type) && x.ftype !== "subassembly")
		.map((x) =>
			JSON.stringify({
				...normalize(x),
				owner: labels.get(x.source_component_id ?? x.pcb_component_id),
				port: labels.get(x.source_port_id ?? x.pcb_port_id),
			}),
		)
		.sort()
		.join("\n");
}

/** Replace only routing; the normal source, placement, schematic and DRC phases still run. */
export function installNativeRouting(board: Board | null) {
	if (!board) return;
	board.doInitialPcbTraceRender = () => {
		const db = board.root!.db;
		const current = db.toArray() as RecordData[];
		const actual = signature(current),
			expected = signature(reviewed);
		if (actual !== expected) {
			const actualRows = actual.split("\n"),
				expectedRows = expected.split("\n");
			const actualSet = new Set(actualRows),
				expectedSet = new Set(expectedRows);
			throw new Error(
				`Reviewed native routing is stale. Current-only: ${actualRows
					.filter((x) => !expectedSet.has(x))
					.slice(0, 2)
					.join("; ")}. Reviewed-only: ${expectedRows
					.filter((x) => !actualSet.has(x))
					.slice(0, 2)
					.join("; ")}`,
			);
		}
		const ids = new Map<string, string>();
		for (const type of ["source_net", "source_trace"]) {
			const key = (x: RecordData) =>
				type === "source_net"
					? x.name
					: JSON.stringify([
							x.connected_source_port_ids,
							x.connected_source_net_ids,
						]);
			for (const x of reviewed.filter((x) => x.type === type) as RecordData[]) {
				const match = current.find((y) => y.type === type && key(y) === key(x));
				if (!match) throw new Error(`Native route identity mismatch: ${type}`);
				ids.set(x[`${type}_id`], match[`${type}_id`]);
			}
		}
		for (const type of ["pcb_trace", "pcb_via", "pcb_copper_pour"] as const)
			for (const x of db[type].list())
				db[type].delete((x as RecordData)[`${type}_id`]);
		const copper = reviewed
			.filter((x) => kinds.has(x.type))
			.map((x) => {
				const copy = structuredClone(x) as RecordData;
				copy.subcircuit_id = board.subcircuit_id;
				for (const field of ["source_net_id", "source_trace_id"])
					if (copy[field]) copy[field] = ids.get(copy[field]);
				return copy as AnyCircuitElement;
			});
		db.insertAll(copper);
	};
}
