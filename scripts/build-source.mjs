import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
const data =
	JSON.stringify(
		raw.filter(
			(x) => x.type !== "source_project_metadata" || Object.keys(x).length > 1,
		),
		null,
		2,
	) + "\n";
mkdirSync("routing", { recursive: true });
mkdirSync("dist/index", { recursive: true });
writeFileSync("routing/source.circuit.json", data);
writeFileSync("dist/index/circuit.json", data);
