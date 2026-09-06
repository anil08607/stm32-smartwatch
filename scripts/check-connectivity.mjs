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
assert.equal(components.length, 65, "Unexpected missing/extra components");
assert.equal(nets.length, 41, "Unexpected missing/extra named nets");

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
	assert(pads[0].port_hints.includes(`pin${pin}`), `${name}.${pin}: wrong pad`);
}
for (const [name, gate, drain] of [
	["Q1", "LCD_BL_GATE", "DISPLAY_LED_K"],
	["Q2", "MOTOR_GATE", "MOTOR_NEG"],
]) {
	expectPinNet(name, 1, gate);
	expectPinNet(name, 2, "GND");
	expectPinNet(name, 3, drain);
}
for (const [pin, net] of [
	[2, "I2C_SCL"],
	[3, "I2C_SDA"],
	[4, "GND"],
	[9, "V3V3"],
	[10, "V3V3"],
	[11, "V1V8"],
	[12, "GND"],
	[13, "PPG_INT"],
])
	expectPinNet("U3", pin, net);

const board = records("pcb_board")[0];
assert.equal(board.width, 40, "Watch PCB must remain 40 mm");
assert.equal(board.height, 40);
assert.equal(board.num_layers, 4);
for (const point of board.outline) {
	assert(Math.abs(Math.hypot(point.x, point.y) - 20) < 0.01, "Noncircular PCB");
}
assert.equal(pcb("U3").layer, "bottom", "Optical sensor must face the wrist");
assert(Math.hypot(pcb("U3").center.x, pcb("U3").center.y) < 0.01);
for (const name of ["J1", "J2", "J3", "J4", "SW1", "SW2"]) {
	assert.equal(pcb(name).layer, "top", `${name} must stay off the skin side`);
}
for (const name of ["U3", "C18", "C19", "C20", "C21", "R18"]) {
	assert.equal(pcb(name).layer, "bottom", `${name} must stay with the sensor`);
	for (const pad of records("pcb_smtpad").filter(
		(item) => item.pcb_component_id === pcb(name).pcb_component_id,
	))
		assert.equal(pad.layer, "bottom", `${name}: pad on wrong layer`);
}
// A central 8.8 mm diameter assembly area is reserved for the optical interface.
// It is not a copper keepout: sensor pads and traces must still be routable.
for (const component of records("pcb_component")) {
	assert(!component.is_allowed_to_be_off_board, "Do not bypass board-edge DRC");
	if (component.layer !== "bottom" || component === pcb("U3")) continue;
	const dx = Math.max(0, Math.abs(component.center.x) - component.width / 2);
	const dy = Math.max(0, Math.abs(component.center.y) - component.height / 2);
	assert(
		Math.hypot(dx, dy) >= 4.4,
		"Component obstructs optical assembly area",
	);
}
console.log(
	`PASS: ${components.length} components, ${nets.length} distinct nets, no unexpected open pins or DRC diagnostics; MOSFET pin maps and 40 mm skin-facing placement verified.`,
);
