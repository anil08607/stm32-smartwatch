import type { MosfetProps } from "@tscircuit/props";

export const A_2N7002 = (
	props: Omit<MosfetProps, "channelType" | "mosfetMode">,
) => {
	return (
		<mosfet
			channelType="n"
			mosfetMode="enhancement"
			supplierPartNumbers={{
				jlcpcb: ["C8545"],
			}}
			manufacturerPartNumber="2N7002"
			footprint={
				<footprint>
					<smtpad
						portHints={["pin1", "gate"]}
						pcbX="0.999998mm"
						pcbY="-0.94996mm"
						width="0.999998mm"
						height="0.6500114mm"
						shape="rect"
					/>
					<smtpad
						portHints={["pin2", "source"]}
						pcbX="0.999998mm"
						pcbY="0.94996mm"
						width="0.999998mm"
						height="0.6500114mm"
						shape="rect"
					/>
					<smtpad
						portHints={["pin3", "drain"]}
						pcbX="-0.999998mm"
						pcbY="0mm"
						width="0.999998mm"
						height="0.6500114mm"
						shape="rect"
					/>
					<silkscreenpath
						route={[
							{ x: 0.726211400000011, y: 1.5262098000000606 },
							{ x: -0.726211400000011, y: 1.5262098000000606 },
							{ x: -0.726211400000011, y: 0.49458879999997407 },
						]}
					/>
					<silkscreenpath
						route={[
							{ x: 0.726211400000011, y: -1.5262097999999469 },
							{ x: -0.726211400000011, y: -1.5262097999999469 },
							{ x: -0.726211400000011, y: -0.49458879999997407 },
						]}
					/>
					<silkscreenpath
						route={[
							{ x: 0.726211400000011, y: 0.45539659999997184 },
							{ x: 0.726211400000011, y: -0.45539659999985815 },
						]}
					/>
					<silkscreentext
						text="{NAME}"
						pcbX="0.0254mm"
						pcbY="2.524mm"
						anchorAlignment="center"
						fontSize="1mm"
					/>
					<courtyardoutline
						outline={[
							{ x: -1.748600000000124, y: 1.774000000000001 },
							{ x: 1.7993999999998778, y: 1.774000000000001 },
							{ x: 1.7993999999998778, y: -1.774000000000001 },
							{ x: -1.748600000000124, y: -1.774000000000001 },
							{ x: -1.748600000000124, y: 1.774000000000001 },
						]}
					/>
				</footprint>
			}
			cadModel={{
				objUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C8545.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
				stepUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C8545.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
				pcbRotationOffset: 180,
				modelOriginPosition: { x: 0.0000127, y: -0.0000127, z: 0.050795 },
			}}
			{...props}
		/>
	);
};
