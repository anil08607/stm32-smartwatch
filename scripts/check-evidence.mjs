import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex"),
	n = JSON.parse(readFileSync("docs/checks/native-summary.json")),
	g = JSON.parse(readFileSync("docs/checks/native-geometry.json"));
for (const [key, file] of Object.entries({
	board_sha256: "hardware/smartwatch-nrf52810.kicad_pcb",
	project_sha256: "hardware/smartwatch-nrf52810.kicad_pro",
	drc_sha256: "docs/checks/native-drc.json",
	erc_sha256: "docs/checks/native-erc.json",
	netlist_sha256: "hardware/electrical-netlist.xml",
}))
	assert.equal(n[key], sha(file), `${file}: native evidence is stale`);
assert.equal(g.board_sha256, n.board_sha256);
assert.equal(n.drc_violations + n.unconnected + n.erc_violations, 0);
assert.equal(g.errors.length + g.rf_reference_corridor_candidates.length, 0);
const q = JSON.parse(readFileSync("release/qualification.json")),
	r = JSON.parse(readFileSync("release/readiness.json"));
if (q.gates.some((x) => x.status !== "passed"))
	assert.equal(r.status, "REVIEW_ONLY_NOT_ORDER_APPROVED");
console.log(
	"PASS: zero-diagnostic native evidence matches this board; pending qualification remains explicitly blocked.",
);
