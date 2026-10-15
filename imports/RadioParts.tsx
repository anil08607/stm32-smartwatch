import { Fragment } from "react";
import type { ChipProps, CrystalProps } from "@tscircuit/props";
const hf = {
	pin1: ["XTAL1"],
	pin2: ["GND1"],
	pin3: ["XTAL2"],
	pin4: ["GND2"],
} as const;
export const Crystal32MHz = (
	props: Omit<CrystalProps, "frequency" | "loadCapacitance">,
) => (
	<crystal
		frequency="32MHz"
		loadCapacitance="8pF"
		pinVariant="four_pin"
		manufacturerPartNumber="X201632MKB4SI"
		supplierPartNumbers={{ jlcpcb: ["C718072"] }}
		footprint={
			<footprint>
				{[
					[-0.7, -0.55],
					[0.7, -0.55],
					[0.7, 0.55],
					[-0.7, 0.55],
				].map(([x, y], i) => (
					<Fragment key={i}>
						<smtpad
							portHints={[`pin${i + 1}`]}
							shape="rect"
							pcbX={x}
							pcbY={y}
							width={0.9}
							height={0.8}
						/>
					</Fragment>
				))}
				<courtyardrect width={2.8} height={2.3} />
			</footprint>
		}
		{...props}
	/>
);
const lf = { pin1: ["OSC1"], pin2: ["OSC2"] } as const;
export const Crystal32768 = (
	props: Omit<CrystalProps, "frequency" | "loadCapacitance">,
) => (
	<crystal
		frequency="32.768kHz"
		loadCapacitance="9pF"
		manufacturerPartNumber="ABS07-32.768KHZ-9-T"
		supplierPartNumbers={{ jlcpcb: ["C179635"] }}
		footprint={
			<footprint>
				<smtpad
					portHints={["pin1"]}
					pcbX={-1.25}
					pcbY={0}
					width={1.2}
					height={1.8}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={1.25}
					pcbY={0}
					width={1.2}
					height={1.8}
					shape="rect"
				/>
				<courtyardrect width={4.2} height={2.3} />
			</footprint>
		}
		{...props}
	/>
);
const ant = { pin1: ["FEED"], pin2: ["NC"] } as const;
export const ChipAntenna = (props: ChipProps<typeof ant>) => (
	<chip
		pinLabels={ant}
		manufacturerPartNumber="RFANT3216120A5T"
		supplierPartNumbers={{ jlcpcb: ["C127629"] }}
		footprint={
			<footprint>
				<smtpad
					portHints={["pin1"]}
					pcbX={-1.55005}
					pcbY={0}
					width={0.8}
					height={1.66}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={1.55005}
					pcbY={0}
					width={0.8}
					height={1.66}
					shape="rect"
				/>
				<courtyardrect width={4.5} height={2.2} />
			</footprint>
		}
		{...props}
	/>
);
