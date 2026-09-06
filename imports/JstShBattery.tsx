import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

const jstPins = {
	pin1: ["BAT_POS"],
	pin2: ["BAT_NEG"],
} as const;

export const JstShBattery = (props: ChipProps<typeof jstPins>) => (
	<connector
		pinLabels={jstPins}
		manufacturerPartNumber="SM02B-SRSS-TB(LF)(SN)"
		supplierPartNumbers={{ jlcpcb: ["C160402"] }}
		pinAttributes={{ BAT_POS: { providesPower: true } }}
		footprint={
			<footprint>
				<smtpad
					portHints={["pin1"]}
					pcbX={-0.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={0.5}
					pcbY={-2}
					width={0.6}
					height={1.55}
					shape="rect"
				/>
				<smtpad
					pcbX={-1.8}
					pcbY={1.875}
					width={1.2}
					height={1.8}
					shape="rect"
				/>
				<smtpad pcbX={1.8} pcbY={1.875} width={1.2} height={1.8} shape="rect" />
				<courtyardrect width={5.3} height={6.05} />
				<silkscreenrect pcbX={0} pcbY={0} width={4.5} height={4.25} />
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C160402.obj?uuid=b15083895b61401296a20b79cbc50a55",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C160402.step?uuid=b15083895b61401296a20b79cbc50a55",
			// The EasyEDA model's cable-entry side is opposite its footprint axes.
			pcbRotationOffset: 180,
			modelOriginPosition: { x: 0.5, y: 0.5135125, z: -0.01 },
		}}
		schWidth={1.2}
		schHeight={0.6}
		{...props}
	/>
);
