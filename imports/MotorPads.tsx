import "tscircuit";
import type { ChipProps } from "@tscircuit/props";

const motorPads = { pin1: ["MOTOR_POS"], pin2: ["MOTOR_NEG"] } as const;

export const MotorPads = (props: ChipProps<typeof motorPads>) => (
	<connector
		pinLabels={motorPads}
		manufacturerPartNumber="LCM1234A3523F"
		supplierPartNumbers={{ jlcpcb: ["C7424783"] }}
		footprint={
			<footprint insertionDirection="from_above">
				<smtpad
					portHints={["pin1"]}
					pcbX={-1}
					pcbY={0}
					width={1.4}
					height={2}
					shape="rect"
				/>
				<smtpad
					portHints={["pin2"]}
					pcbX={1}
					pcbY={0}
					width={1.4}
					height={2}
					shape="rect"
				/>
				<courtyardrect width={4.7} height={3.5} />
				<silkscreenrect pcbX={0} pcbY={0} width={4.2} height={3} />
			</footprint>
		}
		schWidth={3.6}
		{...props}
	/>
);
