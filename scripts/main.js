//  Some initial variables
//  **********************
var ANGLE_OF_ROTATION = Math.PI/200;
var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)]
var controlBox = Math.floor(Math.min(window.innerWidth, window.innerHeight)/4);
var mousePositionX = center[0];
var mousePositionY = center[1];
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
scene.add(plane)

var grid = new THREE.GridHelper( 200, 10 );
grid.setColors( 0x000000, 0x000000 );
scene.add( grid );

scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
renderer.setClearColor( scene.fog.color, 1 );

function render() {
	var worldVector = camera.getWorldDirection();
	
	// Mouse Position -> Rotation Code
	// -------------------------------
	if (mousePositionX-center[0]>controlBox) {
		worldVector.applyAxisAngle(new THREE.Vector3(0,1,0), -ANGLE_OF_ROTATION);
	}
	
	if (mousePositionX-center[0]<-controlBox) {
		worldVector.applyAxisAngle(new THREE.Vector3(0,1,0), ANGLE_OF_ROTATION);
	}
	
	if (mousePositionY-center[1]>controlBox) {
		worldVector.applyAxisAngle(new THREE.Vector3(1,0,0), -ANGLE_OF_ROTATION);
	}
	
	if (mousePositionY-center[1]<-controlBox) {
		worldVector.applyAxisAngle(new THREE.Vector3(1,0,0), ANGLE_OF_ROTATION);
	}
	
	// -------------------------------
	
	var cameraVector = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	camera.lookAt(worldVector.add(cameraVector));
	
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();

$(document).ready(function() {
	document.captureEvents(Event.MOUSEMOVE)
	document.onmousemove = function (e) {
		mousePositionX = e.pageX;
		mousePositionY = e.pageY;
	};
});

