import { spawnSync } from "node:child_process";
import {
	existsSync,
	readFileSync,
	writeFileSync,
	mkdirSync,
	readdirSync,
	statSync,
} from "node:fs";
import { resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import JSZip from "jszip";
const cli =
		process.env.KICAD_CLI ??
		(existsSync("/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli")
			? "/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli"
			: "kicad-cli"),
	pcb = "hardware/smartwatch-nrf52810.kicad_pcb";
const hash = (f) => createHash("sha256").update(readFileSync(f)).digest("hex"),
	summary = JSON.parse(readFileSync("docs/checks/native-summary.json"));
if (
	summary.board_sha256 !== hash(pcb) ||
	summary.drc_violations ||
	summary.erc_violations ||
	summary.unconnected
)
	throw Error("Current native pass is required before export");
function run(args) {
	const r = spawnSync(cli, args, {
		encoding: "utf8",
		env: { ...process.env, FONTCONFIG_FILE: resolve("build/fonts.conf") },
	});
	if (r.error || r.status !== 0 || r.stderr?.trim())
		throw Error(r.error?.message ?? r.stderr ?? r.stdout);
	console.log(r.stdout.trim());
}
mkdirSync("release/gerbers", { recursive: true });
const assemblyCheck = spawnSync("bun", ["scripts/check-assembly.mjs"], {
	encoding: "utf8",
});
if (assemblyCheck.status !== 0)
	throw Error(assemblyCheck.stderr || assemblyCheck.stdout);
console.log(assemblyCheck.stdout.trim());
mkdirSync("release/drill", { recursive: true });
run([
	"pcb",
	"export",
	"gerbers",
	"--layers",
	"F.Cu,In1.Cu,In2.Cu,B.Cu,F.Mask,B.Mask,F.Paste,F.SilkS,Edge.Cuts",
	"--use-drill-file-origin",
	"--output",
	"release/gerbers/",
	pcb,
]);
run([
	"pcb",
	"export",
	"drill",
	"--format",
	"excellon",
	"--drill-origin",
	"plot",
	"--excellon-units",
	"mm",
	"--excellon-separate-th",
	"--generate-map",
	"--map-format",
	"svg",
	"--generate-report",
	"--report-path",
	"release/drill/report.txt",
	"--output",
	"release/drill/",
	pcb,
]);
run([
	"sch",
	"export",
	"svg",
	"--output",
	"release/schematics/",
	"hardware/smartwatch-nrf52810.kicad_sch",
]);
// KiCad emits trailing spaces in SVG drill markers; normalize text before hashing.
for (const dir of ["drill", "schematics"])
	for (const file of readdirSync(`release/${dir}`).filter((name) =>
		name.endsWith(".svg"),
	)) {
		const path = `release/${dir}/${file}`;
		writeFileSync(path, readFileSync(path, "utf8").replace(/[ \t]+$/gm, ""));
	}
const zip = new JSZip();
for (const dir of ["gerbers", "drill"])
	for (const f of readdirSync(`release/${dir}`))
		zip.file(`${dir}/${f}`, readFileSync(`release/${dir}/${f}`));
zip.file(
	"REVIEW_STATUS.txt",
	"Engineering review only. See release/readiness.json and docs/fabrication.md before any fabrication order.",
);
writeFileSync(
	"release/gerbers-review.zip",
	await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
);
writeFileSync(
	"release/README.md",
	"# Engineering review package\n\nStatus: REVIEW_ONLY_NOT_ORDER_APPROVED. Native DRC/ERC and routed-viewer checks can pass while physical qualification remains pending. Read readiness.json, qualification.json, ../docs/fabrication.md and ../docs/assembly.md before ordering.\n\nGerbers, Excellon drills, top-only SMT BOM/CPL and complete purchase list share the same reviewed source. M1 is excluded from SMT/paste. Stock is not reserved.\n",
);
const files = [];
function walk(dir) {
	for (const f of readdirSync(dir)) {
		const path = `${dir}/${f}`;
		if (statSync(path).isDirectory()) walk(path);
		else if (!path.endsWith("/manifest.json")) files.push(path);
	}
}
walk("release");
const manifest = {
	generated_at: new Date().toISOString(),
	status: "REVIEW_ONLY_NOT_ORDER_APPROVED",
	source_sha256: hash("routing/source.circuit.json"),
	native_board_sha256: hash(pcb),
	files: Object.fromEntries(
		files.sort().map((f) => [relative("release", f), hash(f)]),
	),
};
writeFileSync(
	"release/manifest.json",
	JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
	`Exported review manufacturing package with ${files.length} hashed files.`,
);
