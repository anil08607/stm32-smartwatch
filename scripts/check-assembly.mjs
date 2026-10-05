import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const circuit = JSON.parse(
	readFileSync(process.argv[2] ?? "dist/index/circuit.json", "utf8"),
);
const sourceComponents = circuit.filter(
	(item) => item.type === "source_component",
);
const pcbComponents = circuit.filter((item) => item.type === "pcb_component");
assert.equal(
	pcbComponents.length,
	sourceComponents.length,
	"Every fitted part needs a PCB component",
);

const names = new Map(
	sourceComponents.map((item) => [item.source_component_id, item.name]),
);
for (const component of pcbComponents) {
	const name =
		names.get(component.source_component_id) ?? component.pcb_component_id;
	assert.equal(
		component.layer,
		"top",
		`${name}: bottom-side assembly is forbidden`,
	);
	assert(
		!component.is_allowed_to_be_off_board,
		`${name}: allowOffBoard is forbidden`,
	);
}
for (const component of sourceComponents) {
	assert(
		component.supplier_part_numbers?.jlcpcb?.[0],
		`${component.name}: fitted part needs an exact JLCPCB/LCSC code`,
	);
}

const parseCsvLine = (line) => {
	const cells = [];
	let cell = "";
	let quoted = false;
	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		if (character === '"' && line[index + 1] === '"') {
			cell += '"';
			index += 1;
		} else if (character === '"') quoted = !quoted;
		else if (character === "," && !quoted) {
			cells.push(cell);
			cell = "";
		} else cell += character;
	}
	cells.push(cell);
	return cells;
};

const bomRows = readFileSync("bom-jlcpcb.csv", "utf8")
	.trim()
	.split(/\r?\n/)
	.slice(1)
	.map((line) => {
		const [mpn, designators, footprint, lcsc, quantity] = parseCsvLine(line);
		return { mpn, designators, footprint, lcsc, quantity: Number(quantity) };
	});
const bomByLcsc = new Map(bomRows.map((row) => [row.lcsc, row]));
const expectedGroups = new Map();
for (const component of sourceComponents) {
	const lcsc = component.supplier_part_numbers.jlcpcb[0];
	const group = expectedGroups.get(lcsc) ?? {
		mpn: component.manufacturer_part_number,
		designators: [],
	};
	assert.equal(
		group.mpn,
		component.manufacturer_part_number,
		`${lcsc}: mixed MPNs`,
	);
	group.designators.push(component.name);
	expectedGroups.set(lcsc, group);
}
assert.equal(
	bomRows.length,
	expectedGroups.size,
	"JLCPCB BOM line-item count is stale",
);
for (const [lcsc, group] of expectedGroups) {
	const row = bomByLcsc.get(lcsc);
	assert(row, `${lcsc}: missing from bom-jlcpcb.csv`);
	assert.equal(row.mpn, group.mpn, `${lcsc}: BOM MPN is stale`);
	assert.equal(
		row.quantity,
		group.designators.length,
		`${lcsc}: BOM quantity is stale`,
	);
	const actualDesignators = row.designators
		.split(",")
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
	const expectedDesignators = group.designators.sort((a, b) =>
		a.localeCompare(b, undefined, { numeric: true }),
	);
	assert.deepEqual(
		actualDesignators,
		expectedDesignators,
		`${lcsc}: BOM designators are stale`,
	);
}

console.log(
	`PASS: ${pcbComponents.length} fitted components are top-side only, on-board, carry exact JLCPCB/LCSC codes, and match ${bomRows.length} BOM lines.`,
);
