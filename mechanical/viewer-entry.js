import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const canvas = document.querySelector("canvas"),
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(35, 1, 5, 1000);
camera.up.set(0, 0, 1);
camera.position.set(185, -220, 210);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 5);
controls.enableDamping = true;
scene.add(new THREE.HemisphereLight(0xffffff, 0x596270, 3));
const light = new THREE.DirectionalLight(0xffffff, 4);
light.position.set(50, -50, 100);
scene.add(light);
let model,
	manifest,
	amount = 0;
const loader = new GLTFLoader();
Promise.all([
	loader.loadAsync("complete-assembly.glb"),
	fetch("assembly-manifest.json").then((r) => r.json()),
])
	.then(([g, m]) => {
		manifest = m;
		model = g.scene;
		scene.add(model);
		document.querySelector("#parts").textContent =
			m.parts.length + " assembly solids";
		document.querySelector("#status").textContent = "Model loaded";
		update();
		model.traverse((n) => {
			if (n.isMesh) {
				if (n.material.transparent) {
					n.material.depthWrite = false;
					n.renderOrder = 10;
				}
				n.userData.start = n.position.z;
				n.userData.part = m.parts.find((p) => p.id === n.name);
			}
		});
	})
	.catch((e) => (document.querySelector("#status").textContent = e.message));
function update() {
	if (!model) return;
	model.traverse((n) => {
		if (n.isMesh && n.userData.part) {
			const p = n.userData.part;
			n.position.z = n.userData.start + p.explode * amount;
			n.visible = !(
				document.querySelector("#inside").checked &&
				[
					"case-base",
					"bezel",
					"lens",
					"strap--30",
					"strap-30",
					"strap-buckle",
					"buckle-tang",
					"strap-keeper",
				].includes(p.id)
			);
		}
	});
}
document.querySelector("#explode").oninput = (e) => {
	amount = Number(e.target.value);
	update();
};
document.querySelector("#inside").onchange = update;
document.querySelector("#detail").onclick = () => {
	camera.position.set(85, -95, 85);
	controls.target.set(0, 0, 5);
};
document.querySelector("#reset").onclick = () => {
	camera.position.set(185, -220, 210);
	controls.target.set(0, 0, 5);
};
function frame() {
	const r = canvas.getBoundingClientRect();
	if (
		canvas.width !== Math.round(r.width * renderer.getPixelRatio()) ||
		canvas.height !== Math.round(r.height * renderer.getPixelRatio())
	) {
		renderer.setSize(r.width, r.height, false);
		camera.aspect = r.width / r.height;
		camera.updateProjectionMatrix();
	}
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(frame);
}
frame();

const raycaster = new THREE.Raycaster();
canvas.addEventListener("click", (event) => {
	if (!model) return;
	const r = canvas.getBoundingClientRect();
	raycaster.setFromCamera(
		new THREE.Vector2(
			((event.clientX - r.left) / r.width) * 2 - 1,
			(-(event.clientY - r.top) / r.height) * 2 + 1,
		),
		camera,
	);
	const hit = raycaster
		.intersectObjects(model.children, true)
		.find((h) => h.object.visible);
	const part = hit?.object.userData.part;
	document.querySelector("#selection").textContent = part
		? `${part.id}: ${part.stage}`
		: "";
});
