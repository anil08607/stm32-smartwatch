import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const bytes = readFileSync("routing/source.circuit.json"),
	c = JSON.parse(bytes),
	pcb = new Map(
		c
			.filter((x) => x.type === "pcb_component")
			.map((x) => [x.source_component_id, x]),
	);
const groups = new Map();
for (const p of c.filter(
	(x) =>
		x.type === "source_component" &&
		!pcb.get(x.source_component_id)?.do_not_place,
)) {
	const code = p.supplier_part_numbers?.jlcpcb?.[0];
	if (!code) throw Error(`${p.name}: no supplier code`);
	const g = groups.get(code) ?? {
		code,
		mpn: p.manufacturer_part_number,
		designators: [],
	};
	g.designators.push(p.name);
	groups.set(code, g);
}
const normalize = (s) =>
	String(s)
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "");
const pending = [...groups.values()],
	parts = [];
async function request(url) {
	let last;
	for (let n = 0; n < 3; n++) {
		try {
			const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
			if (!r.ok) throw Error(`HTTP ${r.status}`);
			return await r.json();
		} catch (e) {
			last = e;
		}
	}
	throw last;
}
async function worker() {
	while (pending.length) {
		const g = pending.shift();
		const required =
			g.designators.length * 5 +
			Math.max(5, Math.ceil(g.designators.length * 5 * 0.2));
		const url = `https://jlcpcb.com/api/overseas-pcb-order/v1/smtComponentShopCart/getComponentDetail?componentCode=${g.code}`;
		try {
			const j = await request(url);
			const p = j.code === 200 ? j.data : null;
			if (p?.componentCode !== g.code)
				throw Error("exact supplier code not returned");
			const identity_match = normalize(p.componentModelEn) === normalize(g.mpn);
			const counts = [p.overseasStockCount, p.canPresaleNumber];
			const stock = counts.every((n) => typeof n === "number" && n >= 0)
				? Math.min(...counts)
				: null;
			parts.push({
				...g,
				required_for_five_with_attrition: required,
				supplier_mpn: p.componentModelEn,
				package: p.componentSpecificationEn,
				warehouse_stock: p.overseasStockCount,
				available_order_quantity: p.canPresaleNumber,
				stock,
				identity_match,
				can_purchase: p.isBuyComponent === "1",
				status: !identity_match
					? "identity_mismatch"
					: stock === null
						? "unknown"
						: stock < required || p.isBuyComponent !== "1"
							? "insufficient"
							: "available",
				url,
			});
		} catch (e) {
			parts.push({
				...g,
				required_for_five_with_attrition: required,
				stock: null,
				status: "unknown",
				error: String(e.message),
				url,
			});
		}
	}
}
await Promise.all(Array.from({ length: 3 }, worker));
parts.sort((a, b) => a.code.localeCompare(b.code));
const report = {
	checked_at: new Date().toISOString(),
	circuit_sha256: createHash("sha256").update(bytes).digest("hex"),
	quantity: 5,
	inventory_reserved: false,
	method:
		"Exact public JLCPCB catalog identity; conservative minimum of warehouse and available-order quantity. Package and orientation still require assembly review.",
	parts,
};
writeFileSync("sourcing/stock.json", JSON.stringify(report, null, 2) + "\n");
const failed = parts.filter((x) => x.status !== "available");
console.log(
	`${parts.length - failed.length}/${parts.length} exact SMT lines available for five boards plus attrition`,
);
for (const p of failed)
	console.log(
		`${p.code} ${p.mpn}: ${p.status}, stock=${p.stock}, supplier=${p.supplier_mpn ?? "unknown"}`,
	);
if (failed.length) process.exitCode = 1;
