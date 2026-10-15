import "tscircuit";
import { assembly } from "@tscircuit/core";
import ReviewedBoard from "./pcb.circuit";
import models from "./mechanical/assembly-model.json";

/** Dimensioned product stack. The PCB top datum is +0.5 mm in the circuit viewer. */
export default function Assembly({
	exploded = false,
}: {
	exploded?: boolean;
} = {}) {
	return (
		<assembly.device name="Anil_nRF52810_Smartwatch">
			<ReviewedBoard />
			{models.parts.map((part) => (
				<assembly.subassembly
					key={part.id}
					name={part.id}
					cadModel={{
						glbUrl: part.glb,
						modelUnitToMmScale: 1,
						modelOriginPosition: { x: 0, y: 0, z: 0 },
						positionOffset: {
							x: 0,
							y: 0,
							z: 0.5 + (exploded ? part.explode : 0),
						},
					}}
				/>
			))}
		</assembly.device>
	);
}
