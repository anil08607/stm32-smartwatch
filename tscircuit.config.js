import process from "node:process";

// Apply the same placement-only mode to dev and snapshots as to the default
// build. The runtime loader also reads this module during --ignore-config,
// so build:routed explicitly opts into routing using this environment flag.
export default {
	platformConfig: {
		routingDisabled: process.env.SMARTWATCH_ROUTED !== "1",
	},
};
