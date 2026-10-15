import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const manifest = JSON.parse(readFileSync("routing/binding.json"));
for (const [file, expected] of Object.entries(manifest.files)) {
	const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
	assert.equal(
		actual,
		expected,
		`${file}: changed since native review; reroute/recheck and reseal the review`,
	);
}
console.log(
	`PASS: ${Object.keys(manifest.files).length} source, native and tooling files match reviewed hashes.`,
);
