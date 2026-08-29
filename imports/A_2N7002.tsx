import type { MosfetProps } from "@tscircuit/props";

export const A_2N7002 = (
	props: Omit<MosfetProps, "channelType" | "mosfetMode">,
) => {
	return (
		<mosfet
			channelType="n"
			mosfetMode="enhancement"
			symbol={
				<symbol width="1.1mm" height="1mm">
					<schematicpath
						points={[
							{ x: 0, y: 0 },
							{ x: 1.524, y: -0.508 },
							{ x: 1.524, y: 0.508 },
							{ x: 0, y: 0 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
						isFilled
						fillColor="#FEFEFE"
					/>
					<schematicpath
						points={[
							{ x: 5.08, y: 0.508 },
							{ x: 4.318, y: -0.762 },
							{ x: 5.842, y: -0.762 },
							{ x: 5.08, y: 0.508 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
						isFilled
						fillColor="#FEFEFE"
					/>
					<schematicpath
						points={[
							{ x: 0, y: 1.778 },
							{ x: 2.54, y: 1.778 },
							{ x: 2.54, y: 2.54 },
							{ x: 5.08, y: 2.54 },
							{ x: 5.08, y: 0.508 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 0, y: 0 },
							{ x: 2.54, y: 0 },
							{ x: 2.54, y: -2.54 },
							{ x: 5.08, y: -2.54 },
							{ x: 5.08, y: -0.762 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 2.54, y: -1.778 },
							{ x: 0, y: -1.778 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: -0.508, y: 2.286 },
							{ x: -0.508, y: -2.286 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 0, y: 2.286 },
							{ x: 0, y: 1.27 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 0, y: -0.508 },
							{ x: 0, y: 0.508 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 0, y: -2.286 },
							{ x: 0, y: -1.27 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: -2.54, y: 0 },
							{ x: -0.508, y: 0 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<schematicpath
						points={[
							{ x: 6.096, y: 0.508 },
							{ x: 5.588, y: 0.508 },
							{ x: 4.572, y: 0.508 },
							{ x: 4.064, y: 0.508 },
						]}
						strokeWidth={0.254}
						strokeColor="#880000"
					/>
					<port
						name="pin3"
						pinNumber={3}
						aliases={["D", "drain"]}
						direction="up"
						schX={2.54}
						schY={5.08}
						schStemLength={2.54}
					/>
					<port
						name="pin1"
						pinNumber={1}
						aliases={["G", "gate"]}
						direction="left"
						schX={-5.08}
						schY={0}
						schStemLength={2.54}
					/>
					<port
						name="pin2"
						pinNumber={2}
						aliases={["S", "source"]}
						direction="down"
						schX={2.54}
						schY={-5.08}
						schStemLength={2.54}
					/>
				</symbol>
			}
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
