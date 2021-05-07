import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';
import gsap from 'gsap';
import CANNON from 'cannon';
const gui = new dat.GUI();

//scene
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
scene.scene.background = 0x000000;
scene.addOrbitControl();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


//texture woods
const texture = new THREE.TextureLoader();
const woodTexture = texture.load('/texture/woods/fine_grained_wood_col_1k.jpg');
const woodTextureAo = texture.load('/texture/woods/fine_grained_wood_ao_1k.jpg');
const woodTextureNormal = texture.load('/texture/woods/fine_grained_wood_normal_1k.jpg');
const woodTextureRough = texture.load('/texture/woods/fine_grained_wood_rough_1k.jpg');

//texture Sphere
const SphereTextureAo = texture.load('/texture/blocks/medieval_blocks_06_ao_1k.jpg');
const SphereTextureDiff = texture.load('/texture/blocks/medieval_blocks_06_diff_1k.jpg');
const SphereTextureDisp = texture.load('/texture/blocks/medieval_blocks_06_disp_1k.jpg');
const SphereTextureNor = texture.load('/texture/blocks/medieval_blocks_06_nor_1k.jpg');
const SphereTextureRough = texture.load('/texture/blocks/medieval_blocks_06_rough_1k.jpg');
const SphereTextureRoughAo = texture.load('/texture/blocks/medieval_blocks_06_rough_ao_1k.jpg');

//Floor Texture
const floorTextureAo = texture.load('/texture/floor/brick_floor_AO_1k.jpg');
const floorTextureBump = texture.load('/texture/floor/brick_floor_bump_1k.jpg');
const floorTextureDiff = texture.load('/texture/floor/brick_floor_diff_1k.jpg');
const floorTextureDisp = texture.load('/texture/floor/brick_floor_Disp_1k.jpg');
const floorTextureNor = texture.load('/texture/floor/brick_floor_nor_1k.jpg');
const floorTextureRough = texture.load('/texture/floor/brick_floor_rough_1k.jpg');
const floorTextureSpec = texture.load('/texture/floor/brick_floor_spec_1k.jpg');

// floorTextureDiff.wrapS = THREE.RepeatWrapping;
// floorTextureDiff.wrapT = THREE.RepeatWrapping;

//Dir lights
const directionalLight = new THREE.DirectionalLight(0xFFFFFF,1);
directionalLight.position.set(0,50,20);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.bottom = - 50;
directionalLight.shadow.camera.left = - 50;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const ambiantLight = new THREE.AmbientLight(0xFFFFFF,1);
scene.add(ambiantLight);

//Physics World
const world = new CANNON.World();
world.gravity.set(0, - 9.82,0);
world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);

//Physics Materials 
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

const objectToUpdate = [];

const geometrySphere = new THREE.SphereBufferGeometry(1,32,32);
const materialSphere = new THREE.MeshStandardMaterial({
	transparent : true,
	map : SphereTextureDiff,
	aoMap : SphereTextureAo,
	displacementMap : SphereTextureDisp,
	displacementScale : 1,
	normalMap : SphereTextureNor,
	roughnessMap : SphereTextureRough,
	roughness : SphereTextureRoughAo,
});

const createSphere = (radius,position) =>{
	const mesh = new THREE.Mesh(geometrySphere,materialSphere);
	mesh.scale.set(radius,radius,radius);
	mesh.castShadow = true;
	mesh.position.copy(position)
	scene.add(mesh);

	//Cannon js
	const shape = new CANNON.Sphere(radius);
	const body = new CANNON.Body({
		mass:1,
		position: new CANNON.Vec3(0,3,0),
		shape,
		material:defaultMaterial
	})
	body.position.copy(position)
	world.addBody(body);

	objectToUpdate.push({mesh,body});
}

const geometryBox = new THREE.BoxBufferGeometry(1,1,1);
const materialBox = new THREE.MeshStandardMaterial({
	map:woodTexture,
	transparent:true,
	aoMap:woodTextureAo,
	normalMap:woodTextureNormal,
	roughnessMap:woodTextureRough
});


const createBox = (width,height,depth,position) => {
	const mesh = new THREE.Mesh(geometryBox,materialBox);
	mesh.scale.set(width,height,depth);
	mesh.castShadow = true;
	mesh.position.copy(position)
	scene.add(mesh);

	const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
	const body = new CANNON.Body({
		mass:1,
		position: new CANNON.Vec3(0,0,0),
		shape,
		material:defaultMaterial
	})
	body.position.copy(position)
	world.addBody(body);

	objectToUpdate.push({mesh,body});
}
 

const debugObject = {}

debugObject.Sphere = () => {
	createSphere(Math.random() * 1.5,{
		x:(Math.random() - 0.5) * 10,
		y:10,
		z:(Math.random() - 0.5) * 10
	})
}

debugObject.Box = () => {
	createBox(
		1,1,4,
		{
			x:(Math.random() - 0.5) * 10,
			y:10,
			z:(Math.random() - 0.5) * 10
		}
	);
}
gui.add(debugObject,'Sphere').name('create Sphere');
gui.add(debugObject,'Box').name('create Box');

// createSphere(3,{x:0,y:5,z:0})
createBox(1,1,4,{x:-3,y:0,z:0})
createBox(1,1,4,{x:-2,y:0,z:0})
createBox(1,1,4,{x:-1,y:0,z:0})



//floor
const groundBody = new CANNON.Body({mass:0});
const groundShape = new CANNON.Plane();
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0),Math.PI * 0.5);
world.addBody(groundBody);

//plane
const width = 100;  
const height = 100;   
const geometry = new THREE.PlaneGeometry(width,height,100,100);
const material = new THREE.MeshPhongMaterial({
	transparent : true,
	map : floorTextureDiff,
	aoMap : floorTextureAo,
	bumpMap:floorTextureBump,
	displacementMap : floorTextureDisp,
	displacementScale : 0.1,
	normalMap : floorTextureNor,
	roughnessMap : floorTextureRough,
	specularMap:floorTextureSpec
});
const plane = new THREE.Mesh(geometry,material);
plane.rotation.x = - Math.PI * 0.5;
plane.receiveShadow = true;
scene.add(plane);


const clock = new THREE.Clock();
let oldElapsedTime = 0;
const animate = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	world.step(1/60, deltaTime, 3)
	
	objectToUpdate.map(obj => {
		obj.mesh.position.copy(obj.body.position)
		obj.mesh.quaternion.copy(obj.body.quaternion)
	});

	scene.onUpdate();
	scene.onUpdateStats();
	requestAnimationFrame( animate );
};

animate(); 