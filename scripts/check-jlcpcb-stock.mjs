import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const writeIndex = args.indexOf("--write");
const outputPath = writeIndex >= 0 ? args[writeIndex + 1] : undefined;
const circuitPath =
	args.find(
		(arg, index) => arg.endsWith(".json") && index !== writeIndex + 1,
	) ?? "dist/index/circuit.json";
const boardQuantity = 5;
const circuit = JSON.parse(readFileSync(circuitPath, "utf8"));

const groups = new Map();
for (const component of circuit.filter(
	(item) => item.type === "source_component",
)) {
	const code = component.supplier_part_numbers?.jlcpcb?.[0];
	assert(code, `${component.name}: missing JLCPCB/LCSC supplier code`);
	const group = groups.get(code) ?? {
		lcsc: code,
		mpn: component.manufacturer_part_number,
		designators: [],
	};
	group.designators.push(component.name);
	groups.set(code, group);
}

const checkedAt = new Date().toISOString();
const parts = await Promise.all(
	[...groups.values()].map(async (group) => {
		const searchUrl = `https://jlcsearch.tscircuit.com/components/list.json?search=${encodeURIComponent(group.lcsc)}`;
		const response = await fetch(searchUrl, {
			headers: { "user-agent": "SMARTWATCH_V1_STM32 stock audit" },
		});
		assert(
			response.ok,
			`${group.lcsc}: JLC search returned ${response.status}`,
		);
		const payload = await response.json();
		const numericCode = Number(group.lcsc.slice(1));
		const listing = payload.components?.find(
			(item) => item.lcsc === numericCode,
		);
		assert(listing, `${group.lcsc}: exact listing not returned by JLC search`);
		const quantityPerBoard = group.designators.length;
		const required = quantityPerBoard * boardQuantity;
		return {
			designators: group.designators.sort((a, b) =>
				a.localeCompare(b, undefined, { numeric: true }),
			),
			mpn: group.mpn,
			lcsc: group.lcsc,
			package: listing.package,
			quantity_per_board: quantityPerBoard,
			required_for_5_boards: required,
			stock: listing.stock,
			sufficient_for_5_boards: listing.stock >= required,
			is_basic: listing.is_basic,
			is_preferred: listing.is_preferred,
			price_breaks: listing.price,
			checked_at_utc: checkedAt,
			source_url: searchUrl,
		};
	}),
);

parts.sort((a, b) =>
	a.designators[0].localeCompare(b.designators[0], undefined, {
		numeric: true,
	}),
);
const insufficient = parts.filter((part) => !part.sufficient_for_5_boards);
const audit = {
	board_quantity: boardQuantity,
	checked_at_utc: checkedAt,
	method:
		"Exact LCSC-code lookup against the public jlcsearch.tscircuit.com in-stock index. Inventory is a point-in-time signal and is not reserved.",
	selected_line_items: parts.length,
	components_per_board: parts.reduce(
		(sum, part) => sum + part.quantity_per_board,
		0,
	),
	all_selected_parts_sufficient: insufficient.length === 0,
	parts,
};

if (outputPath)
	writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
assert.equal(
	insufficient.length,
	0,
	insufficient
		.map((part) => `${part.lcsc} ${part.mpn}: stock ${part.stock}`)
		.join("\n"),
);
console.log(
	`PASS: ${parts.length} exact JLCPCB line items cover ${audit.components_per_board} fitted parts/board; all have stock for ${boardQuantity} boards (${checkedAt}).`,
);
