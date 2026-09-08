import type {
	AutorouterCompleteEvent,
	GenericLocalAutorouter,
	SimpleRouteJson,
	SimplifiedPcbTrace,
} from "@tscircuit/core";
import saved from "./routed-board.json";

// Match the complete routing input, including pads, nets, outline and rules.
// Two FNV-1a passes detect a stale saved route without Node APIs.
export function routingFingerprint(input: SimpleRouteJson): string {
	const hash = (value: string) => {
		let result = 2166136261;
		for (let i = 0; i < value.length; i++) {
			result ^= value.charCodeAt(i);
			result = Math.imul(result, 16777619);
		}
		return (result >>> 0).toString(16).padStart(8, "0");
	};
	const serialized = JSON.stringify(input);
	return hash(serialized) + hash(`${serialized}${hash(serialized)}`);
}

/** Replay the reviewed copper geometry; never reuse it after an input change. */
export function createSavedAutorouter(
	input: SimpleRouteJson,
): GenericLocalAutorouter {
	const fingerprint = routingFingerprint(input);
	if (fingerprint !== saved.inputFingerprint) {
		throw new Error(
			`Saved PCB routing is stale (${fingerprint}). Regenerate and review routing; see routing/README.md.`,
		);
	}
	const traces = () => structuredClone(saved.traces) as SimplifiedPcbTrace[];
	let complete: ((event: AutorouterCompleteEvent) => void) | undefined;
	return {
		input,
		isRouting: false,
		on(event, callback) {
			if (event === "complete")
				complete = callback as (event: AutorouterCompleteEvent) => void;
		},
		start() {
			this.isRouting = true;
			complete?.({ type: "complete", traces: traces() });
			this.isRouting = false;
		},
		stop() {
			this.isRouting = false;
		},
		solveSync: traces,
	};
}
