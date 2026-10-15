import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import {
	analyzeSchematicPlacement,
	createSchematicPlacementIssueArtifacts,
} from "../checks/vendor/schematic-placement.mjs";
const file = process.argv[2] ?? "routing/reviewed.circuit.json";
const bytes = readFileSync(file),
	circuit = JSON.parse(bytes);
const analysis = analyzeSchematicPlacement(circuit);
const issues = createSchematicPlacementIssueArtifacts(circuit, {
	analysis,
}).map((x) => ({
	type: x.issue.lineItemType,
	message: x.issue.message,
	sheet: x.schematicSheetId,
	description: x.descriptionXml,
}));
const report = {
	circuit_sha256: createHash("sha256").update(bytes).digest("hex"),
	count: issues.length,
	counts: analysis.getIssueCounts(),
	issues,
};
mkdirSync("docs/checks", { recursive: true });
writeFileSync(
	"docs/checks/schematic-style.json",
	JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({ count: report.count, counts: report.counts }));
if (issues.length) process.exitCode = 1;
