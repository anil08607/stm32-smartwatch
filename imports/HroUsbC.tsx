import "tscircuit";
import type { ChipProps } from "@tscircuit/props";
import { Fragment } from "react";

const usbCPins = {
	pin1: ["GND_A"],
	pin2: ["VBUS_A"],
	pin3: ["SBU2"],
	pin4: ["CC1"],
	pin5: ["DN_A"],
	pin6: ["DP_A"],
	pin7: ["DN_B"],
	pin8: ["DP_B"],
	pin9: ["CC2"],
	pin10: ["SBU1"],
	pin11: ["VBUS_B"],
	pin12: ["GND_B"],
	pin13: ["SHELL1"],
	pin14: ["SHELL2"],
	pin15: ["SHELL3"],
	pin16: ["SHELL4"],
} as const;

export const HroUsbC = (props: ChipProps<typeof usbCPins>) => (
	<connector
		pinLabels={usbCPins}
		standard="usb_c"
		manufacturerPartNumber="TYPE-C-31-M-12"
		supplierPartNumbers={{ jlcpcb: ["C165948"] }}
		pinAttributes={{
			VBUS_A: { providesPower: true },
			VBUS_B: { providesPower: true },
		}}
		schWidth={2.4}
		schHeight={2.2}
		schPinArrangement={{
			leftSide: {
				direction: "top-to-bottom",
				pins: ["VBUS_A", "VBUS_B", "GND_A", "GND_B"],
			},
			rightSide: {
				direction: "top-to-bottom",
				pins: ["CC1", "CC2", "DP_A", "DP_B", "DN_A", "DN_B", "SBU1", "SBU2"],
			},
			bottomSide: {
				direction: "left-to-right",
				pins: ["SHELL1", "SHELL2", "SHELL3", "SHELL4"],
			},
		}}
		footprint={
			<footprint>
				{[-3.2, -2.4].map((x, index) => (
					<Fragment key={`usb-wide-left-${index}`}>
						<smtpad
							portHints={[`pin${index + 1}`]}
							pcbX={x}
							pcbY={3.545}
							width={0.575}
							height={1.15}
							shape="rect"
						/>
					</Fragment>
				))}
				{[-1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75].map(
					(x, index) => (
						<Fragment key={`usb-signal-${index}`}>
							<smtpad
								portHints={[`pin${index + 3}`]}
								pcbX={x}
								pcbY={3.545}
								width={0.275}
								height={1.15}
								shape="rect"
							/>
						</Fragment>
					),
				)}
				{[2.4, 3.2].map((x, index) => (
					<Fragment key={`usb-wide-right-${index}`}>
						<smtpad
							portHints={[`pin${index + 11}`]}
							pcbX={x}
							pcbY={3.545}
							width={0.575}
							height={1.15}
							shape="rect"
						/>
					</Fragment>
				))}
				{[-4.32, 4.32]
					.flatMap((x) => [-1.21, 2.97].map((y) => ({ x, y })))
					.map(({ x, y }, index) => (
						<Fragment key={`usb-shell-${index}`}>
							<platedhole
								portHints={[`pin${index + 13}`]}
								pcbX={x}
								pcbY={y}
								shape="pill"
								outerWidth={1}
								outerHeight={1.6}
								holeWidth={0.6}
								holeHeight={1.2}
							/>
						</Fragment>
					))}
				<hole pcbX={-2.89} pcbY={2.47} diameter={0.65} />
				<hole pcbX={2.89} pcbY={2.47} diameter={0.65} />
				<courtyardrect pcbY={-0.135} width={9.94} height={7.85} />
				<silkscreenrect pcbX={0} pcbY={-0.135} width={8.94} height={7.35} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.obj?uuid=617b05f9bba7410b96c001093d8189e4",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.step?uuid=617b05f9bba7410b96c001093d8189e4",
			pcbRotationOffset: 180,
			modelOriginPosition: { x: 0, y: -2.2500289, z: 0.000011 },
		}}
		{...props}
	/>
);
