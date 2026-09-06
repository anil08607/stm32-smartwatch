import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

const pinLabels = {
	pin1: ["EN"],
	pin2: ["MODE"],
	pin3: ["AGND"],
	pin4: ["FB"],
	pin5: ["PG"],
	pin6: ["VOUT"],
	pin7: ["L2"],
	pin8: ["GND"],
	pin9: ["L1"],
	pin10: ["VIN"],
} as const;

/** TPS63802 2 A buck-boost converter in the DLA/VSON-10 package. */
export const TPS63802DLAR = (props: ChipProps<typeof pinLabels>) => (
	<chip
		pinLabels={pinLabels}
		manufacturerPartNumber="TPS63802DLAR"
		supplierPartNumbers={{ jlcpcb: ["C2845237"] }}
		pinAttributes={{
			VIN: { requiresPower: true },
			VOUT: { providesPower: true },
			GND: { requiresGround: true },
			AGND: { requiresGround: true },
		}}
		footprint={
			<footprint>
				<smtpad
					portHints={["pin1"]}
					pcbX={-0.9}
					pcbY={1}
					width={0.6}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={-0.9}
					pcbY={0.5}
					width={0.6}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin3"]}
					pcbX={-0.9}
					pcbY={0}
					width={0.6}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin4"]}
					pcbX={-0.9}
					pcbY={-0.5}
					width={0.6}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin5"]}
					pcbX={-0.9}
					pcbY={-1}
					width={0.6}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin6"]}
					pcbX={0.75}
					pcbY={-1}
					width={0.9}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin7"]}
					pcbX={0.75}
					pcbY={-0.5}
					width={0.9}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin8"]}
					pcbX={0.55}
					pcbY={0}
					width={1.3}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin9"]}
					pcbX={0.75}
					pcbY={0.5}
					width={0.9}
					height={0.3}
					shape="rect"
				/>
				<smtpad
					portHints={["pin10"]}
					pcbX={0.75}
					pcbY={1}
					width={0.9}
					height={0.3}
					shape="rect"
				/>
				<courtyardrect pcbX={-0.15} pcbY={0.061} width={3.2} height={3.65} />
				<silkscreenrect pcbX={-0.15} pcbY={0} width={2.2} height={3.05} />
				<silkscreencircle pcbX={-1.4} pcbY={1.5} radius={0.12} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C2845237.obj?uuid=aaec7da25c23451ca65c9907eea57d42",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C2845237.step?uuid=aaec7da25c23451ca65c9907eea57d42",
			pcbRotationOffset: 0,
			modelOriginPosition: { x: 0.07497445, y: 0, z: -0.95 },
		}}
		schWidth={2.2}
		schHeight={1.8}
		{...props}
	/>
);
