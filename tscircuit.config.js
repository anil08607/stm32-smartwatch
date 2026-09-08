import process from "node:process";

// Enable routing for builds, dev previews, and snapshots by default.
// Set SMARTWATCH_ROUTED=0 for placement-only previews and checks.
export default {
	platformConfig: {
		routingDisabled: process.env.SMARTWATCH_ROUTED === "0",
	},
};
