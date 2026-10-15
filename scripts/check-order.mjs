import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const stock = JSON.parse(readFileSync("sourcing/stock.json")),
	qualification = JSON.parse(readFileSync("release/qualification.json")),
	sha = createHash("sha256")
		.update(readFileSync("routing/source.circuit.json"))
		.digest("hex"),
	holds = [];
for (const script of [
	"check-bindings.mjs",
	"check-evidence.mjs",
	"check-assembly.mjs",
]) {
	const result = spawnSync("bun", [`scripts/${script}`], { encoding: "utf8" });
	if (result.status !== 0)
		holds.push(
			`${script}: current integrity check failed: ${(result.stderr || result.stdout).slice(-600)}`,
		);
}
if (stock.parts.length !== 40)
	holds.push("Inventory evidence does not contain all 40 SMT lines");
if (stock.circuit_sha256 !== sha)
	holds.push("Stock evidence belongs to a different source circuit");
if (Date.now() - Date.parse(stock.checked_at) > 24 * 3600000)
	holds.push("Stock evidence is older than 24 hours");
for (const p of stock.parts)
	if (p.status !== "available") holds.push(`${p.code}: ${p.status}`);
for (const q of qualification.gates)
	if (q.status !== "passed" || !q.evidence) holds.push(q.description);
const report = {
	status: holds.length
		? "REVIEW_ONLY_NOT_ORDER_APPROVED"
		: "READY_FOR_ORDER_REVIEW",
	checked_at: new Date().toISOString(),
	source_sha256: sha,
	stock_reserved: false,
	holds,
};
writeFileSync("release/readiness.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (holds.length) process.exitCode = 1;
