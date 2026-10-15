import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { canonical, differences } from "./canonical-circuit.mjs";
const r = spawnSync(
	"bunx",
	[
		"tsci",
		"build",
		"SMARTWATCH_V1_NRF52810.circuit.tsx",
		"--routing-disabled",
		"--disable-parts-engine",
	],
	{ stdio: "inherit" },
);
if (r.status !== 0) process.exit(r.status ?? 1);
const raw = JSON.parse(
	readFileSync("dist/SMARTWATCH_V1_NRF52810/circuit.json"),
);
const issues = raw.filter((x) => /error|warning/.test(x.type));
if (issues.length) throw Error(JSON.stringify(issues));
// CLI's whole-directory MD5 includes its own generated outputs and changes on every build.
// Bind the actual electrical/geometry records and source files with SHA-256 instead.
for (const record of raw)
	if (record.type === "source_project_metadata")
		delete record.source_filesystem_md5_hash;
const normalized = canonical(
	raw.filter(
		(x) => x.type !== "source_project_metadata" || Object.keys(x).length > 1,
	),
);
if (existsSync("routing/source.circuit.json")) {
	const delta = differences(
		canonical(JSON.parse(readFileSync("routing/source.circuit.json"))),
		normalized,
	);
	if (delta.length)
		console.log("Source changes (first twelve):", JSON.stringify(delta));
}
const data = JSON.stringify(normalized, null, 2) + "\n";
mkdirSync("routing", { recursive: true });
writeFileSync("routing/source.circuit.json", data);
