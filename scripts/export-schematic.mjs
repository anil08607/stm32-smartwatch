import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const c = JSON.parse(readFileSync("routing/reviewed.circuit.json", "utf8")),
	out = process.argv[2] ?? "hardware";
mkdirSync(out, { recursive: true });
const Q = JSON.stringify,
	F = (n) => Number(n.toFixed(4)),
	uid = (s) => {
		const h = createHash("sha256").update(s).digest("hex");
		return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
	},
	root = uid("smartwatch-nrf52810"),
	project = "smartwatch-nrf52810";
const parent = new Map(),
	find = (k) => {
		if (!parent.has(k)) parent.set(k, k);
		if (parent.get(k) !== k) parent.set(k, find(parent.get(k)));
		return parent.get(k);
	},
	join = (a, b) => parent.set(find(a), find(b));
for (const t of c.filter((x) => x.type === "source_trace")) {
	const ids = [
		...(t.connected_source_port_ids ?? []),
		...(t.connected_source_net_ids ?? []),
	];
	ids.slice(1).forEach((i) => join(ids[0], i));
}
const nets = new Map(
	c
		.filter((x) => x.type === "source_net")
		.map((n) => [find(n.source_net_id), n.name]),
);
const netOf = (p) =>
	parent.has(p.source_port_id) ? nets.get(find(p.source_port_id)) : undefined;
const effects = "(effects (font (size 1.27 1.27)))",
	tiny = "(effects (font (size 1.016 1.016)))";
const property = (name, value, x, y, hide = false) =>
	`(property ${Q(name)} ${Q(value)} (at ${F(x)} ${F(y)} 0) (effects (font (size 1.27 1.27)) ${hide ? "(hide yes)" : ""}))`;
const sheets = c.filter((x) => x.type === "schematic_sheet");
const sources = c.filter((x) => x.type === "source_component");
const symbols = new Map(),
	paths = {},
	pinManifest = {};
let allLib = [];
function pinType(s, p, net) {
	if (
		(s.name === "J1" && p.pin_number === 2) ||
		(s.name === "J2" && p.pin_number === 1) ||
		(s.name === "J1" && p.pin_number === 1) ||
		(s.name === "U6" && p.pin_number === 6) ||
		(s.name === "U5" && p.pin_number === 4)
	)
		return "power_out";
	if (p.provides_power && s.name !== "J1") return "power_out";
	if (s.name === "U1" && [1, 32, 33, 46].includes(p.pin_number))
		return "power_out";
	if (p.requires_power || p.consumes_power) return "power_in";
	if (s.name.startsWith("U") && /^P0|SWD|nRESET/.test(p.name))
		return "bidirectional";
	return "passive";
}
for (const s of sources) {
	const pins = c
		.filter(
			(x) =>
				x.type === "source_port" &&
				x.source_component_id === s.source_component_id,
		)
		.sort((a, b) => a.pin_number - b.pin_number);
	const half = Math.ceil(pins.length / 2),
		height = Math.max(7.62, (half + 1) * 2.54),
		name = `${s.name}_exact`;
	const pinDefs = pins.map((p, i) => {
		const left = i < half,
			index = left ? i : i - half;
		return {
			...p,
			net: netOf(p),
			x: left ? -25.4 : 25.4,
			y: F(height / 2 - 2.54 * (index + 1)),
			angle: left ? 0 : 180,
		};
	});
	const body = `(symbol ${Q(name)} (pin_names (offset 1.016)) (exclude_from_sim no) (in_bom yes) (on_board yes) ${property("Reference", s.name[0], 0, height / 2 + 2.54)} ${property("Value", s.manufacturer_part_number ?? s.name, 0, -height / 2 - 2.54)} (symbol ${Q(name + "_0_1")} (rectangle (start -20.32 ${F(height / 2)}) (end 20.32 ${F(-height / 2)}) (stroke (width 0.254) (type default)) (fill (type background)))) (symbol ${Q(name + "_1_1")} ${pinDefs.map((p) => `(pin ${pinType(s, p, p.net)} line (at ${p.x} ${p.y} ${p.angle}) (length 5.08) (name ${Q(p.name)} ${tiny}) (number ${Q(String(p.pin_number))} ${tiny}))`).join("\n")}))`;
	allLib.push(body);
	symbols.set(s.source_component_id, { name, body, pins: pinDefs, height });
	pinManifest[s.name] = Object.fromEntries(
		pinDefs.map((p) => [p.pin_number, p.net ?? null]),
	);
}
const flag =
	'(symbol "PWR_FLAG" (power) (pin_names (offset 0)) (exclude_from_sim no) (in_bom no) (on_board no) (property "Reference" "#FLG" (at 0 2.54 0) (effects (font (size 1.27 1.27)) (hide yes))) (property "Value" "PWR_FLAG" (at 0 5.08 0) (effects (font (size 1.27 1.27)))) (symbol "PWR_FLAG_0_1" (polyline (pts (xy 0 0) (xy -1.27 1.27) (xy 0 2.54) (xy 1.27 1.27) (xy 0 0)) (stroke (width 0.254) (type default)) (fill (type none)))) (symbol "PWR_FLAG_1_1" (pin power_out line (at 0 0 90) (length 0) (name "pwr" (effects (font (size 1.27 1.27)))) (number "1" (effects (font (size 1.27 1.27)))))))';
allLib.push(flag);
let rootSheets = [];
for (const [si, sheet] of sheets.entries()) {
	const sheetId = uid(sheet.name),
		file = sheet.name + ".kicad_sch",
		sheetSources = sources.filter((s) =>
			c.some(
				(x) =>
					x.type === "schematic_component" &&
					x.source_component_id === s.source_component_id &&
					x.schematic_sheet_id === sheet.schematic_sheet_id,
			),
		);
	let entries = [],
		libs = [],
		col = 0,
		y = 40;
	for (const s of sheetSources) {
		const model = symbols.get(s.source_component_id);
		if (y + model.height > 255) {
			col++;
			y = 40;
		}
		if (col > 2) throw Error(`${sheet.name}: schematic page overflow`);
		const x = 66.04 + col * 132.08,
			cy = F(Math.ceil((y + model.height / 2) / 1.27) * 1.27),
			id = uid(s.name);
		paths[s.name] = `/${root}/${sheetId}/${id}`;
		libs.push(
			model.body.replace(
				`(symbol ${Q(model.name)}`,
				`(symbol ${Q("Smartwatch:" + model.name)}`,
			),
		);
		entries.push(
			`(symbol (lib_id ${Q("Smartwatch:" + model.name)}) (at ${x} ${cy} 0) (unit 1) (exclude_from_sim no) (in_bom yes) (on_board yes) (dnp ${s.name === "M1" ? "yes" : "no"}) (uuid ${id}) ${property("Reference", s.name, x, cy - model.height / 2 - 5.08)} ${property("Value", s.manufacturer_part_number ?? s.name, x, cy - model.height / 2 - 2.54)} ${property("Footprint", "Smartwatch:" + s.name + "_exact", x, cy, true)} (instances (project ${Q(project)} (path ${Q("/" + root + "/" + sheetId)} (reference ${Q(s.name)}) (unit 1)))))`,
		);
		for (const p of model.pins) {
			const px = F(x + p.x),
				py = F(cy - p.y),
				eid = uid(`${s.name}.${p.pin_number}`);
			if (!p.net) entries.push(`(no_connect (at ${px} ${py}) (uuid ${eid}))`);
			else {
				const end = F(px + (p.x < 0 ? -5.08 : 5.08));
				entries.push(
					`(wire (pts (xy ${px} ${py}) (xy ${end} ${py})) (stroke (width 0) (type default)) (uuid ${eid}))`,
				);
				entries.push(
					`(global_label ${Q(p.net)} (shape bidirectional) (at ${end} ${py} ${p.x < 0 ? 0 : 180}) ${effects} (uuid ${uid(eid + "label")}) ${property("Intersheetrefs", "${INTERSHEET_REFS}", end, py, true)})`,
				);
			}
		}
		y = cy + model.height / 2 + 15.24;
	}
	if (si === 0) {
		libs.push(
			flag.replace('(symbol "PWR_FLAG"', '(symbol "Smartwatch:PWR_FLAG"'),
		);
		entries.push(
			`(symbol (lib_id "Smartwatch:PWR_FLAG") (at 370.84 254 0) (unit 1) (in_bom no) (on_board no) (uuid ${uid("PD_VIN_FLAG")}) ${property("Reference", "#FLG01", 370.84, 254, true)} ${property("Value", "PWR_FLAG", 370.84, 248.92)} (instances (project ${Q(project)} (path ${Q("/" + root + "/" + sheetId)} (reference "#FLG01") (unit 1))))) (global_label "PD_VIN" (shape input) (at 370.84 254 0) ${effects} (uuid ${uid("PD_VIN_FLAG_LABEL")}) ${property("Intersheetrefs", "${INTERSHEET_REFS}", 370.84, 254, true)})`,
		);
	}
	const text = `(kicad_sch (version 20250114) (generator "eeschema") (uuid ${sheetId}) (paper "A3") (title_block (title ${Q(sheet.display_name)}) (company "Anil Kumar") (rev "V1 nRF52810")) (lib_symbols ${libs.join("\n")}) ${entries.join("\n")} (embedded_fonts no))\n`;
	writeFileSync(`${out}/${file}`, text);
	rootSheets.push(
		`(sheet (at ${25.4 + (si % 3) * 88.9} ${25.4 + Math.floor(si / 3) * 50.8}) (size 76.2 30.48) (stroke (width 0.254) (type solid)) (fill (color 0 0 0 0)) (uuid ${sheetId}) ${property("Sheetname", sheet.display_name, 25.4 + (si % 3) * 88.9, 22.86 + Math.floor(si / 3) * 50.8)} ${property("Sheetfile", file, 25.4 + (si % 3) * 88.9, 58.42 + Math.floor(si / 3) * 50.8)} (instances (project ${Q(project)} (path ${Q("/" + root)} (page ${Q(String(si + 2))})))))`,
	);
}
writeFileSync(
	`${out}/${project}.kicad_sch`,
	`(kicad_sch (version 20250114) (generator "eeschema") (uuid ${root}) (paper "A3") (title_block (title "nRF52810 smartwatch — electrical sheets") (company "Anil Kumar") (rev "V1")) (lib_symbols) ${rootSheets.join("\n")} (sheet_instances (path "/" (page "1"))) (embedded_fonts no))\n`,
);
writeFileSync(
	`${out}/Smartwatch.kicad_sym`,
	`(kicad_symbol_lib (version 20241209) (generator "kicad_symbol_editor") ${allLib.join("\n")})\n`,
);
writeFileSync(
	`${out}/sym-lib-table`,
	'(sym_lib_table (lib (name "Smartwatch") (type "KiCad") (uri "${KIPRJMOD}/Smartwatch.kicad_sym") (options "") (descr "Project-local symbols with exact numbered source pins")))\n',
);
writeFileSync(
	`${out}/schematic-paths.json`,
	JSON.stringify(paths, null, 2) + "\n",
);
writeFileSync(
	`${out}/pin-net-manifest.json`,
	JSON.stringify(pinManifest, null, 2) + "\n",
);
console.log(
	`Generated ${sheets.length} native sheets, ${sources.length} portable symbols, explicit NC pins and source-derived net manifest.`,
);
