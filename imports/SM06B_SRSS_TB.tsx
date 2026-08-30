import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

/**
 * Six-way JST SH programming connector.
 *
 * The pin order is intentionally documented here because this is a custom
 * SWD cable pinout, not the ARM 10-pin Cortex-Debug assignment.
 */
const programmingPins = {
	pin1: ["VREF", "V3V3"],
	pin2: ["SWDIO"],
	pin3: ["GND"],
	pin4: ["SWCLK"],
	pin5: ["NRST"],
	pin6: ["BOOT0"],
} as const;

export const SM06B_SRSS_TB = (props: ChipProps<typeof programmingPins>) => (
	<connector
		pinLabels={programmingPins}
		standard="jst_sh"
		pinCount={6}
		manufacturerPartNumber="SM06B-SRSS-TB(LF)(SN)"
		supplierPartNumbers={{ jlcpcb: ["C160405"] }}
		footprint={
			<footprint>
				<smtpad
					portHints={["pin1"]}
					pcbX={-2.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={-1.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin3"]}
					pcbX={-0.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin4"]}
					pcbX={0.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin5"]}
					pcbX={1.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin6"]}
					pcbX={2.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					pcbX={-3.8}
					pcbY={1.875}
					width={1.2}
					height={1.8}
					shape="rect"
				/>
				<smtpad pcbX={3.8} pcbY={1.875} width={1.2} height={1.8} shape="rect" />
				<courtyardrect width={9.3} height={6.05} />
				<silkscreenrect pcbX={0} pcbY={0.45} width={8.2} height={4.25} />
				<silkscreentext text="1" pcbX={-3.15} pcbY={-2.9} fontSize={0.6} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C160405.obj?uuid=e3c5d11fe8d04984a00e78e2fbfebf8b",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C160405.step?uuid=e3c5d11fe8d04984a00e78e2fbfebf8b",
			// The EasyEDA model's cable-entry side is opposite its footprint axes.
			pcbRotationOffset: 180,
			modelOriginPosition: { x: 2.4999238, y: 0.3445009, z: -0.01 },
		}}
		schWidth={5}
		schHeight={4}
		{...props}
	/>
);
