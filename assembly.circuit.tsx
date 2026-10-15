import "tscircuit";
import { assembly } from "@tscircuit/core";
import ReviewedBoard from "./index.circuit";
import model from "./mechanical/assembly-model.json";
/** Full provisional assembly. Mechanical files use PCB-top Z=0 mm. */
export default () => (
	<assembly.device name="Anil_nRF52810_Smartwatch">
		<ReviewedBoard />
		<assembly.subassembly
			name="External_product_assembly"
			cadModel={{
				glbUrl: model.external,
				modelUnitToMmScale: 1,
				positionOffset: { x: 0, y: 0, z: 0.5 },
			}}
		/>
	</assembly.device>
);
