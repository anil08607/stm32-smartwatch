import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const cli =
	process.env.KICAD_CLI ??
	(existsSync("/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli")
		? "/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli"
		: "kicad-cli");
mkdirSync("build/font-cache", { recursive: true });
writeFileSync(
	"build/fonts.conf",
	`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>/System/Library/Fonts</dir><dir>/Library/Fonts</dir><dir>/usr/share/fonts</dir><cachedir>${resolve("build/font-cache")}</cachedir></fontconfig>`,
);
const env = { ...process.env, FONTCONFIG_FILE: resolve("build/fonts.conf") };
function run(args) {
	const r = spawnSync(cli, args, { encoding: "utf8", env });
	if (r.error || r.status !== 0)
		throw Error(r.error?.message ?? r.stderr ?? r.stdout);
	if (r.stderr?.trim()) throw Error(r.stderr);
	return r.stdout.trim();
}
const version = run(["--version"]);
assert(version.startsWith("10."), `KiCad 10 required; found ${version}`);
const base = "hardware/smartwatch-nrf52810";
console.log(
	run([
		"pcb",
		"drc",
		"--severity-all",
		"--all-track-errors",
		"--format",
		"json",
		"--output",
		"docs/checks/native-drc.json",
		`${base}.kicad_pcb`,
	]),
);
console.log(
	run([
		"sch",
		"erc",
		"--severity-all",
		"--format",
		"json",
		"--output",
		"docs/checks/native-erc.json",
		`${base}.kicad_sch`,
	]),
);
console.log(
	run([
		"sch",
		"export",
		"netlist",
		"--format",
		"kicadxml",
		"--output",
		"hardware/electrical-netlist.xml",
		`${base}.kicad_sch`,
	]),
);
// Store a portable source path; this does not alter electrical evidence.
const xmlFile = "hardware/electrical-netlist.xml";
writeFileSync(
	xmlFile,
	readFileSync(xmlFile, "utf8").replaceAll(`${process.cwd()}/`, ""),
);
const d = JSON.parse(readFileSync("docs/checks/native-drc.json")),
	e = JSON.parse(readFileSync("docs/checks/native-erc.json"));
const dv = [
		...(d.violations ?? []),
		...(d.unconnected_items ?? []),
		...(d.schematic_parity ?? []),
	],
	ev = e.sheets.flatMap((s) => s.violations);
assert.equal(dv.length, 0, JSON.stringify(dv));
assert.equal(ev.length, 0, JSON.stringify(ev));
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
writeFileSync(
	"docs/checks/native-summary.json",
	JSON.stringify(
		{
			checked_at: new Date().toISOString(),
			kicad_version: version,
			board_sha256: sha(`${base}.kicad_pcb`),
			project_sha256: sha(`${base}.kicad_pro`),
			drc_sha256: sha("docs/checks/native-drc.json"),
			erc_sha256: sha("docs/checks/native-erc.json"),
			netlist_sha256: sha("hardware/electrical-netlist.xml"),
			drc_violations: 0,
			unconnected: 0,
			erc_violations: 0,
		},
		null,
		2,
	) + "\n",
);
console.log(
	"PASS: native DRC/ERC have zero errors, warnings or unconnected items; no waivers.",
);
