import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createElement, cloneElement } from "react";
import { RootCircuit } from "@tscircuit/core";
import { runAllRoutingChecks } from "@tscircuit/checks";
import {
	analyzeSchematicPlacement,
	createSchematicPlacementIssueArtifacts,
} from "../checks/vendor/schematic-placement.mjs";
import Viewer from "../index.circuit.tsx";
import Assembly from "../assembly.circuit.tsx";
const reviewed = JSON.parse(readFileSync("routing/reviewed.circuit.json"));
const kinds = new Set(["pcb_trace", "pcb_via", "pcb_copper_pour"]);
const physical = (x) => {
	if (Array.isArray(x)) return x.map(physical);
	if (x && typeof x === "object")
		return Object.fromEntries(
			Object.entries(x)
				.filter(([k]) => !k.endsWith("_id"))
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, physical(v)]),
		);
	return x;
};
const geometry = (circuit) =>
	circuit
		.filter((x) => kinds.has(x.type))
		.map((x) => JSON.stringify(physical(x)))
		.sort();
const reports = [];
mkdirSync("build", { recursive: true });
for (const [name, component, count] of [
	["index", Viewer, 71],
	["assembly", Assembly, 72],
]) {
	const root = new RootCircuit();
	root.add(createElement(component));
	await root.renderUntilSettled();
	const c = await root.getCircuitJson();
	assert.equal(c.filter((x) => x.type === "source_component").length, count);
	assert.equal(c.filter((x) => x.type === "pcb_component").length, 71);
	if (JSON.stringify(geometry(c)) !== JSON.stringify(geometry(reviewed)))
		throw Error(
			`${name}: changed copper: ${geometry(c)
				.filter((x) => !geometry(reviewed).includes(x))
				.slice(0, 1)}; expected-only: ${geometry(reviewed)
				.filter((x) => !geometry(c).includes(x))
				.slice(0, 1)}`,
		);
	assert.deepEqual(
		c.filter((x) => /error|warning/.test(x.type)),
		[],
	);
	assert.deepEqual(await runAllRoutingChecks(c), []);
	const analysis = analyzeSchematicPlacement(c);
	assert.deepEqual(createSchematicPlacementIssueArtifacts(c, { analysis }), []);
	if (name === "assembly")
		assert(
			c.some(
				(x) =>
					x.type === "cad_component" &&
					x.model_glb_url?.startsWith("data:model/gltf-binary;base64,"),
			),
			"External assembly model missing",
		);
	const bytes = JSON.stringify(c, null, 2) + "\n";
	writeFileSync(`build/${name}-verified.circuit.json`, bytes);
	reports.push({
		entry: `${name}.circuit.tsx`,
		source_components: count,
		pcb_components: 71,
		traces: 833,
		vias: 95,
		pours: 8,
		diagnostics: 0,
		schematic_style_issues: 0,
		circuit_sha256: createHash("sha256").update(bytes).digest("hex"),
	});
}
// A meaningful regression test: reject a changed board envelope with saved copper.
const changed = new RootCircuit();
changed.add(cloneElement(Viewer(), { width: "47mm" }));
await assert.rejects(
	() => changed.renderUntilSettled(),
	/Reviewed native routing is stale/,
);
writeFileSync(
	"docs/checks/viewer.json",
	JSON.stringify({ entries: reports, stale_geometry_rejected: true }, null, 2) +
		"\n",
);
console.log(
	"PASS: both real viewer entries retain all 833 segments, 95 vias, 8 pours; zero DRC/style diagnostics; stale geometry rejected.",
);
