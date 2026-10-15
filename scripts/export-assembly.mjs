import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const c = JSON.parse(
	readFileSync(process.argv[2] ?? "dist/index/circuit.json", "utf8"),
);
const pcb = new Map(
	c
		.filter((x) => x.type === "pcb_component")
		.map((x) => [x.source_component_id, x]),
);
const inventory = JSON.parse(readFileSync("sourcing/stock.json", "utf8"));
const groups = new Map();
const parts = c.filter(
	(x) =>
		x.type === "source_component" &&
		!pcb.get(x.source_component_id)?.do_not_place,
);
const csv = (rows) =>
	rows
		.map((row) =>
			row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","),
		)
		.join("\n") + "\n";
if (
	c.filter((x) => x.type === "source_component").length !== 71 ||
	parts.length !== 70
)
	throw Error(
		"Expected 71 PCB components, including 70 fitted SMT parts; refusing incomplete assembly export",
	);
for (const p of parts) {
	const code = p.supplier_part_numbers?.jlcpcb?.[0];
	if (!code) throw Error(`${p.name}: exact supplier code missing`);
	const g = groups.get(code) ?? {
		mpn: p.manufacturer_part_number,
		code,
		refs: [],
		footprint:
			inventory.parts.find((x) => x.code === code && x.identity_match)
				?.package ??
			p.footprint ??
			"Exact custom land pattern",
	};
	if (g.mpn !== p.manufacturer_part_number)
		throw Error(`${code}: conflicting MPNs`);
	g.refs.push(p.name);
	groups.set(code, g);
}
const rows = [
	["Comment", "Designator", "Footprint", "LCSC Part #", "Quantity"],
];
for (const g of groups.values())
	rows.push([g.mpn, g.refs.join(","), g.footprint, g.code, g.refs.length]);
mkdirSync("release", { recursive: true });
writeFileSync("bom-jlcpcb.csv", csv(rows));
writeFileSync("release/assembly-bom.csv", csv(rows));
const cpl = [["Designator", "Mid X", "Mid Y", "Layer", "Rotation"]];
for (const p of parts) {
	const f = pcb.get(p.source_component_id);
	if (f.layer !== "top") throw Error(`${p.name}: assembly must be top-side`);
	cpl.push([
		p.name,
		`${(f.center.x + 23).toFixed(4)}mm`,
		`${(f.center.y + 23).toFixed(4)}mm`,
		"Top",
		f.rotation,
	]);
}
writeFileSync("release/assembly-cpl.csv", csv(cpl));
const purchase = [
	[
		"Reference",
		"Quantity per watch",
		"Manufacturer part",
		"Supplier code",
		"Purchase URL",
		"Assembly stage",
		"Procurement status",
	],
];
purchase.push([
	"PCB1",
	1,
	"46 x 46 mm, four layers, 1 mm FR-4, ENIG; release Gerbers and drills",
	"",
	"https://jlcpcb.com/",
	"Bare PCB fabrication",
	"Fabricator stackup, impedance and engineering release approval pending",
]);
purchase.push([
	"SMT_SERVICE",
	1,
	"Top-side SMT assembly of 70 fitted parts; exact BOM/CPL",
	"",
	"https://jlcpcb.com/pcb-assembly",
	"Before external product assembly",
	"Assembler orientation, stencil and inspection approval pending",
]);
for (const g of groups.values())
	purchase.push([
		g.refs.join(","),
		g.refs.length,
		g.mpn,
		g.code,
		`https://jlcpcb.com/partdetail/${g.code}`,
		"Top SMT assembly",
		`Inventory ${inventory.parts.find((x) => x.code === g.code)?.status ?? "unknown"} as of ${inventory.checked_at}; not reserved`,
	]);
for (const x of JSON.parse(
	readFileSync("sourcing/external-parts.json", "utf8"),
))
	purchase.push([
		x.reference,
		x.quantity,
		x.part,
		x.supplier_code ?? "",
		x.purchase_url,
		x.stage,
		x.stock_status,
	]);
writeFileSync("bom.csv", csv(purchase));
writeFileSync("release/full-purchase-list.csv", csv(purchase));
console.log(
	`Exported ${parts.length} fitted components in ${groups.size} SMT lines; external assembly is listed separately.`,
);
