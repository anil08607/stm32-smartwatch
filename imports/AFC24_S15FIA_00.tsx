import type { ChipProps } from "@tscircuit/props";

/**
 * JUSHUO AFC24-S15FIA-00, 15-contact 0.5 mm dual-contact FPC connector.
 *
 * Pads and courtyard are the exact EasyEDA/JLCPCB C6709462 footprint imported
 * with `tsci import C6709462 --jlcpcb --use-exact-footprint`. Pins 16 and 17
 * are the non-electrical shell/hold-down pads.
 */
const pinLabels = {
	pin1: ["GND1"],
	pin2: ["LEDK"],
	pin3: ["LEDA"],
	pin4: ["VDD"],
	pin5: ["RS"],
	pin6: ["CS"],
	pin7: ["SCL"],
	pin8: ["SDA"],
	pin9: ["RESET"],
	pin10: ["CTP_VDD"],
	pin11: ["GND2"],
	pin12: ["CTP_RST"],
	pin13: ["CTP_INT"],
	pin14: ["CTP_SDA"],
	pin15: ["CTP_SCL"],
	pin16: ["MOUNT_1"],
	pin17: ["MOUNT_2"],
} as const;

export const AFC24_S15FIA_00 = (props: ChipProps<typeof pinLabels>) => (
	<connector
		pinLabels={pinLabels}
		supplierPartNumbers={{ jlcpcb: ["C6709462"] }}
		manufacturerPartNumber="AFC24-S15FIA-00"
		footprint={
			<footprint>
				<smtpad
					portHints={["pin16"]}
					pcbX="5.149977mm"
					pcbY="-1.3750544mm"
					width="1.7999964mm"
					height="1.999996mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin17"]}
					pcbX="-5.149977mm"
					pcbY="-1.3750544mm"
					width="1.7999964mm"
					height="1.999996mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin1"]}
					pcbX="-3.499993mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX="-2.999867mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin3"]}
					pcbX="-2.499995mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin4"]}
					pcbX="-1.999869mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin5"]}
					pcbX="-1.499997mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin6"]}
					pcbX="-0.999871mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin7"]}
					pcbX="-0.499999mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin8"]}
					pcbX="0.000127mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin9"]}
					pcbX="0.499999mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin10"]}
					pcbX="1.000125mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin11"]}
					pcbX="1.499997mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin12"]}
					pcbX="2.000123mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin13"]}
					pcbX="2.499995mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin14"]}
					pcbX="3.000121mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<smtpad
					portHints={["pin15"]}
					pcbX="3.499993mm"
					pcbY="1.7750536mm"
					width="0.2999994mm"
					height="1.1999976mm"
					shape="rect"
				/>
				<silkscreenpath
					route={[
						{ x: 5.55013, y: -0.09992 },
						{ x: 5.55013, y: 1.87503 },
						{ x: 3.85628, y: 1.87505 },
					]}
				/>
				<silkscreenpath
					route={[
						{ x: -5.49991, y: -0.09995 },
						{ x: -5.49991, y: 1.87505 },
						{ x: -3.99992, y: 1.87505 },
					]}
				/>
				<silkscreenpath
					route={[
						{ x: 5.55008, y: -3.52318 },
						{ x: -5.54998, y: -3.52318 },
					]}
				/>
				<silkscreenpath
					route={[
						{ x: -5.54998, y: -2.59916 },
						{ x: -5.54998, y: -3.52318 },
					]}
				/>
				<silkscreenpath
					route={[
						{ x: 5.5502, y: -2.59916 },
						{ x: 5.5502, y: -3.52313 },
					]}
				/>
				<silkscreencircle pcbX={-4.1078} pcbY={2.8678} radius="0.15mm" />
				<courtyardoutline
					outline={[
						{ x: -6.30803, y: 3.2755 },
						{ x: 6.28237, y: 3.2755 },
						{ x: 6.28237, y: -3.7777 },
						{ x: -6.30803, y: -3.7777 },
						{ x: -6.30803, y: 3.2755 },
					]}
				/>
			</footprint>
		}
		cadModel={{
			objUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C6709462.obj?uuid=594f786c31634db2a7d05ec8cf49158c",
			stepUrl:
				"https://modelcdn.tscircuit.com/easyeda_models/assets/C6709462.step?uuid=594f786c31634db2a7d05ec8cf49158c",
			pcbRotationOffset: 0,
			modelOriginPosition: {
				x: -0.0050889,
				y: 0.398945,
				z: -0.02,
			},
		}}
		{...props}
	/>
);
