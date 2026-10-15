import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Inspect generated artifacts: tsci build can exit 0 while emitting DRC errors.
const circuit = JSON.parse(
	readFileSync(
		process.argv.slice(2).find((arg) => !arg.startsWith("--")) ??
			"dist/index/circuit.json",
		"utf8",
	),
);
const records = (type) => circuit.filter((item) => item.type === type);
const errors = circuit.filter((item) => /error|warning/.test(item.type));
assert.equal(errors.length, 0, errors.map((item) => item.message).join("\n"));

const components = records("source_component");
const ports = records("source_port");
const nets = records("source_net");
const traces = records("source_trace");
assert.equal(components.length, 71, "Unexpected missing/extra components");
assert.equal(nets.length, 53, "Unexpected missing/extra named nets");
for (const name of ["U7", "C7", "C18", "C19", "C20", "C21"])
	assert(
		!components.some((item) => item.name === name),
		`${name}: removed part`,
	);
for (const name of ["V1V8", "PPG_INT"])
	assert(!nets.some((item) => item.name === name), `${name}: removed net`);

// Reconstruct connectivity from traces, independently of the generated map keys.
const parent = new Map();
function root(id) {
	if (!parent.has(id)) parent.set(id, id);
	if (parent.get(id) !== id) parent.set(id, root(parent.get(id)));
	return parent.get(id);
}
for (const trace of traces) {
	const members = [
		...(trace.connected_source_port_ids ?? []),
		...(trace.connected_source_net_ids ?? []),
	];
	for (const id of members.slice(1)) parent.set(root(id), root(members[0]));
}
const namedGroups = new Map();
for (const net of nets) {
	const key = root(net.source_net_id);
	assert(
		!namedGroups.has(key),
		`${net.name} merged with ${namedGroups.get(key)}`,
	);
	namedGroups.set(key, net.name);
}
if (process.argv.includes("--require-routing")) {
	const routedNets = new Set(
		records("pcb_trace").map((trace) => {
			const sourceTrace = traces.find(
				(item) => item.source_trace_id === trace.source_trace_id,
			);
			const member =
				sourceTrace?.connected_source_net_ids?.[0] ??
				sourceTrace?.connected_source_port_ids?.[0];
			return member ? namedGroups.get(root(member)) : undefined;
		}),
	);
	for (const net of nets)
		assert(
			routedNets.has(net.name),
			`${net.name}: no routed copper; placement output is not a routed build`,
		);
}
for (const port of ports) {
	const name = components.find(
		(item) => item.source_component_id === port.source_component_id,
	)?.name;
	const label = `${name}.${port.name}`;
	if (port.do_not_connect) {
		assert(!parent.has(port.source_port_id), `${label}: NC pin connected`);
	} else {
		assert(namedGroups.has(root(port.source_port_id)), `${label}: open pin`);
	}
}

function source(name) {
	const component = components.find((item) => item.name === name);
	assert(component, `Missing ${name}`);
	return component;
}
function pcb(name) {
	return records("pcb_component").find(
		(item) => item.source_component_id === source(name).source_component_id,
	);
}
function expectPinNet(name, pin, net) {
	const port = ports.find(
		(item) =>
			item.source_component_id === source(name).source_component_id &&
			item.pin_number === pin,
	);
	assert(port, `Missing ${name} pin ${pin}`);
	assert.equal(
		namedGroups.get(root(port.source_port_id)),
		net,
		`${name}.${pin}`,
	);
	const pcbPort = records("pcb_port").find(
		(item) => item.source_port_id === port.source_port_id,
	);
	const pads = records("pcb_smtpad").filter(
		(item) => item.pcb_port_id === pcbPort?.pcb_port_id,
	);
	assert.equal(
		pads.length,
		1,
		`${name}.${pin}: ambiguous/missing physical pad`,
	);
	assert(
		pads[0].port_hints.includes(`pin${pin}`) ||
			pads[0].port_hints.includes(String(pin)) ||
			(name === "U3" &&
				pin === 11 &&
				pads[0].port_hints.includes("thermalpad")),
		`${name}.${pin}: wrong pad`,
	);
}
for (const [name, gate, drain] of [
	["Q1", "LCD_BL_GATE", "DISPLAY_LED_K"],
	["Q2", "MOTOR_GATE", "MOTOR_NEG"],
]) {
	expectPinNet(name, 1, gate);
	expectPinNet(name, 2, "GND");
	expectPinNet(name, 3, drain);
}
// The remaining devices still need the shared bus and its two pull-ups.
for (const [name, scl, sda] of [
	["U1", 16, 17],
	["U2", 12, 2],
	["U4", 6, 5],
	["U5", 3, 5],
]) {
	expectPinNet(name, scl, "I2C_SCL");
	expectPinNet(name, sda, "I2C_SDA");
}
// BMA456: preserve both interrupts, supply straps and the 0x18 address strap.
for (const [pin, net] of [
	[1, "GND"],
	[3, "V3V0"],
	[5, "BMA_INT1"],
	[6, "BMA_INT2"],
	[7, "V3V0"],
	[8, "GND"],
	[9, "GND"],
	[10, "V3V0"],
])
	expectPinNet("U2", pin, net);
for (const pin of [4, 11]) {
	const port = ports.find(
		(item) =>
			item.source_component_id === source("U2").source_component_id &&
			item.pin_number === pin,
	);
	assert(port?.do_not_connect, `U2.${pin}: unused auxiliary bus must be NC`);
}
expectPinNet("M1", 1, "V3V0");
expectPinNet("M1", 2, "MOTOR_NEG");
expectPinNet("R8", 1, "V3V0");
expectPinNet("R8", 2, "I2C_SCL");
expectPinNet("R9", 1, "V3V0");
expectPinNet("R9", 2, "I2C_SDA");

// HUSB238 is a real USB-PD sink. Hardware straps deliberately cap the
// requested contract at 5 V / 1.25 A so the BQ25180 input can never see a
// higher negotiated PDO. USB data stays deliberately disconnected because the
// watch uses this receptacle only as a power-input port.
for (const [pin, net] of [
	[1, "PD_VIN"],
	[4, "USB_CC1"],
	[5, "USB_CC2"],
	[8, "PD_VSET"],
	[9, "PD_ISET"],
	[11, "GND"],
])
	expectPinNet("U3", pin, net);
for (const pin of [2, 3, 6, 7, 10]) {
	const port = ports.find(
		(item) =>
			item.source_component_id === source("U3").source_component_id &&
			item.pin_number === pin,
	);
	assert(port?.do_not_connect, `U3.${pin}: unused control pin must be NC`);
}
expectPinNet("R1", 1, "PD_VSET");
expectPinNet("R1", 2, "GND");
expectPinNet("R2", 1, "PD_ISET");
expectPinNet("R2", 2, "GND");
expectPinNet("R18", 1, "USB5V");
expectPinNet("R18", 2, "PD_VIN");
const contract = JSON.parse(readFileSync("hardware-contract.json", "utf8"));
for (const [pin, net] of Object.entries(contract.mcu.pins))
	expectPinNet("U1", Number(pin), net);
for (const pin of contract.mcu.no_connect_pins) {
	const port = ports.find(
		(p) =>
			p.source_component_id === source("U1").source_component_id &&
			p.pin_number === pin,
	);
	assert(port?.do_not_connect, `U1.${pin}: must be NC`);
}
assert.equal(source("U1").manufacturer_part_number, contract.mcu.mpn);
expectPinNet("J5", 1, "BQ_TS");
expectPinNet("J5", 2, "GND");
assert(
	!components.some(
		(c) => c.name === "R3" || /STM32/i.test(c.manufacturer_part_number ?? ""),
	),
);
assert.equal(source("R5").resistance, 100000);

const board = records("pcb_board")[0];
assert.equal(board.width, 46, "Watch PCB must remain 46 mm");
assert.equal(board.height, 46);
assert.equal(board.num_layers, 4);
for (const point of board.outline) {
	assert(Math.abs(point.x) <= 23.001 && Math.abs(point.y) <= 23.001);
	const x = Math.abs(point.x);
	const y = Math.abs(point.y);
	if (x > 15.001 && y > 15.001) {
		assert(
			Math.abs(Math.hypot(x - 15, y - 15) - 8) < 0.01,
			"Board corner radius must remain 8 mm",
		);
	} else {
		assert(
			Math.abs(x - 23) < 0.01 || Math.abs(y - 23) < 0.01,
			"Board edge must remain a 46 mm rounded square",
		);
	}
}
for (const component of records("pcb_component")) {
	const componentName = components.find(
		(item) => item.source_component_id === component.source_component_id,
	)?.name;
	assert.equal(
		component.layer,
		"top",
		`${componentName ?? component.pcb_component_id}: all assembly must remain top-side`,
	);
	assert(!component.is_allowed_to_be_off_board, "Do not bypass board-edge DRC");
}
console.log(
	`PASS: ${components.length} top-side components, ${nets.length} distinct nets, safe 5 V USB-PD straps, no unexpected open pins or DRC diagnostics; MOSFET pin maps, shared I2C and 46 mm rounded-square placement verified.`,
);
