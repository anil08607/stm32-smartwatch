import "tscircuit";
import type { ChipProps } from "@tscircuit/props";
import { Fragment } from "react";

const stm32Pins = {
	pin1: ["VDD1"],
	pin2: ["PC14_OSC32_IN"],
	pin3: ["PC15_OSC32_OUT"],
	pin4: ["NRST"],
	pin5: ["VDDA_VREF"],
	pin6: ["PA0"],
	pin7: ["PA1"],
	pin8: ["PA2"],
	pin9: ["PA3"],
	pin10: ["PA4"],
	pin11: ["PA5"],
	pin12: ["PA6"],
	pin13: ["PA7"],
	pin14: ["PB0"],
	pin15: ["PB1"],
	pin16: ["VSS1"],
	pin17: ["VDD2"],
	pin18: ["PA8"],
	pin19: ["PA9"],
	pin20: ["PA10"],
	pin21: ["PA11"],
	pin22: ["PA12"],
	pin23: ["PA13_SWDIO"],
	pin24: ["PA14_SWCLK"],
	pin25: ["PA15"],
	pin26: ["PB3"],
	pin27: ["PB4"],
	pin28: ["PB5"],
	pin29: ["PB6"],
	pin30: ["PB7"],
	pin31: ["PH3_BOOT0"],
	pin32: ["VSS2"],
	pin33: ["VSS_EP"],
} as const;

const qfn32Footprint = (
	<footprint>
		{Array.from({ length: 8 }, (_, index) => (
			<Fragment key={`qfn-left-${index}`}>
				<smtpad
					portHints={[`pin${index + 1}`]}
					pcbX={-2.45}
					pcbY={1.75 - index * 0.5}
					width={0.9}
					height={0.28}
					shape="rect"
				/>
			</Fragment>
		))}
		{Array.from({ length: 8 }, (_, index) => (
			<Fragment key={`qfn-bottom-${index}`}>
				<smtpad
					portHints={[`pin${index + 9}`]}
					pcbX={-1.75 + index * 0.5}
					pcbY={-2.45}
					width={0.28}
					height={0.9}
					shape="rect"
				/>
			</Fragment>
		))}
		{Array.from({ length: 8 }, (_, index) => (
			<Fragment key={`qfn-right-${index}`}>
				<smtpad
					portHints={[`pin${index + 17}`]}
					pcbX={2.45}
					pcbY={-1.75 + index * 0.5}
					width={0.9}
					height={0.28}
					shape="rect"
				/>
			</Fragment>
		))}
		{Array.from({ length: 8 }, (_, index) => (
			<Fragment key={`qfn-top-${index}`}>
				<smtpad
					portHints={[`pin${index + 25}`]}
					pcbX={1.75 - index * 0.5}
					pcbY={2.45}
					width={0.28}
					height={0.9}
					shape="rect"
				/>
			</Fragment>
		))}
		<smtpad
			portHints={["pin33"]}
			pcbX={0}
			pcbY={0}
			width={3.45}
			height={3.45}
			shape="rect"
		/>
		<courtyardrect width={6.3} height={6.3} />
		<silkscreenrect pcbX={0} pcbY={0} width={5.2} height={5.2} />
		<silkscreencircle pcbX={-2.95} pcbY={2.25} radius={0.22} />
	</footprint>
);

export const STM32L432KCU6 = (props: ChipProps<typeof stm32Pins>) => (
	<chip
		pinLabels={stm32Pins}
		manufacturerPartNumber="STM32L432KCU6"
		supplierPartNumbers={{ jlcpcb: ["C1337280"] }}
		pinAttributes={{
			VDD1: { requiresPower: true },
			VDD2: { requiresPower: true },
			VDDA_VREF: { requiresPower: true },
			VSS1: { requiresGround: true },
			VSS2: { requiresGround: true },
			VSS_EP: { requiresGround: true },
		}}
		footprint={qfn32Footprint}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C1337280.obj?uuid=3d5b26a697094f4e9d801397c2dfddb7",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C1337280.step?uuid=3d5b26a697094f4e9d801397c2dfddb7",
			pcbRotationOffset: 0,
			modelOriginPosition: { x: 0.0040683, y: -0.0038332, z: 0 },
		}}
		schWidth={6}
		schHeight={11}
		schPinArrangement={{
			leftSide: {
				direction: "top-to-bottom",
				pins: [
					"PA0",
					"PA1",
					"PA2",
					"PA3",
					"PA4",
					"PA5",
					"PA6",
					"PA7",
					"PA13_SWDIO",
					"PA14_SWCLK",
					"NRST",
					"PH3_BOOT0",
				],
			},
			rightSide: {
				direction: "top-to-bottom",
				pins: [
					"PA8",
					"PA9",
					"PA10",
					"PA11",
					"PA12",
					"PA15",
					"PB0",
					"PB1",
					"PB3",
					"PB4",
					"PB5",
					"PB6",
					"PB7",
					"PC14_OSC32_IN",
					"PC15_OSC32_OUT",
				],
			},
			topSide: {
				direction: "left-to-right",
				pins: ["VDD1", "VDD2", "VDDA_VREF"],
			},
			bottomSide: {
				direction: "left-to-right",
				pins: ["VSS1", "VSS2", "VSS_EP"],
			},
		}}
		{...props}
	/>
);
