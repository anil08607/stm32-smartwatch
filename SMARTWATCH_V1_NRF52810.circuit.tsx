import { Crystal32MHz, Crystal32768, ChipAntenna } from "./imports/RadioParts";
import "tscircuit";
import { A_2N7002 } from "./imports/A_2N7002";
import { AFC24_S15FIA_00 } from "./imports/AFC24_S15FIA_00";
import { BMA456 } from "./imports/BMA456";
import { TS_1806SA_2x4x3_5DY_180X } from "./imports/TS_1806SA_2x4x3_5DY_180X";
import { BQ25180YBGR } from "./imports/BQ25180YBGR";
import { HUSB238_002DD } from "./imports/HUSB238_002DD";
import { HroUsbC } from "./imports/HroUsbC";
import { JstShBattery } from "./imports/JstShBattery";
import { MotorPads } from "./imports/MotorPads";
import { PCF8563TS } from "./imports/PCF8563TS";
import { SM06B_SRSS_TB } from "./imports/SM06B_SRSS_TB";
import { NRF52810 } from "./imports/NRF52810";
import { TPS63802DLAR } from "./imports/TPS63802DLAR";

const resistorPart = {
	tenK: { mpn: "0402WGF1002TCE", jlc: "C25744" },
	hundredK: { mpn: "0402WGF1003TCE", jlc: "C25741" },
	fiveTenK: { mpn: "RC0402FR-07510KL", jlc: "C137961" },
	ninetyOneK: { mpn: "0402WGF9102TCE", jlc: "C4147" },
} as const;

const cap100n = {
	mpn: "CC0402KRX7R7BB104",
	jlc: "C60474",
} as const;

/**
 * Standalone nRF52810 smartwatch V1.
 *
 * Vendor reference circuits and exact JLCPCB/LCSC assembly parts define the
 * electrical implementation. Mechanical constraints are encoded as checks.
 */
export const SMARTWATCH_V1_NRF52810 = () => (
	<board
		name="SMARTWATCH_V1_NRF52810"
		width="46mm"
		height="46mm"
		borderRadius="8mm"
		layers={4}
		thickness="1mm"
		solderMaskColor="black"
		silkscreenColor="white"
		pcbStyle={{ viaPadDiameter: "0.4mm", viaHoleDiameter: "0.2mm" }}
		minTraceWidth="0.1mm"
		minTraceToPadEdgeClearance="0.1mm"
		minViaEdgeToPadEdgeClearance="0.1mm"
		minPadEdgeToPadEdgeClearance="0.1mm"
		minViaHoleEdgeToViaHoleEdgeClearance="0.2mm"
		minViaPadDiameter="0.4mm"
		minViaHoleDiameter="0.2mm"
		minBoardEdgeClearance="0.2mm"
		schRelative
		schMaxTraceDistance="5mm"
	>
		<net name="USB5V" isPowerNet nominalTraceWidth="0.5mm" />
		<net name="SYS" isPowerNet nominalTraceWidth="0.5mm" />
		<net name="BAT" isPowerNet nominalTraceWidth="0.4mm" />
		<net name="V3V0" isPowerNet nominalTraceWidth="0.3mm" />
		<net name="GND" isGroundNet />
		<schematicsheet
			name="usb_pd"
			displayName="USB-C PD & Battery Charging"
			sheetIndex={0}
			sheetSize="A4"
		>
			{/* USB-C power input, fixed safe 5 V PD request and Li-ion charging. */}
			<HroUsbC
				name="J1"
				pcbX={0}
				pcbY={-19.5}
				schX={-15}
				schY={0}
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

			<HUSB238_002DD
				name="U3"
				schHeight={1.285}
				schWidth={2.055}
				layer="top"
				pcbX={8}
				pcbY={-12.5}
				schX={-7}
				schY={0}
				noConnect={["D_POS", "D_NEG", "SDA", "SCL", "GATE"]}
				connections={{
					VIN: "net.PD_VIN",
					CC1: "net.USB_CC1",
					CC2: "net.USB_CC2",
					VSET: "net.PD_VSET",
					ISET: "net.PD_ISET",
					GND: "net.GND",
				}}
			/>
			<resistor
				name="R18"
				schY={-3}
				schX={-12}
				schRotation={-90}
				resistance="10"
				footprint="0402"
				manufacturerPartNumber="0402WGF100JTCE"
				supplierPartNumbers={{ jlcpcb: ["C25077"] }}
				layer="top"
				pcbX={5.5}
				pcbY={-9}
				connections={{ pin1: "net.USB5V", pin2: "net.PD_VIN" }}
			/>
			<capacitor
				name="C6"
				capacitance="1uF"
				footprint="0402"
				manufacturerPartNumber="CL05A105KA5NQNC"
				supplierPartNumbers={{ jlcpcb: ["C52923"] }}
				layer="top"
				pcbX={8.5}
				pcbY={-10}
				schX={-7}
				schY={-4}
				schOrientation="vertical"
				connections={{ pin1: "net.PD_VIN", pin2: "net.GND" }}
			/>

			<resistor
				name="R1"
				schRotation={-90}
				resistance="0"
				footprint="0402"
				manufacturerPartNumber="0402WGF0000TCE"
				supplierPartNumbers={{ jlcpcb: ["C17168"] }}
				layer="top"
				pcbX={11.3}
				pcbY={-11.5}
				schX={-3}
				schY={2}
				connections={{ pin1: "net.PD_VSET", pin2: "net.GND" }}
			/>
			<resistor
				name="R2"
				schRotation={-90}
				resistance="0"
				footprint="0402"
				manufacturerPartNumber="0402WGF0000TCE"
				supplierPartNumbers={{ jlcpcb: ["C17168"] }}
				layer="top"
				pcbX={11.3}
				pcbY={-13}
				schX={-3}
				schY={-2}
				connections={{ pin1: "net.PD_ISET", pin2: "net.GND" }}
			/>

			<diode
				name="D1"
				schY={-8.5}
				schX={-12}
				schRotation={90}
				footprint="sod523"
				manufacturerPartNumber="LESD5Z5.0CT1G"
				supplierPartNumbers={{ jlcpcb: ["C136167"] }}
				layer="top"
				pcbX={-6.3}
				pcbY={-12.5}
				connections={{ anode: "net.GND", cathode: "net.USB5V" }}
			/>

			<BQ25180YBGR
				name="U5"
				schHeight={1}
				pcbX={-7.5}
				pcbY={-10.5}
				schX={2}
				schY={0}
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
				schRotation={-90}
				capacitance="1uF"
				footprint="0402"
				manufacturerPartNumber="CL05A105KA5NQNC"
				supplierPartNumbers={{ jlcpcb: ["C52923"] }}
				pcbX={-9.5}
				pcbY={-12}
				pcbRotation={180}
				schX={-8}
				schY={-4}
				connections={{ pin1: "net.USB5V", pin2: "net.GND" }}
			/>
			<capacitor
				name="C2"
				schRotation={-90}
				capacitance="10uF"
				footprint="0805"
				manufacturerPartNumber="CL21A106KAYNNNE"
				supplierPartNumbers={{ jlcpcb: ["C15850"] }}
				pcbX={-4.5}
				pcbY={-8}
				schX={-3}
				schY={-4}
				connections={{ pin1: "net.SYS", pin2: "net.GND" }}
			/>
			<capacitor
				name="C3"
				schRotation={-90}
				capacitance="1uF"
				footprint="0402"
				manufacturerPartNumber="CL05A105KA5NQNC"
				supplierPartNumbers={{ jlcpcb: ["C52923"] }}
				pcbX={-10}
				pcbY={-9}
				pcbRotation={180}
				schX={-0.5}
				schY={-4}
				connections={{ pin1: "net.BAT", pin2: "net.GND" }}
			/>
			<JstShBattery
				name="J5"
				schHeight={1.8}
				schPinArrangement={{
					topSide: ["BAT_POS"],
					bottomSide: ["BAT_NEG"],
					leftSide: [],
					rightSide: [],
				}}
				schWidth={1.9}
				schRotation={0}
				pcbRotation={90}
				pcbX={-19}
				pcbY={-10}
				schX={5}
				schY={-5}
				pinAttributes={{ pin1: {}, pin2: {}, BAT_POS: {}, BAT_NEG: {} }}
				connections={{ BAT_POS: "net.BQ_TS", BAT_NEG: "net.GND" }}
			/>
			<resistor
				name="R7"
				schY={2.5}
				schX={-1}
				schRotation={-90}
				resistance="10k"
				footprint="0402"
				manufacturerPartNumber={resistorPart.tenK.mpn}
				supplierPartNumbers={{ jlcpcb: [resistorPart.tenK.jlc] }}
				pcbX={-6}
				pcbY={-4.8}
				connections={{ pin1: "net.V3V0", pin2: "net.CHG_INT" }}
			/>

			<JstShBattery
				name="J2"
				schHeight={1.8}
				schPinArrangement={{
					topSide: ["BAT_POS"],
					bottomSide: ["BAT_NEG"],
					leftSide: [],
					rightSide: [],
				}}
				schWidth={1.9}
				schRotation={0}
				pcbX={-14}
				pcbY={19}
				schX={8}
				schY={0}
				connections={{ BAT_POS: "net.BAT", BAT_NEG: "net.GND" }}
			/>
		</schematicsheet>

		<schematicsheet
			name="system_power"
			displayName="3.05 V Buck-Boost Power"
			sheetIndex={1}
			sheetSize="A4"
		>
			<TPS63802DLAR
				name="U6"
				schHeight={1.2}
				schWidth={1.96}
				manufacturerPartNumber="TPS63802DLAR"
				supplierPartNumbers={{ jlcpcb: ["C2845237"] }}
				pcbX={0}
				pcbY={-10.5}
				schX={8.5}
				schY={0}
				connections={{
					VIN: "net.SYS",
					EN: "net.SYS",
					GND: "net.GND",
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
				schX={8.5}
				schY={4}
				connections={{ pin1: "net.BUCK_L1", pin2: "net.BUCK_L2" }}
			/>
			<capacitor
				name="C4"
				schRotation={-90}
				capacitance="10uF"
				footprint="0805"
				manufacturerPartNumber="CL21A106KAYNNNE"
				supplierPartNumbers={{ jlcpcb: ["C15850"] }}
				pcbX={-3.7}
				pcbY={-10.5}
				pcbRotation={180}
				schX={5.5}
				schY={-4}
				connections={{ pin1: "net.SYS", pin2: "net.GND" }}
			/>
			<capacitor
				name="C5"
				schRotation={-90}
				capacitance="22uF"
				footprint="0805"
				manufacturerPartNumber="CL21A226MAQNNNE"
				supplierPartNumbers={{ jlcpcb: ["C45783"] }}
				pcbX={3}
				pcbY={-10.5}
				pcbRotation={90}
				schX={11.5}
				schY={-4}
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
			<trace
				name="U6_VOUT_TO_C5"
				from=".U6 > .VOUT"
				to=".C5 > .pin1"
				pcbStraightLine
			/>
			<trace
				name="U6_MODE_TO_AGND"
				from=".U6 > .MODE"
				to=".U6 > .AGND"
				pcbStraightLine
			/>
			<trace
				name="U6_AGND_TO_GND"
				from=".U6 > .AGND"
				to=".U6 > .GND"
				pcbStraightLine
			/>
			<resistor
				name="R4"
				schRotation={-90}
				resistance="510k"
				footprint="0402"
				manufacturerPartNumber={resistorPart.fiveTenK.mpn}
				supplierPartNumbers={{ jlcpcb: [resistorPart.fiveTenK.jlc] }}
				pcbX={3.5}
				pcbY={-6.5}
				schX={12.5}
				schY={1}
				connections={{ pin1: "net.V3V0", pin2: "net.BUCK_FB" }}
			/>
			<resistor
				name="R5"
				schRotation={-90}
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber={resistorPart.hundredK.mpn}
				supplierPartNumbers={{ jlcpcb: [resistorPart.hundredK.jlc] }}
				pcbX={5.5}
				pcbY={-6.5}
				schX={12.5}
				schY={-1}
				connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }}
			/>
			<resistor
				name="R6"
				schRotation={-90}
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber={resistorPart.hundredK.mpn}
				supplierPartNumbers={{ jlcpcb: [resistorPart.hundredK.jlc] }}
				pcbX={-2}
				pcbY={-5}
				schX={10.5}
				schY={3}
				connections={{ pin1: "net.V3V0", pin2: "net.BUCK_PG" }}
			/>
		</schematicsheet>

		<schematicsheet
			name="controller"
			displayName="MCU, Battery Monitor & Programming"
			sheetIndex={2}
			sheetSize="A4"
		>
			<NRF52810
				name="U1"
				schHeight={5.2}
				schWidth={2.245}
				pcbX={-4}
				pcbY={6}
				schX={0}
				schY={0}
				noConnect={[
					"P0_19",
					"P0_20",
					"P0_22",
					"P0_23",
					"P0_24",
					"P0_25",
					"P0_26",
					"P0_27",
					"P0_28",
					"P0_29",
					"P0_30",
					"P0_31",
					"NC",
					"DCC",
				]}
				connections={{
					VDD1: "net.V3V0",
					VDD2: "net.V3V0",
					VDD3: "net.V3V0",
					VSS1: "net.GND",
					VSS2: "net.GND",
					EP: "net.GND",
					nRESET: "net.NRST",
					SWDIO: "net.SWDIO",
					SWDCLK: "net.SWCLK",
					DEC1: "net.NRF_DEC1",
					DEC2: "net.NRF_DEC2",
					DEC3: "net.NRF_DEC3",
					DEC4: "net.NRF_DEC4",
					XC1: "net.HF_X1",
					XC2: "net.HF_X2",
					XL1: "net.LF_X1",
					XL2: "net.LF_X2",
					ANT: "net.RF_ANT",
					P0_02: "net.BAT_ADC",
					P0_03: "net.BUTTON1",
					P0_04: "net.BUTTON2",
					P0_05: "net.MOTOR_EN",
					P0_06: "net.CHG_INT",
					P0_07: "net.LCD_CS",
					P0_08: "net.LCD_SCK",
					P0_09: "net.LCD_MOSI",
					P0_10: "net.LCD_DC",
					P0_11: "net.LCD_RESET",
					P0_12: "net.LCD_BL",
					P0_13: "net.I2C_SCL",
					P0_14: "net.I2C_SDA",
					P0_15: "net.BMA_INT1",
					P0_16: "net.BMA_INT2",
					P0_17: "net.RTC_INT",
					P0_18: "net.DEBUG_GPIO",
				}}
			/>
			<capacitor
				name="C8"
				schY={5}
				schX={-8}
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={-8.7}
				pcbY={8.3}
				pcbRotation={180}
				connections={{ pin1: "net.NRF_DEC1", pin2: "net.GND" }}
			/>
			<capacitor
				name="C9"
				schY={5}
				schX={-5.5}
				schRotation={-90}
				capacitance="100pF"
				footprint="0402"
				manufacturerPartNumber="0402CG101J500NT"
				supplierPartNumbers={{ jlcpcb: ["C1546"] }}
				pcbX={1}
				pcbY={6.3}
				connections={{ pin1: "net.NRF_DEC2", pin2: "net.GND" }}
			/>
			<capacitor
				name="C10"
				schY={5}
				schX={-3}
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={3.2}
				pcbY={6.5}
				pcbRotation={0}
				connections={{ pin1: "net.NRF_DEC3", pin2: "net.GND" }}
			/>
			<capacitor
				name="C11"
				schY={5}
				schX={-0.5}
				schRotation={-90}
				capacitance="1uF"
				footprint="0402"
				manufacturerPartNumber="CL05A105KA5NQNC"
				supplierPartNumbers={{ jlcpcb: ["C52923"] }}
				pcbX={-5.4}
				pcbY={10.6}
				pcbRotation={180}
				connections={{ pin1: "net.NRF_DEC4", pin2: "net.GND" }}
			/>
			<capacitor
				name="C12"
				pcbY={1.5}
				pcbX={-2}
				schY={5}
				schX={2}
				schRotation={-90}
				capacitance="4.7uF"
				footprint="0603"
				manufacturerPartNumber="CL10A475KO8NNNC"
				supplierPartNumbers={{ jlcpcb: ["C19666"] }}
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>

			<resistor
				name="R8"
				schRotation={-90}
				resistance="4.7k"
				footprint="0402"
				manufacturerPartNumber="0402WGF4701TCE"
				supplierPartNumbers={{ jlcpcb: ["C25900"] }}
				pcbX={-3}
				pcbY={-1}
				schX={8}
				schY={5}
				connections={{ pin1: "net.V3V0", pin2: "net.I2C_SCL" }}
			/>
			<resistor
				name="R9"
				schRotation={-90}
				resistance="4.7k"
				footprint="0402"
				manufacturerPartNumber="0402WGF4701TCE"
				supplierPartNumbers={{ jlcpcb: ["C25900"] }}
				pcbX={-1}
				pcbY={-1}
				schX={10}
				schY={5}
				connections={{ pin1: "net.V3V0", pin2: "net.I2C_SDA" }}
			/>

			<resistor
				name="R10"
				schX={-5.6}
				schY={-3}
				schRotation={-90}
				resistance="10k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1002TCE"
				supplierPartNumbers={{ jlcpcb: ["C25744"] }}
				pcbX={1}
				pcbY={1}
				connections={{ pin1: "net.V3V0", pin2: "net.NRST" }}
			/>
			<capacitor
				name="C13"
				schX={-7.6}
				schY={-3}
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={3}
				pcbY={1}
				pcbRotation={90}
				connections={{ pin1: "net.NRST", pin2: "net.GND" }}
			/>

			<resistor
				name="R12"
				schRotation={-90}
				resistance="1M"
				footprint="0402"
				manufacturerPartNumber="0402WGF1004TCE"
				supplierPartNumbers={{ jlcpcb: ["C26083"] }}
				pcbX={-8}
				pcbY={0.1}
				pcbRotation={180}
				schX={6}
				schY={-5}
				connections={{ pin1: "net.BAT", pin2: "net.BAT_ADC" }}
			/>
			<tracehint for=".R12 > .pin1" offset={{ x: 1.5, y: -1 }} />
			<resistor
				name="R13"
				schRotation={-90}
				resistance="330k"
				footprint="0402"
				manufacturerPartNumber="0402WGF3303TCE"
				supplierPartNumbers={{ jlcpcb: ["C25778"] }}
				pcbX={-1.3}
				pcbY={-4}
				schX={8}
				schY={-5}
				connections={{ pin1: "net.BAT_ADC", pin2: "net.GND" }}
			/>
			<capacitor
				name="C14"
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={1.3}
				pcbY={-4}
				schX={10}
				schY={-5}
				connections={{ pin1: "net.BAT_ADC", pin2: "net.GND" }}
			/>
			<SM06B_SRSS_TB
				name="J3"
				schY={-2.5}
				schX={-4}
				pcbX={-4}
				pcbY={18.5}
				connections={{
					VREF: "net.V3V0",
					SWDIO: "net.SWDIO",
					GND: "net.GND",
					SWCLK: "net.SWCLK",
					NRST: "net.NRST",
					DEBUG_GPIO: "net.DEBUG_GPIO",
				}}
			/>
		</schematicsheet>

		<schematicsheet
			name="display"
			displayName="Display & Backlight"
			sheetIndex={3}
			sheetSize="A4"
		>
			{/* Display */}
			<AFC24_S15FIA_00
				name="J4"
				schHeight={2.445}
				schWidth={2.34}
				pcbX={-17}
				pcbY={0}
				pcbRotation={270}
				layer="top"
				schX={8}
				schY={0}
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
					VDD: "net.V3V0",
					RESET: "net.LCD_RESET",
					SDA: "net.LCD_MOSI",
					SCL: "net.LCD_SCK",
					CS: "net.LCD_CS",
					RS: "net.LCD_DC",
				}}
			/>
			<silkscreentext
				layer="top"
				text="LCD FPC / PIN 1"
				fontSize="0.5mm"
				pcbX={-14.5}
				pcbY={-7}
			/>

			<resistor
				name="R14"
				pcbY={8.5}
				pcbX={-15}
				schRotation={-90}
				resistance="22"
				footprint="0402"
				manufacturerPartNumber="0402WGF220JTCE"
				supplierPartNumbers={{ jlcpcb: ["C25092"] }}
				schX={3}
				schY={5}
				connections={{ pin1: "net.V3V0", pin2: "net.DISPLAY_LEDA" }}
			/>
			<A_2N7002
				name="Q1"
				pcbY={12.6}
				pcbX={-17}
				pcbRotation={180}
				schX={0}
				schY={0}
				connections={{
					gate: "net.LCD_BL_GATE",
					source: "net.GND",
					drain: "net.DISPLAY_LED_K",
				}}
			/>
			<resistor
				name="R15"
				pcbY={15.2}
				pcbX={-16.5}
				resistance="100"
				footprint="0402"
				manufacturerPartNumber="0402WGF1000TCE"
				supplierPartNumbers={{ jlcpcb: ["C25076"] }}
				schX={-6}
				schY={0}
				connections={{ pin1: "net.LCD_BL", pin2: "net.LCD_BL_GATE" }}
			/>
			<resistor
				name="R16"
				pcbY={15}
				pcbX={-11}
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1003TCE"
				supplierPartNumbers={{ jlcpcb: ["C25741"] }}
				schX={-3}
				schY={-4}
				schOrientation="vertical"
				connections={{ pin1: "net.LCD_BL_GATE", pin2: "net.GND" }}
			/>
			<capacitor
				name="C15"
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber="CC0402KRX7R7BB104"
				supplierPartNumbers={{ jlcpcb: ["C60474"] }}
				pcbX={-12.4}
				pcbY={13.1}
				schX={8}
				schY={5}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
		</schematicsheet>

		<schematicsheet
			name="sensors"
			displayName="Motion & RTC"
			sheetIndex={4}
			sheetSize="A4"
		>
			{/* Sensors */}
			<BMA456
				name="U2"
				pcbX={8}
				pcbY={-1}
				schX={-8}
				schY={3}
				noConnect={["ASDA", "ASCL"]}
				connections={{
					VDD: "net.V3V0",
					VDDIO: "net.V3V0",
					GND: "net.GND",
					GNDIO: "net.GND",
					CSB: "net.V3V0",
					SDO: "net.GND",
					SDA: "net.I2C_SDA",
					SCL: "net.I2C_SCL",
					INT1: "net.BMA_INT1",
					INT2: "net.BMA_INT2",
				}}
			/>
			<capacitor
				name="C16"
				schY={-3}
				schX={-5}
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={5.4}
				pcbY={-1}
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
			<capacitor
				name="C17"
				schY={-3}
				schX={-3.6}
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={10.6}
				pcbY={-1}
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>

			<PCF8563TS
				name="U4"
				schX={7.55}
				schWidth={1.756}
				pcbX={10}
				pcbY={-6}
				schY={3}
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
				schRotation={90}
				pcbRotation={180}
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
				pcbX={5}
				pcbY={-4}
				schX={4.45}
				schY={3}
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
				schRotation={-90}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber={cap100n.mpn}
				supplierPartNumbers={{ jlcpcb: [cap100n.jlc] }}
				pcbX={9}
				pcbY={-8}
				schX={6}
				schY={0}
				connections={{ pin1: "net.BAT", pin2: "net.GND" }}
			/>
			<resistor
				name="R17"
				schRotation={-90}
				resistance="10k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1002TCE"
				supplierPartNumbers={{ jlcpcb: ["C25744"] }}
				pcbX={11}
				pcbY={-8.2}
				schX={8.5}
				schY={0}
				connections={{ pin1: "net.V3V0", pin2: "net.RTC_INT" }}
			/>
		</schematicsheet>

		<schematicsheet
			name="interface"
			displayName="Buttons & Haptics"
			sheetIndex={5}
			sheetSize="A4"
		>
			{/* Controls & haptics */}
			<TS_1806SA_2x4x3_5DY_180X
				name="SW1"
				pcbY={-2}
				pcbX={20.2}
				pcbRotation={90}
				schX={-8}
				schY={3}
				noConnect={["EP1", "pin3_alt1"]}
				connections={{ pin1: "net.BUTTON1", pin2: "net.GND" }}
			/>
			<TS_1806SA_2x4x3_5DY_180X
				name="SW2"
				pcbX={20.2}
				pcbY={-10}
				pcbRotation={90}
				schX={0}
				schY={3}
				noConnect={["EP1", "pin3_alt1"]}
				connections={{ pin1: "net.BUTTON2", pin2: "net.GND" }}
			/>
			<resistor
				name="R19"
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1003TCE"
				supplierPartNumbers={{ jlcpcb: ["C25741"] }}
				pcbX={12}
				pcbY={3.4}
				schX={-8}
				schY={7}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.BUTTON1" }}
			/>
			<resistor
				name="R20"
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1003TCE"
				supplierPartNumbers={{ jlcpcb: ["C25741"] }}
				pcbX={14}
				pcbY={-9}
				schX={0}
				schY={7}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.BUTTON2" }}
			/>

			<MotorPads
				name="M1"
				schHeight={2.2}
				schPinArrangement={{
					topSide: ["MOTOR_POS"],
					bottomSide: ["MOTOR_NEG"],
					leftSide: [],
					rightSide: [],
				}}
				schWidth={1.9}
				schRotation={0}
				manufacturerPartNumber="LCM1234A3523F"
				supplierPartNumbers={{ jlcpcb: ["C7424783"] }}
				pcbX={13.3}
				pcbY={15}
				schX={8}
				schY={7}
				connections={{ MOTOR_POS: "net.V3V0", MOTOR_NEG: "net.MOTOR_NEG" }}
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
				pcbY={16.5}
				schX={8}
				schY={-1}
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
				pcbY={14.8}
				schX={2}
				schY={-1}
				connections={{ pin1: "net.MOTOR_EN", pin2: "net.MOTOR_GATE" }}
			/>
			<resistor
				name="R22"
				pcbY={9.5}
				pcbX={13}
				resistance="100k"
				footprint="0402"
				manufacturerPartNumber="0402WGF1003TCE"
				supplierPartNumbers={{ jlcpcb: ["C25741"] }}
				schX={5}
				schY={-5}
				schOrientation="vertical"
				connections={{ pin1: "net.MOTOR_GATE", pin2: "net.GND" }}
			/>
			<diode
				name="D2"
				footprint="sod323"
				manufacturerPartNumber="1N5819WS"
				supplierPartNumbers={{ jlcpcb: ["C5451629"] }}
				pcbX={9.5}
				pcbY={10.8}
				schX={13}
				schY={3}
				schOrientation="vertical"
				connections={{ anode: "net.MOTOR_NEG", cathode: "net.V3V0" }}
			/>
			<capacitor
				name="C23"
				capacitance="22uF"
				footprint="0805"
				manufacturerPartNumber="CL21A226MAQNNNE"
				supplierPartNumbers={{ jlcpcb: ["C45783"] }}
				pcbX={15}
				pcbY={12}
				schX={16}
				schY={-1}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
		</schematicsheet>
		<schematicsheet
			name="radio_clock"
			displayName="BLE Radio, Clocks and Local Supply"
			sheetIndex={6}
			sheetSize="A4"
		>
			<Crystal32MHz
				name="Y2"
				pcbX={1.4}
				pcbY={10}
				pcbRotation={90}
				schX={-10}
				schY={3}
				connections={{
					pin1: "net.HF_X1",
					pin3: "net.HF_X2",
					pin2: "net.GND",
					pin4: "net.GND",
				}}
			/>
			<Crystal32768
				name="Y3"
				schY={1.3}
				schX={0}
				pcbX={-11.3}
				pcbY={7.15}
				pcbRotation={270}
				connections={{ pin1: "net.LF_X1", pin2: "net.LF_X2" }}
			/>
			<ChipAntenna
				name="ANT1"
				pcbX={20.6}
				pcbY={5.8}
				schX={10}
				schY={-5}
				noConnect={["NC"]}
				connections={{ FEED: "net.RF_FEED" }}
			/>
			<inductor
				name="L2"
				inductance="3.9nH"
				footprint="0402"
				manufacturerPartNumber="LQG15HS3N9S02D"
				supplierPartNumbers={{ jlcpcb: ["C77109"] }}
				pcbX={1.6}
				pcbY={5}
				schX={2}
				schY={-5}
				connections={{ pin1: "net.RF_ANT", pin2: "net.RF_50" }}
			/>
			<inductor
				name="L3"
				pcbY={5.8}
				pcbX={15.8}
				inductance="6.8nH"
				footprint="0402"
				manufacturerPartNumber="LQG15HS6N8J02D"
				supplierPartNumbers={{ jlcpcb: ["C77110"] }}
				schX={6}
				schY={-5}
				connections={{ pin1: "net.RF_50", pin2: "net.RF_FEED" }}
			/>
			<capacitor
				name="C24"
				capacitance="0.8pF"
				footprint="0402"
				manufacturerPartNumber="GJM1555C1HR80WB01D"
				supplierPartNumbers={{ jlcpcb: ["C88902"] }}
				pcbX={1.5}
				pcbY={3.5}
				pcbRotation={0}
				schX={0}
				schY={-7}
				schOrientation="vertical"
				connections={{ pin1: "net.RF_ANT", pin2: "net.GND" }}
			/>
			<capacitor
				name="C25"
				schY={-1}
				schX={-11}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber="CC0402KRX7R7BB104"
				supplierPartNumbers={{ jlcpcb: ["C60474"] }}
				pcbX={-6.2}
				pcbY={1.4}
				pcbRotation={0}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
			<capacitor
				name="C26"
				schY={-1}
				schX={-9.6}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber="CC0402KRX7R7BB104"
				supplierPartNumbers={{ jlcpcb: ["C60474"] }}
				pcbX={3.8}
				pcbY={11.2}
				pcbRotation={0}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
			<capacitor
				name="C27"
				schY={-1}
				schX={-8.2}
				capacitance="100nF"
				footprint="0402"
				manufacturerPartNumber="CC0402KRX7R7BB104"
				supplierPartNumbers={{ jlcpcb: ["C60474"] }}
				pcbX={-5.7}
				pcbY={13}
				pcbRotation={0}
				schOrientation="vertical"
				connections={{ pin1: "net.V3V0", pin2: "net.GND" }}
			/>
			<capacitor
				name="C28"
				capacitance="12pF"
				footprint="0402"
				manufacturerPartNumber="0402CG120J500NT"
				supplierPartNumbers={{ jlcpcb: ["C1547"] }}
				pcbX={3.9}
				pcbY={9.3}
				pcbRotation={0}
				schX={-12}
				schY={1}
				schOrientation="vertical"
				connections={{ pin1: "net.HF_X1", pin2: "net.GND" }}
			/>
			<capacitor
				name="C29"
				capacitance="12pF"
				footprint="0402"
				manufacturerPartNumber="0402CG120J500NT"
				supplierPartNumbers={{ jlcpcb: ["C1547"] }}
				pcbX={0.5}
				pcbY={12}
				pcbRotation={0}
				schX={-8}
				schY={1}
				schOrientation="vertical"
				connections={{ pin1: "net.HF_X2", pin2: "net.GND" }}
			/>
			<capacitor
				name="C30"
				pcbY={10.5}
				pcbX={-12.8}
				capacitance="12pF"
				footprint="0402"
				manufacturerPartNumber="0402CG120J500NT"
				supplierPartNumbers={{ jlcpcb: ["C1547"] }}
				pcbRotation={0}
				schX={-2}
				schY={1}
				schOrientation="vertical"
				connections={{ pin1: "net.LF_X1", pin2: "net.GND" }}
			/>
			<capacitor
				name="C31"
				pcbY={3.4}
				pcbX={-11.5}
				capacitance="12pF"
				footprint="0402"
				manufacturerPartNumber="0402CG120J500NT"
				supplierPartNumbers={{ jlcpcb: ["C1547"] }}
				pcbRotation={0}
				schX={2}
				schY={1}
				schOrientation="vertical"
				connections={{ pin1: "net.LF_X2", pin2: "net.GND" }}
			/>
		</schematicsheet>
		<trace
			name="RF_CHIP_MATCH"
			from=".U1 > .ANT"
			to=".L2 > .pin1"
			width="0.18mm"
			pcbPathRelativeTo=".U1 > .ANT"
			pcbPath={[
				{ x: 3.9, y: -0.2 },
				{ x: 5.09, y: -1 },
			]}
		/>
		<trace
			name="RF_SHUNT"
			from=".L2 > .pin1"
			to=".C24 > .pin1"
			width="0.18mm"
			pcbStraightLine
		/>
		<trace
			name="RF_TRANSMISSION_LINE"
			from=".L2 > .pin2"
			to=".L3 > .pin1"
			width="0.34mm"
			pcbStraightLine
		/>
		<trace
			name="RF_ANTENNA_FEED"
			from=".L3 > .pin2"
			to=".ANT1 > .FEED"
			width="0.34mm"
			pcbStraightLine
		/>
		<keepout
			shape="rect"
			pcbX={20}
			pcbY={5.8}
			width={6}
			height={7}
			layers={["top", "inner1", "inner2", "bottom"]}
			excludeRefs={[".ANT1"]}
		/>
		<trace
			name="DEC3_LOCAL"
			from=".U1 > .DEC3"
			to=".C10 > .pin1"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .DEC3"
			pcbPath={[
				{ x: 5.8, y: 1 },
				{ x: 6.69, y: 0.5 },
			]}
		/>
		<trace
			name="HF_CLOCK1"
			from=".U1 > .XC1"
			to=".Y2 > .pin1"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .XC1"
			pcbPath={[
				{ x: 4, y: 1.4 },
				{ x: 5.95, y: 2.3 },
			]}
		/>
		<trace
			name="HF_CLOCK2"
			from=".U1 > .XC2"
			to=".Y2 > .pin3"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .XC2"
			pcbPath={[
				{ x: 3.7, y: 1.8 },
				{ x: 3.7, y: 4.7 },
			]}
		/>
		<trace
			name="HF_LOAD1"
			from=".Y2 > .pin1"
			to=".C28 > .pin1"
			width="0.15mm"
			pcbStraightLine
		/>
		<trace
			name="HF_LOAD2"
			from=".Y2 > .pin3"
			to=".C29 > .pin1"
			width="0.15mm"
			pcbStraightLine
		/>
		<trace
			name="LF_CLOCK1"
			from=".U1 > .XL1"
			to=".Y3 > .pin1"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .XL1"
			pcbPath={[{ x: -5.9, y: 1.8 }]}
		/>
		<trace
			name="LF_CLOCK2"
			from=".U1 > .XL2"
			to=".Y3 > .pin2"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .XL2"
			pcbPath={[{ x: -5.5, y: 1.4 }]}
		/>
		<trace
			name="LF_LOAD1"
			from=".Y3 > .pin1"
			to=".C30 > .pin1"
			width="0.15mm"
			pcbStraightLine
		/>
		<trace
			name="LF_LOAD2"
			from=".Y3 > .pin2"
			to=".C31 > .pin1"
			width="0.15mm"
			pcbStraightLine
		/>
		<trace
			name="RTC_CLOCK1"
			from=".U4 > .OSCI"
			to=".Y1 > .pin1"
			width="0.15mm"
			pcbStraightLine
		/>
		<trace
			name="RTC_CLOCK2"
			from=".U4 > .OSCO"
			to=".Y1 > .pin2"
			width="0.15mm"
			pcbPathRelativeTo=".U4 > .OSCO"
			pcbPath={[{ x: -6.15, y: 0.25 }]}
		/>
		<trace
			name="DEC4_LOCAL"
			from=".U1 > .DEC4"
			to=".C11 > .pin1"
			width="0.15mm"
			pcbPathRelativeTo=".U1 > .DEC4"
			pcbPath={[{ x: -1.4, y: 3.8 }]}
		/>
	</board>
);

export default SMARTWATCH_V1_NRF52810;
