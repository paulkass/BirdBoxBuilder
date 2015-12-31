//  Some initial variables
//  **********************
var ANGLE_OF_ROTATION = Math.PI/600;
var LEFT_RIGHT_ROTATION_COEFFICIENT = 2;
var MOVEMENT_SPEED = 0.1; // "Units" per render tick
var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
var controlBox = Math.floor(Math.min(window.innerWidth, window.innerHeight)/4);
var mousePositionX = center[0];
var mousePositionY = center[1];

var middle = false;
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

function render() {
	if(middle)
		pan();
	else
		rotate();	
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();

function pan() {
	var worldProjection = camera.getWorldDirection();
	worldProjection.projectOnPlane(new THREE.Vector3(0,1,0)).normalize();
	var delta = 0;
	if(mousePositionY != mouseBuffer)
		delta = mousePositionY > mouseBuffer ? -.5 : .5;
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
			e.preventDefault();
			middle = true;
			mouseBuffer = mousePositionY;
			break;
		case 3:

			break;
	}
	});
	$("canvas").mouseup(function(e) {
	switch(e.which){
		case 1:

			break;
		case 2:
			e.preventDefault();
			mouseBuffer = center[1];
			middle = false;
			break;
		case 3:

			break;
		}
	});	
	$(document).keydown(function(e) {
		var key = e.key.toLowerCase();
		assignKeyMovementValues(true, key);
	});
	
	$(document).keyup(function(e) {
		var key = e.key.toLowerCase();
		assignKeyMovementValues(false, key);
	});
});
