import { Fragment } from "react";
import type { ChipProps } from "@tscircuit/props";
// Nordic nRF52810 product specification, QFAA top-view pin numbering.
const pins = {
	pin1: ["DEC1"],
	pin2: ["XL1"],
	pin3: ["XL2"],
	pin4: ["P0_02"],
	pin5: ["P0_03"],
	pin6: ["P0_04"],
	pin7: ["P0_05"],
	pin8: ["P0_06"],
	pin9: ["P0_07"],
	pin10: ["P0_08"],
	pin11: ["P0_09"],
	pin12: ["P0_10"],
	pin13: ["VDD1"],
	pin14: ["P0_11"],
	pin15: ["P0_12"],
	pin16: ["P0_13"],
	pin17: ["P0_14"],
	pin18: ["P0_15"],
	pin19: ["P0_16"],
	pin20: ["P0_17"],
	pin21: ["P0_18"],
	pin22: ["P0_19"],
	pin23: ["P0_20"],
	pin24: ["nRESET"],
	pin25: ["SWDCLK"],
	pin26: ["SWDIO"],
	pin27: ["P0_22"],
	pin28: ["P0_23"],
	pin29: ["P0_24"],
	pin30: ["ANT"],
	pin31: ["VSS2"],
	pin32: ["DEC2"],
	pin33: ["DEC3"],
	pin34: ["XC1"],
	pin35: ["XC2"],
	pin36: ["VDD3"],
	pin37: ["P0_25"],
	pin38: ["P0_26"],
	pin39: ["P0_27"],
	pin40: ["P0_28"],
	pin41: ["P0_29"],
	pin42: ["P0_30"],
	pin43: ["P0_31"],
	pin44: ["NC"],
	pin45: ["VSS1"],
	pin46: ["DEC4"],
	pin47: ["DCC"],
	pin48: ["VDD2"],
	pin49: ["EP"],
} as const;
export const NRF52810 = (props: ChipProps<typeof pins>) => (
	<chip
		pinLabels={pins}
		pinAttributes={{
			VDD1: { requiresPower: true },
			VDD2: { requiresPower: true },
			VDD3: { requiresPower: true },
			VSS1: { requiresGround: true },
			VSS2: { requiresGround: true },
			EP: { requiresGround: true },
		}}
		manufacturerPartNumber="NRF52810-QFAA-R"
		supplierPartNumbers={{ jlcpcb: ["C141828"] }}
		schWidth={5}
		schHeight={10.5}
		footprint={
			<footprint>
				{Array.from({ length: 48 }, (_, i) => {
					const side = Math.floor(i / 12);
					const t = -2.2 + (i % 12) * 0.4;
					return (
						<Fragment key={i}>
							<smtpad
								portHints={[`pin${i + 1}`]}
								shape="rect"
								pcbX={side === 0 ? -3 : side === 1 ? t : side === 2 ? 3 : -t}
								pcbY={side === 0 ? -t : side === 1 ? -3 : side === 2 ? t : 3}
								width={side % 2 === 0 ? 0.95 : 0.2}
								height={side % 2 === 0 ? 0.2 : 0.95}
							/>
						</Fragment>
					);
				})}
				<smtpad
					portHints={["pin49"]}
					shape="rect"
					pcbX={0}
					pcbY={0}
					width={4.6}
					height={4.6}
				/>
				<courtyardrect width={7.4} height={7.4} />
				<silkscreencircle pcbX={-3.7} pcbY={3.7} radius={0.18} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C141828.obj?uuid=46b18d34784345cd8b1ca45b59e906cb",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C141828.step?uuid=46b18d34784345cd8b1ca45b59e906cb",
			pcbRotationOffset: 270,
		}}
		{...props}
	/>
);
