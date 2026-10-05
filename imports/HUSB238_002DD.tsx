import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

const pinLabels = {
	pin1: ["VIN"],
	pin2: ["D_POS"],
	pin3: ["D_NEG"],
	pin4: ["CC1"],
	pin5: ["CC2"],
	pin6: ["SDA"],
	pin7: ["SCL"],
	pin8: ["VSET"],
	pin9: ["ISET"],
	pin10: ["GATE"],
	pin11: ["GND"],
} as const;

const pinAttributes = {
	pin1: {
		requiresPower: true,
		shouldHaveDecouplingCapacitor: true,
		recommendedDecouplingCapacitorCapacitance: "1uF",
	},
	pin11: { requiresGround: true },
} as const;

const footprinterPinLabels = {
	...pinLabels,
	pin11: [...pinLabels.pin11, "thermalpad"],
} as const;

export const HUSB238_002DD = (props: ChipProps<typeof pinLabels>) => {
	return (
		<chip
			pinLabels={footprinterPinLabels}
			pinAttributes={pinAttributes}
			supplierPartNumbers={{ jlcpcb: ["C7471904"] }}
			manufacturerPartNumber="HUSB238_002DD"
			footprint="dfn10_thermalpad1.5mmx2.5mm_p0.5mm_w3.47mm_pw0.28mm_pl0.66mm_pin1location(leftside,bottom)"
			schWidth={2.8}
			schHeight={3.8}
			schPinArrangement={{
				leftSide: {
					direction: "top-to-bottom",
					pins: ["VIN", "CC1", "CC2", "D_POS", "D_NEG"],
				},
				rightSide: {
					direction: "top-to-bottom",
					pins: ["GATE", "SDA", "SCL", "VSET", "ISET"],
				},
				bottomSide: { direction: "left-to-right", pins: ["GND"] },
			}}
			cadModel={{
				objUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C7471904.obj?uuid=dec90456a97c451493923495c43c6de5",
				stepUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C7471904.step?uuid=dec90456a97c451493923495c43c6de5",
				pcbRotationOffset: 0,
				modelOriginPosition: { x: 0, y: 0, z: -0.02 },
			}}
			{...props}
		/>
	);
};
