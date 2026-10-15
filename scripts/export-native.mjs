import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
	CircuitJsonToKicadPcbConverter,
	CircuitJsonToKicadProConverter,
	CircuitJsonToKicadSchConverter,
} from "circuit-json-to-kicad";
import { parseKicadPcb, parseKicadSch } from "kicadts";
const c = JSON.parse(
	readFileSync(process.argv[2] ?? "routing/reviewed.circuit.json", "utf8"),
);
const out = process.argv[3] ?? "hardware";
mkdirSync(out, { recursive: true });
const base = "smartwatch-nrf52810";
const pcb = new CircuitJsonToKicadPcbConverter(c);
pcb.runUntilFinished();
const native = parseKicadPcb(pcb.getOutputString());
for (const f of native.footprints) {
	const ref = f.properties.find((p) => p.key === "Reference")?.value;
	if (ref === "M1") {
		for (const p of f.fpPads)
			p.layers.layers = p.layers.layers.filter((l) => !l.endsWith(".Paste"));
		f.attr.excludeFromBom = true;
		f.attr.excludeFromPosFiles = true;
	}
}
writeFileSync(`${out}/${base}.kicad_pcb`, native.getString());
const sch = new CircuitJsonToKicadSchConverter(c);
sch.runUntilFinished();
for (const f of sch.getOutputFiles({ schematicFilename: `${base}.kicad_sch` }))
	writeFileSync(`${out}/${f.filename}`, f.content);
const pro = new CircuitJsonToKicadProConverter(c, {
	projectName: base,
	schematicFilename: `${base}.kicad_sch`,
	pcbFilename: `${base}.kicad_pcb`,
});
pro.runUntilFinished();
const p = JSON.parse(pro.getOutputString());
p.board ??= {};
p.board.design_settings ??= {};
p.board.design_settings.rules = {
	...p.board.design_settings.rules,
	min_clearance: 0.1,
	min_track_width: 0.1,
	min_copper_edge_clearance: 0.2,
	min_through_hole_diameter: 0.2,
	min_via_diameter: 0.4,
	min_via_annular_width: 0.1,
};
for (const n of p.net_settings.classes) {
	n.clearance = 0.1;
	n.track_width = 0.15;
	n.via_diameter = 0.4;
	n.via_drill = 0.2;
}
writeFileSync(`${out}/${base}.kicad_pro`, JSON.stringify(p, null, 2) + "\n");
console.log(`Exported ${base} PCB, project and schematic sheets to ${out}`);
