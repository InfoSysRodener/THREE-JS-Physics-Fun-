import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';
import gsap from 'gsap';
import CANNON, { Vec3 } from 'cannon';
const gui = new dat.GUI();

//scene
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
scene.scene.background = 0x000000;
scene.addOrbitControl();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
//lights
const directionalLight = new THREE.DirectionalLight(0xFFFFFF,1);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);

const ambiantLight = new THREE.AmbientLight(0xFFFFFF,1);
scene.add(ambiantLight);

//physic World
const world = new CANNON.World();
world.gravity.set(0, - 9.82,0);
world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);

//Materials 
const defaultMaterial =  new CANNON.Material('default')

const contactMaterial = new CANNON.ContactMaterial(
	defaultMaterial,
	defaultMaterial,
	{
		friction:0.1,
		restitution:0.7
	}
)

world.defaultContactMaterial = contactMaterial;

const sphereBody = new CANNON.Body({
	mass:1,
	position: new CANNON.Vec3(0,10,0),
	shape: new CANNON.Sphere(3),
})
sphereBody.applyLocalForce(new CANNON.Vec3(100,0,0), new CANNON.Vec3(0,0,0));
world.addBody(sphereBody);

//floor
const groundBody = new CANNON.Body({mass:0});
const groundShape = new CANNON.Plane();
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0),Math.PI * 0.5);
world.addBody(groundBody);


//plane
const width = 140;  
const height = 140;   
const geometry = new THREE.PlaneGeometry(width,height,50,50);
const material = new THREE.MeshPhongMaterial( { color: 0x333333} );
const plane = new THREE.Mesh(geometry,material);
plane.rotation.x = - Math.PI * 0.5;
scene.add(plane);


//sphere
const sphereGeometry = new THREE.SphereBufferGeometry(3,30,30);
const sphereMaterials = new THREE.MeshStandardMaterial();
sphereMaterials.color.set(0x112233);
const sphereMesh = new THREE.Mesh(sphereGeometry,sphereMaterials);
sphereMesh.position.set(0,10,0);
scene.add(sphereMesh);



const clock = new THREE.Clock();
let oldElapsedTime = 0;
const animate = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	world.step(1/60, deltaTime,3)
	
	sphereMesh.position.copy(sphereBody.position);

	scene.onUpdate();
	scene.onUpdateStats();
	requestAnimationFrame( animate );
};

animate();