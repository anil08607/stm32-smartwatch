import "tscircuit";
import type { ChipProps } from "@tscircuit/props";
import { Fragment } from "react";

const max30102Pins = {
	pin1: ["NC1"],
	pin2: ["SCL"],
	pin3: ["SDA"],
	pin4: ["PGND"],
	pin5: ["NC5"],
	pin6: ["NC6"],
	pin7: ["NC7"],
	pin8: ["NC8"],
	pin9: ["VLED1"],
	pin10: ["VLED2"],
	pin11: ["VDD"],
	pin12: ["GND"],
	pin13: ["INT"],
	pin14: ["NC14"],
} as const;

export const MAX30102EFDT = (props: ChipProps<typeof max30102Pins>) => (
	<chip
		pinLabels={max30102Pins}
		manufacturerPartNumber="MAX30102EFD+T"
		supplierPartNumbers={{ jlcpcb: ["C6454833"] }}
		pinAttributes={{
			VDD: { requiresPower: true },
			VLED1: { requiresPower: true },
			VLED2: { requiresPower: true },
			GND: { requiresGround: true },
			PGND: { requiresGround: true },
		}}
		schWidth={1.6}
		schHeight={1.2}
		schPinArrangement={{
			leftSide: { direction: "top-to-bottom", pins: ["SCL", "SDA", "INT"] },
			rightSide: {
				direction: "top-to-bottom",
				pins: ["VLED1", "VLED2", "VDD"],
			},
			bottomSide: { direction: "left-to-right", pins: ["PGND", "GND"] },
		}}
		footprint={
			<footprint>
				{Array.from({ length: 7 }, (_, index) => (
					<Fragment key={`max-left-${index}`}>
						<smtpad
							portHints={[`pin${index + 1}`]}
							pcbX={-1.55}
							pcbY={2.4 - index * 0.8}
							width={0.65}
							height={0.35}
							shape="rect"
						/>
					</Fragment>
				))}
				{Array.from({ length: 7 }, (_, index) => (
					<Fragment key={`max-right-${index}`}>
						<smtpad
							portHints={[`pin${index + 8}`]}
							pcbX={1.55}
							pcbY={-2.4 + index * 0.8}
							width={0.65}
							height={0.35}
							shape="rect"
						/>
					</Fragment>
				))}
				<courtyardrect width={4.1} height={6.4} />
				<silkscreenrect pcbX={0} pcbY={0} width={3.5} height={5.8} />
				<silkscreencircle pcbX={-2} pcbY={2.45} radius={0.18} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C6454833.obj?uuid=36726d9fedca45ea8cb940092abc41dc",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C6454833.step?uuid=36726d9fedca45ea8cb940092abc41dc",
			pcbRotationOffset: 0,
			modelOriginPosition: { x: 0.0000127, y: -0.0001016, z: -0.31 },
		}}
		{...props}
	/>
);
