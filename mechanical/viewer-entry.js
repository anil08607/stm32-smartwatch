import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const canvas = document.querySelector("canvas"),
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
camera.up.set(0, 0, 1);
camera.position.set(95, -115, 110);
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
		model.traverse((n) => {
			if (n.isMesh) {
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
				["case-base", "bezel", "lens", "strap--30", "strap-30"].includes(p.id)
			);
		}
	});
}
document.querySelector("#explode").oninput = (e) => {
	amount = Number(e.target.value);
	update();
};
document.querySelector("#inside").onchange = update;
document.querySelector("#reset").onclick = () => {
	camera.position.set(95, -115, 110);
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
