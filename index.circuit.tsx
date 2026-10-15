import "tscircuit";
import { cloneElement } from "react";
import { SMARTWATCH_V1_NRF52810 } from "./SMARTWATCH_V1_NRF52810.circuit";
import { installNativeRouting } from "./routing/native-viewer";

/** Render the real components, then replay the reviewed native routing phase. */
export default () =>
	cloneElement(SMARTWATCH_V1_NRF52810(), {
		ref: installNativeRouting,
		autorouter: { local: true, groupMode: "subcircuit" },
	});
