import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
if (!process.env.FREEROUTING_JAR)
	throw Error(
		"Set FREEROUTING_JAR to the official Freerouting 2.5.0 JAR; Java 25 is the reviewed runtime.",
	);
mkdirSync("build", { recursive: true });
const result = spawnSync(
	process.env.JAVA_BIN ?? "java",
	[
		"-Xmx2g",
		"-jar",
		process.env.FREEROUTING_JAR,
		"--gui.enabled=false",
		"-da",
		"--user_data_path=build/freerouting-state",
		"-de",
		"routing/native/input.dsn",
		"-do",
		"build/routed.ses",
		"--router.autorouter.max_passes=50",
		"--router.job_timeout=00:04:00",
		"--router.fanout.enabled=false",
		"--router.optimizer.enabled=false",
	],
	{ stdio: "inherit" },
);
process.exit(result.status ?? 1);
