import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const config = JSON.parse(readFileSync("tscircuit.config.json"));
// Run the same CLI discovery path used by the hosted build, not only RootCircuit.
const result = spawnSync("bunx", ["tsci", "build", "--disable-parts-engine"], {
	encoding: "utf8",
	maxBuffer: 16 * 1024 * 1024,
});
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
assert.equal(result.status, 0, "Public multi-entry build failed");
assert(
	!/Warning:|Build error:|Fatal error/.test(result.stdout + result.stderr),
);
const entries = config.includeBoardFiles.map((file) => {
	const path = `dist/${file.replace(/\.circuit\.tsx$/, "")}/circuit.json`;
	const bytes = readFileSync(path);
	const c = JSON.parse(bytes);
	assert.deepEqual(
		c.filter((x) => /error|warning/.test(x.type)),
		[],
	);
	assert.equal(c.filter((x) => x.type === "pcb_trace").length, 833);
	assert.equal(c.filter((x) => x.type === "pcb_via").length, 95);
	const mechanical = c.filter(
		(x) =>
			x.type === "cad_component" &&
			x.model_glb_url?.startsWith("data:model/gltf-binary;base64,"),
	);
	assert.equal(
		mechanical.length,
		file === "pcb.circuit.tsx"
			? 0
			: JSON.parse(readFileSync("mechanical/assembly-model.json")).parts.length,
	);
	return {
		file,
		mechanical_parts: mechanical.length,
		circuit_sha256: createHash("sha256").update(bytes).digest("hex"),
	};
});
writeFileSync(
	"docs/checks/public-build.json",
	JSON.stringify(
		{ command: "tsci build --disable-parts-engine", entries, diagnostics: 0 },
		null,
		2,
	) + "\n",
);
console.log(
	"PASS: hosted entry discovery builds all four views with full routing and every mechanical part.",
);
