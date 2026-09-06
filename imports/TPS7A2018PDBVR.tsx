import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

const pinLabels = {
	pin1: "VIN",
	pin2: "GND",
	pin3: "VEN",
	pin4: "NC",
	pin5: "VOUT",
} as const;

/** TPS7A20 fixed 1.8 V regulator in the 5-pin SOT-23 package. */
export const TPS7A2018PDBVR = (props: ChipProps<typeof pinLabels>) => (
	<chip
		manufacturerPartNumber="TPS7A2018PDBVR"
		supplierPartNumbers={{ jlcpcb: ["C963430"] }}
		footprint="sot25_w2.3mm_pw0.53mm_pl1.05mm_pin1location(leftside,bottom)"
		schWidth={1.5}
		schHeight={0.9}
		pinLabels={pinLabels}
		pinAttributes={{
			VIN: { requiresPower: true },
			VOUT: { providesPower: true },
			GND: { requiresGround: true },
		}}
		schPinArrangement={{
			leftSide: { direction: "top-to-bottom", pins: [1, 3] },
			rightSide: { direction: "top-to-bottom", pins: [5] },
			bottomSide: { direction: "left-to-right", pins: [2] },
		}}
		noConnect={["pin4"]}
		{...props}
	/>
);

export default TPS7A2018PDBVR;
