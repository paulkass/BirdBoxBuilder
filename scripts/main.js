//  Some initial variables
//  **********************

// CONSTANTS
// ---------
var ANGLE_OF_ROTATION = Math.PI/600;
var LEFT_RIGHT_ROTATION_COEFFICIENT = 2;
var MOVEMENT_SPEED = 0.1; // "Units" per render tick
var RETICLE_RADIUS = 0.001;
var WORLD_TO_RETICLE_SCALAR = 0.2;
// ---------

var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
var controlBox = Math.floor(Math.min(window.innerWidth, window.innerHeight)/4);
var mousePositionX = center[0];
var mousePositionY = center[1];

var rightButton = false;
var mouseBuffer = center[1];

var moveForward = false;
var moveBackward = false;
var moveRight = false;
var moveLeft = false;

//  **********************

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.y=3;
camera.position.z=5;
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var planeGeometry = new THREE.PlaneGeometry(1000,1000, 1,1);
planeGeometry.rotateX(Math.PI/2);
var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y=-0.5;
scene.add(plane);

var grid = new THREE.GridHelper( 200, 10 );
grid.setColors( 0x000000, 0x000000 );
scene.add( grid );

scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
renderer.setClearColor( scene.fog.color, 1 );

var userReticleMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
var userReticleGeometry = new THREE.SphereGeometry(RETICLE_RADIUS, 100);
var userReticle = new THREE.Mesh(userReticleGeometry, userReticleMaterial);
updateCameraReticle();
scene.add(userReticle);

function render() {
	if(rightButton) {
		pan();
	}
	rotate();	
	updateCameraReticle();
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();

function updateCameraReticle() {
	var cameraVector = camera.position.clone();
	var worldVector = camera.getWorldDirection().clone().normalize();
	var reticlePositionVector = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_RETICLE_SCALAR));
	userReticle.position.x = reticlePositionVector.x;
	userReticle.position.y = reticlePositionVector.y;
	userReticle.position.z = reticlePositionVector.z;
	
}

function pan() {
	var worldProjection = camera.getWorldDirection();
	worldProjection.projectOnPlane(new THREE.Vector3(0,1,0)).normalize();
<<<<<<< HEAD
	var delta = (mouseBuffer -mousePositionY)/window.innerWidth;
=======
	var delta = 0;
	if(mousePositionY != mouseBuffer)
		delta = mousePositionY > mouseBuffer ? -.5 : .5;
>>>>>>> origin/master
	camera.position.add(worldProjection.multiplyScalar(delta));
}
function rotate() {
	const worldVector = camera.getWorldDirection();
	var upVector = new THREE.Vector3(0,1,0);
	var tiltVector = new THREE.Vector3();
	tiltVector.crossVectors(worldVector.clone(),upVector.clone()).normalize();
	
	// Mouse Position -> Rotation Code
	// -------------------------------
	if (mousePositionX-center[0]>controlBox) {
		worldVector.applyAxisAngle(upVector, -LEFT_RIGHT_ROTATION_COEFFICIENT*ANGLE_OF_ROTATION);
	}
	
	if (mousePositionX-center[0]<-controlBox) {
		worldVector.applyAxisAngle(upVector, LEFT_RIGHT_ROTATION_COEFFICIENT*ANGLE_OF_ROTATION);
	}
	
	if (mousePositionY-center[1]>controlBox) {
		worldVector.applyAxisAngle(tiltVector, -ANGLE_OF_ROTATION);
	}
	
	if (mousePositionY-center[1]<-controlBox) {
		worldVector.applyAxisAngle(tiltVector, ANGLE_OF_ROTATION);
	}
	
	// -------------------------------
	
	// Key Pressed -> Camera Lateral Movement
	// --------------------------------------
	
	var worldVector2 = worldVector.clone();
	var normWorldVector = worldVector2.clone().normalize();
	var projOntoXZPlane = worldVector2.clone().projectOnPlane(upVector);
	var lateralVector = projOntoXZPlane.cross(upVector).normalize();
	
	if (moveForward) {
		assignCameraPositions(normWorldVector.x, normWorldVector.y, normWorldVector.z);
	}
	
	if (moveBackward) {
		assignCameraPositions(-normWorldVector.x, -normWorldVector.y, -normWorldVector.z);
	}
	
	if (moveRight) {
		assignCameraPositions(lateralVector.x, 0, lateralVector.z);
	}
	
	if (moveLeft) {
		assignCameraPositions(-lateralVector.x, 0, -lateralVector.z);
	}
	
	// --------------------------------------
	
	var cameraVector = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	camera.lookAt(worldVector.add(cameraVector));
}

function assignCameraPositions(x,y,z) {
	
	camera.position.x = camera.position.x+MOVEMENT_SPEED*x;
	
	var potentialCameraY = camera.position.y+MOVEMENT_SPEED*y;
	var cameraValueY = 0.1;
	if (potentialCameraY>=0.1) {
		cameraValueY = potentialCameraY;
	}
	camera.position.y = cameraValueY;
	camera.position.z = camera.position.z+MOVEMENT_SPEED*z;
}

function assignKeyMovementValues(value, key) {
	switch (key) {
			case "w": 
				moveForward = value;
			break;
			case "s":
				moveBackward = value;
			break;
			case "d":
				moveRight = value;
			break;
			case "a":
				moveLeft = value;
			break;
			default:
				// do nothing
		}
}

function addPlank () {
	var worldVector = camera.getWorldDirection().clone().normalize();
	var placeVector = userReticle.position.clone().add(worldVector.multiplyScalar(2 -WORLD_TO_RETICLE_SCALAR));
	var plankMaterial = new THREE.MeshBasicMaterial({color: 0x804000, fog: true});
	var plankGeometry = new THREE.BoxGeometry(1, 1, 1);
	var plank = new THREE.Mesh(plankGeometry, plankMaterial);
	plank.position.set(placeVector.x, placeVector.y, placeVector.z);
	scene.add(plank);
}

$(document).ready(function() {
	$("canvas").mousemove(function(e) {
		mousePositionX = e.pageX;
		mousePositionY = e.pageY;
	});
	$("canvas").mousedown(function(e) {
	switch(e.which){
		case 1:

			break;
		case 2:

			break;
		case 3:
			rightButton = true;
			mouseBuffer = mousePositionY;
			break;
	}
	});
<<<<<<< HEAD
	$(document).mouseup(function(e) {
		switch(e.which){
=======
	$("canvas").mouseup(function(e) {
	switch(e.which){
>>>>>>> origin/master
		case 1:

			break;
		case 2:

			break;
		case 3:
			rightButton = false;
			mouseBuffer = center[1];
			break;
		}
	});	
	$(document).keydown(function(e) {
//		var key = e.key.toLowerCase();
		assignKeyMovementValues(true, e.key);
	});
	
	$(document).keyup(function(e) {
//		var key = e.key.toLowerCase();
		assignKeyMovementValues(false, e.key);
	});
	$(document).keypress(function(e) {
		switch(e.keyCode){
		case 49:
			addPlank();
			break;
		default:
			break;
		}
	});
});
window.oncontextmenu = function() { return false };