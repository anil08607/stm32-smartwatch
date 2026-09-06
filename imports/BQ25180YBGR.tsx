import "tscircuit";
import type { ChipProps } from "@tscircuit/props";
import { Fragment } from "react";

const bq25180Pins = {
	pin1: ["INT", "A1"],
	pin2: ["IN", "A2"],
	pin3: ["SCL", "B1"],
	pin4: ["SYS", "B2"],
	pin5: ["SDA", "C1"],
	pin6: ["BAT", "C2"],
	pin7: ["TS_MR", "D1"],
	pin8: ["GND", "D2"],
} as const;

export const BQ25180YBGR = (props: ChipProps<typeof bq25180Pins>) => (
	<chip
		pinLabels={bq25180Pins}
		manufacturerPartNumber="BQ25180YBGR"
		supplierPartNumbers={{ jlcpcb: ["C3682423"] }}
		pinAttributes={{
			IN: {
				requiresPower: true,
				shouldHaveDecouplingCapacitor: true,
				recommendedDecouplingCapacitorCapacitance: "1uF",
			},
			BAT: {
				requiresPower: true,
				shouldHaveDecouplingCapacitor: true,
				recommendedDecouplingCapacitorCapacitance: "1uF",
			},
			SYS: { providesPower: true },
			GND: { requiresGround: true },
		}}
		schWidth={1.8}
		schHeight={1.4}
		schPinArrangement={{
			leftSide: { direction: "top-to-bottom", pins: ["IN", "SCL", "SDA"] },
			rightSide: {
				direction: "top-to-bottom",
				pins: ["SYS", "BAT", "INT", "TS_MR"],
			},
			bottomSide: { direction: "left-to-right", pins: ["GND"] },
		}}
		footprint={
			<footprint>
				{Array.from({ length: 4 }, (_, row) => (
					<Fragment key={`bq-left-${row}`}>
						<smtpad
							portHints={[`pin${row * 2 + 1}`]}
							pcbX={-0.2}
							pcbY={0.6 - row * 0.4}
							radius={0.12}
							shape="circle"
						/>
					</Fragment>
				))}
				{Array.from({ length: 4 }, (_, row) => (
					<Fragment key={`bq-right-${row}`}>
						<smtpad
							portHints={[`pin${row * 2 + 2}`]}
							pcbX={0.2}
							pcbY={0.6 - row * 0.4}
							radius={0.12}
							shape="circle"
						/>
					</Fragment>
				))}
				<courtyardrect width={1.6} height={2.1} />
				<silkscreenrect pcbX={0} pcbY={0} width={1.1} height={1.6} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C3682423.obj?uuid=1b13503f4dad45918962968876248c9b",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C3682423.step?uuid=1b13503f4dad45918962968876248c9b",
			pcbRotationOffset: 0,
			modelOriginPosition: { x: -0.0000762, y: -0.0000508, z: -0.48 },
		}}
		{...props}
	/>
);
