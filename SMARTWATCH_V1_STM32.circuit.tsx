import "tscircuit";
import { A_2N7002 } from "./imports/A_2N7002";
import { AFC24_S15FIA_00 } from "./imports/AFC24_S15FIA_00";
import { BMA400 } from "./imports/BMA400";
import { TS_1806SA_2x4x3_5DY_180X } from "./imports/TS_1806SA_2x4x3_5DY_180X";
import { BQ25180YBGR } from "./imports/BQ25180YBGR";
import { HroUsbC } from "./imports/HroUsbC";
import { JstShBattery } from "./imports/JstShBattery";
import { MAX30102EFDT } from "./imports/MAX30102EFDT";
import { MotorPads } from "./imports/MotorPads";
import { PCF8563TS } from "./imports/PCF8563TS";
import { SM06B_SRSS_TB } from "./imports/SM06B_SRSS_TB";
import { STM32L432KCU6 } from "./imports/STM32L432KCU6";
import { TPS63802DLAR } from "./imports/TPS63802DLAR";
import { TPS7A2018PDBVR } from "./imports/TPS7A2018PDBVR";

const resistorPart = {
	cc: { mpn: "0402WGF5101TCE", jlc: "C25905" },
	tenK: { mpn: "0402WGF1002TCE", jlc: "C25744" },
	hundredK: { mpn: "0402WGF1003TCE", jlc: "C25741" },
	fiveTenK: { mpn: "0402WGF5103TCE", jlc: "C11616" },
	ninetyOneK: { mpn: "0402WGF9102TCE", jlc: "C4147" },
} as const;

const cap100n = {
	mpn: "CC0402KRX7R7BB104",
	jlc: "C60474",
} as const;

/**
 * Standalone STM32 smartwatch V1.
 *
 * Electrical authority order used by this implementation:
 * Open-Smartwatch Light / ZSWatch mechanical precedent, then each IC vendor's
 * official reference circuit, then exact JLCPCB/LCSC assembly parts.
 */
export const SMARTWATCH_V1_STM32 = () => (
	<board
		name="SMARTWATCH_V1_STM32"
		title="Standalone Smartwatch V1 - STM32L432"
		width="40mm"
		height="40mm"
		borderRadius="20mm"
		layers={4}
		thickness="1mm"
		solderMaskColor="black"
		silkscreenColor="white"
		doubleSidedAssembly
		pcbStyle={{ viaPadDiameter: "0.4mm", viaHoleDiameter: "0.2mm" }}
		minTraceWidth="0.1mm"
		minTraceToPadEdgeClearance="0.15mm"
		minViaEdgeToPadEdgeClearance="0.15mm"
		minPadEdgeToPadEdgeClearance="0.1mm"
		minViaHoleEdgeToViaHoleEdgeClearance="0.2mm"
		minViaPadDiameter="0.4mm"
		minViaHoleDiameter="0.2mm"
		minBoardEdgeClearance="0.2mm"
		schSheetName="main"
		autorouter={{
			preset: "fanout",
			traceClearance: "0.15mm",
		}}
		autorouterVersion="beta_pipeline9"
		autorouterEffortLevel="1x"
		schMaxTraceDistance="5mm"
	>
		<copperpour
			name="GND_PLANE"
			layer="inner1"
			connectsTo="net.GND"
			unbroken
			clearance="0.15mm"
			boardEdgeMargin="0.2mm"
		/>
		<copperpour
			name="V3V3_PLANE"
			layer="inner2"
			connectsTo="net.V3V3"
			unbroken
			clearance="0.15mm"
			boardEdgeMargin="0.2mm"
		/>
		<schematicsheet
			name="main"
			displayName="Standalone Smartwatch V1"
			sheetIndex={0}
			sheetWidth="660mm"
			sheetHeight="410mm"
		/>
		<silkscreentext
			text="SMARTWATCH V1"
			fontSize="0.9mm"
			pcbX={-11}
			pcbY={14.8}
		/>
		<silkscreentext text="STM32L432" fontSize="0.7mm" pcbX={-11} pcbY={13.6} />
		<silkscreencircle layer="bottom" pcbX={0} pcbY={0} radius="4.4mm" />
		<silkscreentext
			layer="bottom"
			text="OPTICAL WINDOW / NO GASKET GAP"
			fontSize="0.55mm"
			pcbX={0}
			pcbY={-4.9}
		/>
		<silkscreentext
			layer="bottom"
			text="SKIN SIDE"
			fontSize="0.7mm"
			pcbX={0}
			pcbY={4.9}
		/>

		{/* Power & charging */}
		<HroUsbC
			name="J1"
			pcbX={0}
			pcbY={-16.7}
			schX={-30}
			schY={-8}
			noConnect={["SBU1", "SBU2", "DP_A", "DP_B", "DN_A", "DN_B"]}
			connections={{
				VBUS_A: "net.USB5V",
				VBUS_B: "net.USB5V",
				GND_A: "net.GND",
				GND_B: "net.GND",
				SHELL1: "net.GND",
				SHELL2: "net.GND",
				SHELL3: "net.GND",
				SHELL4: "net.GND",
				CC1: "net.USB_CC1",
				CC2: "net.USB_CC2",
			}}
		/>

		<resistor
			name="R1"
			resistance="5.1k"
			footprint="0402"
			layer="bottom"
			manufacturerPartNumber={resistorPart.cc.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.cc.jlc] }}
			pcbX={-3}
			pcbY={-11.8}
			schX={-26.5}
			schY={-6}
			connections={{ pin1: "net.USB_CC1", pin2: "net.GND" }}
		/>
		<resistor
			name="R2"
			resistance="5.1k"
			footprint="0402"
			layer="bottom"
			manufacturerPartNumber={resistorPart.cc.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.cc.jlc] }}
			pcbX={3}
			pcbY={-11.8}
			schX={-26.5}
			schY={-10}
			connections={{ pin1: "net.USB_CC2", pin2: "net.GND" }}
		/>

		<diode
			name="D1"
			footprint="sod523"
			layer="bottom"
			manufacturerPartNumber="LESD5Z5.0CT1G"
			supplierPartNumbers={{ jlcpcb: ["C136167"] }}
			pcbX={-6}
			pcbY={-12.5}
			schX={-25}
			schY={-8}
			connections={{ anode: "net.GND", cathode: "net.USB5V" }}
		/>

		<BQ25180YBGR
			name="U5"
			pcbX={-8}
			pcbY={-10.5}
			schX={-20.5}
			schY={-8}
			connections={{
				IN: "net.USB5V",
				SYS: "net.SYS",
				BAT: "net.BAT",
				SCL: "net.I2C_SCL",
				SDA: "net.I2C_SDA",
				INT: "net.CHG_INT",
				TS_MR: "net.BQ_TS",
				GND: "net.GND",
			}}
		/>
		<capacitor
			name="C1"
			capacitance="1uF"
			footprint="0402"
			manufacturerPartNumber="CL05A105KA5NQNC"
			supplierPartNumbers={{ jlcpcb: ["C52923"] }}
			pcbX={-10}
			pcbY={-12}
			schX={-23}
			schY={-12}
			connections={{ pin1: "net.USB5V", pin2: "net.GND" }}
		/>
		<capacitor
			name="C2"
			capacitance="10uF"
			footprint="0805"
			manufacturerPartNumber="CL21A106KAYNNNE"
			supplierPartNumbers={{ jlcpcb: ["C15850"] }}
			pcbX={-4.5}
			pcbY={-7.5}
			schX={-18}
			schY={-12}
			connections={{ pin1: "net.SYS", pin2: "net.GND" }}
		/>
		<capacitor
			name="C3"
			capacitance="1uF"
			footprint="0402"
			manufacturerPartNumber="CL05A105KA5NQNC"
			supplierPartNumbers={{ jlcpcb: ["C52923"] }}
			pcbX={-10}
			pcbY={-9}
			schX={-15.5}
			schY={-12}
			connections={{ pin1: "net.BAT", pin2: "net.GND" }}
		/>
		<resistor
			name="R3"
			resistance="10k"
			footprint="0402"
			manufacturerPartNumber={resistorPart.tenK.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.tenK.jlc] }}
			pcbX={-8}
			pcbY={-6}
			schX={-16}
			schY={-6}
			connections={{ pin1: "net.BQ_TS", pin2: "net.GND" }}
		/>
		<resistor
			name="R7"
			resistance="10k"
			footprint="0402"
			manufacturerPartNumber={resistorPart.tenK.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.tenK.jlc] }}
			pcbX={-6}
			pcbY={-4.8}
			schX={-18}
			schY={-5.5}
			connections={{ pin1: "net.V3V3", pin2: "net.CHG_INT" }}
		/>

		<JstShBattery
			name="J2"
			pcbX={-15.5}
			pcbY={0}
			pcbRotation={90}
			schX={-13.5}
			schY={-8}
			connections={{ BAT_POS: "net.BAT", BAT_NEG: "net.GND" }}
		/>

		<TPS63802DLAR
			name="U6"
			manufacturerPartNumber="TPS63802DLAR"
			supplierPartNumbers={{ jlcpcb: ["C2845237"] }}
			pcbX={0}
			pcbY={-10.5}
			schX={-10}
			schY={-8}
			connections={{
				VIN: "net.SYS",
				EN: "net.SYS",
				MODE: "net.GND",
				GND: "net.GND",
				AGND: "net.GND",
				VOUT: "net.V3V3",
				L1: "net.BUCK_L1",
				L2: "net.BUCK_L2",
				FB: "net.BUCK_FB",
				PG: "net.BUCK_PG",
			}}
		/>
		<inductor
			name="L1"
			inductance="0.47uH"
			footprint={
				<footprint>
					<smtpad
						portHints={["pin1"]}
						pcbX={-0.95}
						pcbY={0}
						width={0.8}
						height={1.8}
						shape="rect"
					/>
					<smtpad
						portHints={["pin2"]}
						pcbX={0.95}
						pcbY={0}
						width={0.8}
						height={1.8}
						shape="rect"
					/>
					<courtyardrect width={3.1} height={2.4} />
					<silkscreenrect pcbX={0} pcbY={0} width={2.5} height={2} />
				</footprint>
			}
			manufacturerPartNumber="DFE252012P-R47M=P2"
			supplierPartNumbers={{ jlcpcb: ["C237552"] }}
			cadModel={{
				objUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C237552.obj?uuid=8f47eb01ab4b4bacaa4f20f2f35bc0ed",
				stepUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C237552.step?uuid=8f47eb01ab4b4bacaa4f20f2f35bc0ed",
				pcbRotationOffset: 0,
				modelOriginPosition: { x: 0.0000127, y: 0, z: 0 },
			}}
			pcbX={0}
			pcbY={-7.3}
			schX={-10}
			schY={-4}
			connections={{ pin1: "net.BUCK_L1", pin2: "net.BUCK_L2" }}
		/>
		<capacitor
			name="C4"
			capacitance="10uF"
			footprint="0805"
			manufacturerPartNumber="CL21A106KAYNNNE"
			supplierPartNumbers={{ jlcpcb: ["C15850"] }}
			pcbX={-3.7}
			pcbY={-10.5}
			schX={-13}
			schY={-12}
			connections={{ pin1: "net.SYS", pin2: "net.GND" }}
		/>
		<capacitor
			name="C5"
			capacitance="22uF"
			footprint="0805"
			manufacturerPartNumber="CL21A226MAQNNNE"
			supplierPartNumbers={{ jlcpcb: ["C45783"] }}
			pcbX={3.2}
			pcbY={-10.5}
			schX={-7}
			schY={-12}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<resistor
			name="R4"
			resistance="510k"
			footprint="0402"
			manufacturerPartNumber={resistorPart.fiveTenK.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.fiveTenK.jlc] }}
			pcbX={3.5}
			pcbY={-6.5}
			schX={-6}
			schY={-7}
			connections={{ pin1: "net.V3V3", pin2: "net.BUCK_FB" }}
		/>
		<resistor
			name="R5"
			resistance="91k"
			footprint="0402"
			manufacturerPartNumber={resistorPart.ninetyOneK.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.ninetyOneK.jlc] }}
			pcbX={5.5}
			pcbY={-6.5}
			schX={-6}
			schY={-9}
			connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }}
		/>
		<resistor
			name="R6"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber={resistorPart.hundredK.mpn}
			supplierPartNumbers={{ jlcpcb: [resistorPart.hundredK.jlc] }}
			pcbX={-2}
			pcbY={-5}
			schX={-8}
			schY={-5}
			connections={{ pin1: "net.V3V3", pin2: "net.BUCK_PG" }}
		/>

		<TPS7A2018PDBVR
			name="U7"
			pcbX={8}
			pcbY={-10.5}
			schX={-2}
			schY={-8}
			connections={{
				VIN: "net.V3V3",
				VEN: "net.V3V3",
				VOUT: "net.V1V8",
				GND: "net.GND",
			}}
		/>
		<capacitor
			name="C6"
			capacitance="1uF"
			footprint="0402"
			manufacturerPartNumber="CL05A105KA5NQNC"
			supplierPartNumbers={{ jlcpcb: ["C52923"] }}
			pcbX={6}
			pcbY={-13.5}
			schX={-4}
			schY={-12}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C7"
			capacitance="1uF"
			footprint="0402"
			manufacturerPartNumber="CL05A105KA5NQNC"
			supplierPartNumbers={{ jlcpcb: ["C52923"] }}
			pcbX={10}
			pcbY={-13.5}
			schX={0}
			schY={-12}
			connections={{ pin1: "net.V1V8", pin2: "net.GND" }}
		/>

		{/* MCU */}
		<STM32L432KCU6
			name="U1"
			pcbX={-5}
			pcbY={4}
			schX={0}
			schY={0}
			noConnect={[
				"PC14_OSC32_IN",
				"PC15_OSC32_OUT",
				"PA12",
				"PB3",
				"PB4",
				"PB5",
			]}
			connections={{
				VDD1: "net.V3V3",
				VDD2: "net.V3V3",
				VDDA_VREF: "net.V3V3",
				VSS1: "net.GND",
				VSS2: "net.GND",
				VSS_EP: "net.GND",
				NRST: "net.NRST",
				PH3_BOOT0: "net.BOOT0",
				PA0: "net.BUTTON1",
				PA1: "net.BUTTON2",
				PA2: "net.MOTOR_EN",
				PA3: "net.CHG_INT",
				PA4: "net.LCD_CS",
				PA5: "net.LCD_SCK",
				PA6: "net.BAT_ADC",
				PA7: "net.LCD_MOSI",
				PA8: "net.BMA_INT1",
				PA9: "net.BMA_INT2",
				PA10: "net.RTC_INT",
				PA11: "net.PPG_INT",
				PA13_SWDIO: "net.SWDIO",
				PA14_SWCLK: "net.SWCLK",
				PA15: "net.LCD_BL",
				PB0: "net.LCD_DC",
				PB1: "net.LCD_RESET",
				PB6: "net.I2C_SCL",
				PB7: "net.I2C_SDA",
			}}
		/>

		<capacitor
			name="C8"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={-9.2}
			pcbY={6}
			schX={-7}
			schY={6}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C9"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={-0.5}
			pcbY={6.5}
			schX={-5}
			schY={6}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C10"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={-9.2}
			pcbY={4.8}
			schX={-3}
			schY={6}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C11"
			capacitance="1uF"
			footprint="0402"
			manufacturerPartNumber="CL05A105KA5NQNC"
			supplierPartNumbers={{ jlcpcb: ["C52923"] }}
			pcbX={-9.2}
			pcbY={3.6}
			schX={-1}
			schY={6}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C12"
			capacitance="4.7uF"
			footprint="0603"
			manufacturerPartNumber="CL10A475KO8NNNC"
			supplierPartNumbers={{ jlcpcb: ["C19666"] }}
			pcbX={0}
			pcbY={4.5}
			schX={1}
			schY={6}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>

		<resistor
			name="R8"
			resistance="4.7k"
			footprint="0402"
			manufacturerPartNumber="0402WGF4701TCE"
			supplierPartNumbers={{ jlcpcb: ["C25900"] }}
			pcbX={-1.5}
			pcbY={8}
			schX={8}
			schY={5}
			connections={{ pin1: "net.V3V3", pin2: "net.I2C_SCL" }}
		/>
		<resistor
			name="R9"
			resistance="4.7k"
			footprint="0402"
			manufacturerPartNumber="0402WGF4701TCE"
			supplierPartNumbers={{ jlcpcb: ["C25900"] }}
			pcbX={0}
			pcbY={10}
			schX={10}
			schY={5}
			connections={{ pin1: "net.V3V3", pin2: "net.I2C_SDA" }}
		/>

		<resistor
			name="R10"
			resistance="10k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1002TCE"
			supplierPartNumbers={{ jlcpcb: ["C25744"] }}
			pcbX={-9.2}
			pcbY={2.4}
			schX={-8}
			schY={-4}
			connections={{ pin1: "net.V3V3", pin2: "net.NRST" }}
		/>
		<capacitor
			name="C13"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={-9.2}
			pcbY={1.2}
			schX={-6}
			schY={-4}
			connections={{ pin1: "net.NRST", pin2: "net.GND" }}
		/>
		<resistor
			name="R11"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1003TCE"
			supplierPartNumbers={{ jlcpcb: ["C25741"] }}
			pcbX={-9}
			pcbY={0}
			schX={-4}
			schY={-4}
			connections={{ pin1: "net.BOOT0", pin2: "net.GND" }}
		/>

		<resistor
			name="R12"
			resistance="1M"
			footprint="0402"
			manufacturerPartNumber="0402WGF1004TCE"
			supplierPartNumbers={{ jlcpcb: ["C26083"] }}
			pcbX={-0.7}
			pcbY={2.5}
			schX={6}
			schY={-5}
			connections={{ pin1: "net.BAT", pin2: "net.BAT_ADC" }}
		/>
		<resistor
			name="R13"
			resistance="330k"
			footprint="0402"
			manufacturerPartNumber="0402WGF3303TCE"
			supplierPartNumbers={{ jlcpcb: ["C25778"] }}
			pcbX={-0.7}
			pcbY={1.3}
			schX={8}
			schY={-5}
			connections={{ pin1: "net.BAT_ADC", pin2: "net.GND" }}
		/>
		<capacitor
			name="C14"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={1.3}
			pcbY={1.3}
			schX={10}
			schY={-5}
			connections={{ pin1: "net.BAT_ADC", pin2: "net.GND" }}
		/>
		<SM06B_SRSS_TB
			name="J3"
			pcbX={0}
			pcbY={15.5}
			schX={-4}
			schY={-8}
			connections={{
				V3V3: "net.V3V3",
				SWDIO: "net.SWDIO",
				GND: "net.GND",
				SWCLK: "net.SWCLK",
				NRST: "net.NRST",
				BOOT0: "net.BOOT0",
			}}
		/>

		{/* Display */}
		<AFC24_S15FIA_00
			name="J4"
			pcbX={-12}
			pcbY={0}
			pcbRotation={270}
			layer="bottom"
			schX={-12}
			schY={13}
			noConnect={[
				"CTP_VDD",
				"CTP_RST",
				"CTP_INT",
				"CTP_SDA",
				"CTP_SCL",
				"MOUNT_1",
				"MOUNT_2",
			]}
			connections={{
				GND1: "net.GND",
				GND2: "net.GND",
				LEDA: "net.DISPLAY_LEDA",
				LEDK: "net.DISPLAY_LED_K",
				VDD: "net.V3V3",
				SDA: "net.LCD_MOSI",
				SCL: "net.LCD_SCK",
				CS: "net.LCD_CS",
				RS: "net.LCD_DC",
				RESET: "net.LCD_RESET",
			}}
		/>
		<silkscreentext
			layer="bottom"
			text="LCD FPC / PIN 1"
			fontSize="0.5mm"
			pcbX={-12}
			pcbY={-7}
		/>

		<resistor
			name="R14"
			resistance="22"
			footprint="0402"
			manufacturerPartNumber="0402WGF220JTCE"
			supplierPartNumbers={{ jlcpcb: ["C25092"] }}
			pcbX={-14}
			pcbY={6}
			schX={-19}
			schY={17}
			connections={{ pin1: "net.V3V3", pin2: "net.DISPLAY_LEDA" }}
		/>
		<A_2N7002
			name="Q1"
			pcbX={-12.5}
			pcbY={12}
			pcbRotation={180}
			schX={-19}
			schY={13}
			connections={{
				gate: "net.LCD_BL_GATE",
				source: "net.GND",
				drain: "net.DISPLAY_LED_K",
			}}
		/>
		<resistor
			name="R15"
			resistance="100"
			footprint="0402"
			manufacturerPartNumber="0402WGF1000TCE"
			supplierPartNumbers={{ jlcpcb: ["C25076"] }}
			pcbX={-9.8}
			pcbY={12}
			schX={-22}
			schY={13}
			connections={{ pin1: "net.LCD_BL", pin2: "net.LCD_BL_GATE" }}
		/>
		<resistor
			name="R16"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1003TCE"
			supplierPartNumbers={{ jlcpcb: ["C25741"] }}
			pcbX={-6}
			pcbY={12.5}
			schX={-22}
			schY={10}
			connections={{ pin1: "net.LCD_BL_GATE", pin2: "net.GND" }}
		/>
		<capacitor
			name="C15"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber="CC0402KRX7R7BB104"
			supplierPartNumbers={{ jlcpcb: ["C60474"] }}
			pcbX={-11.8}
			pcbY={5.5}
			schX={-5}
			schY={9}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>

		{/* Sensors */}
		<BMA400
			name="U2"
			pcbX={9}
			pcbY={8.5}
			schX={3}
			schY={15}
			noConnect={["NC4", "NC11"]}
			connections={{
				VDD: "net.V3V3",
				VDDIO: "net.V3V3",
				GND: "net.GND",
				GNDIO: "net.GND",
				CSB: "net.V3V3",
				SDO: "net.GND",
				SDA: "net.I2C_SDA",
				SCL: "net.I2C_SCL",
				INT1: "net.BMA_INT1",
				INT2: "net.BMA_INT2",
			}}
		/>
		<capacitor
			name="C16"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={6.4}
			pcbY={8.5}
			schX={0}
			schY={11}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C17"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={11.6}
			pcbY={8.5}
			schX={2}
			schY={11}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>

		<MAX30102EFDT
			name="U3"
			layer="bottom"
			pcbX={0}
			pcbY={0}
			schX={12}
			schY={15}
			noConnect={["NC1", "NC5", "NC6", "NC7", "NC8", "NC14"]}
			connections={{
				SCL: "net.I2C_SCL",
				SDA: "net.I2C_SDA",
				INT: "net.PPG_INT",
				PGND: "net.GND",
				GND: "net.GND",
				VLED1: "net.V3V3",
				VLED2: "net.V3V3",
				VDD: "net.V1V8",
			}}
		/>
		<capacitor
			name="C18"
			capacitance="4.7uF"
			footprint="0603"
			manufacturerPartNumber="CL10A475KO8NNNC"
			supplierPartNumbers={{ jlcpcb: ["C19666"] }}
			layer="bottom"
			pcbX={-3.7}
			pcbY={1.5}
			schX={9}
			schY={10}
			connections={{ pin1: "net.V1V8", pin2: "net.GND" }}
		/>
		<capacitor
			name="C19"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			layer="bottom"
			pcbX={-3.2}
			pcbY={-0.5}
			schX={11}
			schY={10}
			connections={{ pin1: "net.V1V8", pin2: "net.GND" }}
		/>
		<capacitor
			name="C20"
			capacitance="10uF"
			footprint="0805"
			manufacturerPartNumber="CL21A106KAYNNNE"
			supplierPartNumbers={{ jlcpcb: ["C15850"] }}
			layer="bottom"
			pcbX={3.9}
			pcbY={1.5}
			schX={13}
			schY={10}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<capacitor
			name="C21"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			layer="bottom"
			pcbX={3.2}
			pcbY={-0.5}
			schX={15}
			schY={10}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
		<resistor
			name="R18"
			resistance="4.7k"
			footprint="0402"
			manufacturerPartNumber="0402WGF4701TCE"
			supplierPartNumbers={{ jlcpcb: ["C25900"] }}
			layer="bottom"
			pcbX={3.2}
			pcbY={-2}
			schX={17}
			schY={12}
			connections={{ pin1: "net.V3V3", pin2: "net.PPG_INT" }}
		/>

		<PCF8563TS
			name="U4"
			pcbX={10}
			pcbY={-4}
			schX={22}
			schY={15}
			noConnect={["CLKOUT"]}
			connections={{
				VDD: "net.BAT",
				VSS: "net.GND",
				SDA: "net.I2C_SDA",
				SCL: "net.I2C_SCL",
				INT: "net.RTC_INT",
				OSCI: "net.RTC_OSCI",
				OSCO: "net.RTC_OSCO",
			}}
		/>
		<crystal
			name="Y1"
			frequency="32.768kHz"
			loadCapacitance="7pF"
			manufacturerPartNumber="FC-135 32.7680KA-AG3"
			supplierPartNumbers={{ jlcpcb: ["C7275970"] }}
			cadModel={{
				objUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C7275970.obj?uuid=eac14d4facdb45dfa3b66d00e2a3c6e4",
				stepUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C7275970.step?uuid=eac14d4facdb45dfa3b66d00e2a3c6e4",
				pcbRotationOffset: 0,
				modelOriginPosition: { x: -0.0000254, y: -0.0001397, z: -0.01 },
			}}
			pcbX={14}
			pcbY={-1}
			schX={26}
			schY={15}
			connections={{ pin1: "net.RTC_OSCI", pin2: "net.RTC_OSCO" }}
			footprint={
				<footprint>
					<smtpad
						portHints={["pin1"]}
						pcbX={-1.15}
						pcbY={0}
						width={1.15}
						height={1.35}
						shape="rect"
					/>
					<smtpad
						portHints={["pin2"]}
						pcbX={1.15}
						pcbY={0}
						width={1.15}
						height={1.35}
						shape="rect"
					/>
					<courtyardrect width={3.7} height={2} />
					<silkscreenrect pcbX={0} pcbY={0} width={3.2} height={1.5} />
				</footprint>
			}
		/>
		<capacitor
			name="C22"
			capacitance="100nF"
			footprint="0402"
			manufacturerPartNumber={cap100n.mpn}
			supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
			pcbX={9}
			pcbY={-6.2}
			schX={21}
			schY={10}
			connections={{ pin1: "net.BAT", pin2: "net.GND" }}
		/>
		<resistor
			name="R17"
			resistance="10k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1002TCE"
			supplierPartNumbers={{ jlcpcb: ["C25744"] }}
			pcbX={11}
			pcbY={-6.2}
			schX={24}
			schY={10}
			connections={{ pin1: "net.V3V3", pin2: "net.RTC_INT" }}
		/>

		{/* Controls & haptics */}
		<TS_1806SA_2x4x3_5DY_180X
			name="SW1"
			pcbX={16.5}
			pcbY={5}
			pcbRotation={90}
			allowOffBoard
			schX={7}
			schY={-10}
			noConnect={["EP1", "pin3_alt1"]}
			connections={{ pin1: "net.BUTTON1", pin2: "net.GND" }}
		/>
		<TS_1806SA_2x4x3_5DY_180X
			name="SW2"
			pcbX={16.5}
			pcbY={-5}
			pcbRotation={90}
			allowOffBoard
			schX={7}
			schY={-12}
			noConnect={["EP1", "pin3_alt1"]}
			connections={{ pin1: "net.BUTTON2", pin2: "net.GND" }}
		/>
		<resistor
			name="R19"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1003TCE"
			supplierPartNumbers={{ jlcpcb: ["C25741"] }}
			pcbX={12.5}
			pcbY={4}
			schX={11}
			schY={-6}
			connections={{ pin1: "net.V3V3", pin2: "net.BUTTON1" }}
		/>
		<resistor
			name="R20"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1003TCE"
			supplierPartNumbers={{ jlcpcb: ["C25741"] }}
			pcbX={12}
			pcbY={-8.5}
			schX={11}
			schY={-12}
			connections={{ pin1: "net.V3V3", pin2: "net.BUTTON2" }}
		/>

		<MotorPads
			name="M1"
			manufacturerPartNumber="VC1026B002F"
			supplierPartNumbers={{ jlcpcb: ["C17215865"] }}
			pcbX={13.3}
			pcbY={11.8}
			schX={22}
			schY={-6}
			connections={{ MOTOR_POS: "net.V3V3", MOTOR_NEG: "net.MOTOR_NEG" }}
		/>
		<A_2N7002
			name="Q2"
			manufacturerPartNumber="AO3400A"
			supplierPartNumbers={{ jlcpcb: ["C20917"] }}
			cadModel={{
				objUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C20917.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
				stepUrl:
					"https://modelcdn.tscircuit.com/easyeda_models/assets/C20917.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
				pcbRotationOffset: 180,
				modelOriginPosition: { x: 0.0000127, y: -0.0000127, z: 0.050795 },
			}}
			pcbX={8.5}
			pcbY={13.3}
			schX={22}
			schY={-10}
			connections={{
				gate: "net.MOTOR_GATE",
				source: "net.GND",
				drain: "net.MOTOR_NEG",
			}}
		/>
		<resistor
			name="R21"
			resistance="100"
			footprint="0402"
			manufacturerPartNumber="0402WGF1000TCE"
			supplierPartNumbers={{ jlcpcb: ["C25076"] }}
			pcbX={5.8}
			pcbY={13.3}
			schX={18}
			schY={-10}
			connections={{ pin1: "net.MOTOR_EN", pin2: "net.MOTOR_GATE" }}
		/>
		<resistor
			name="R22"
			resistance="100k"
			footprint="0402"
			manufacturerPartNumber="0402WGF1003TCE"
			supplierPartNumbers={{ jlcpcb: ["C25741"] }}
			pcbX={10.5}
			pcbY={2}
			schX={19}
			schY={-13}
			connections={{ pin1: "net.MOTOR_GATE", pin2: "net.GND" }}
		/>
		<diode
			name="D2"
			footprint="sod323"
			manufacturerPartNumber="1N5819WS"
			supplierPartNumbers={{ jlcpcb: ["C5451629"] }}
			pcbX={9.5}
			pcbY={5}
			schX={26}
			schY={-8.5}
			connections={{ anode: "net.MOTOR_NEG", cathode: "net.V3V3" }}
		/>
		<capacitor
			name="C23"
			capacitance="22uF"
			footprint="0805"
			manufacturerPartNumber="CL21A226MAQNNNE"
			supplierPartNumbers={{ jlcpcb: ["C45783"] }}
			pcbX={15}
			pcbY={9}
			schX={28}
			schY={-12}
			connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
		/>
	</board>
);

export default SMARTWATCH_V1_STM32;
