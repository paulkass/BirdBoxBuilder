//  Some initial variables
//  **********************

// CONSTANTS
// ---------
var ANGLE_OF_ROTATION = Math.PI/600;
var LEFT_RIGHT_ROTATION_COEFFICIENT = 2;
var MOVEMENT_SPEED = 0.1; // "Units" per render tick
var RETICLE_RADIUS = 0.001;
var WORLD_TO_RETICLE_SCALAR = 0.2;
var WORLD_TO_PLANK_SCALAR = 10;
var OBJECT_SOURCES_ARRAY = ["tree1.json", "tree2.json", "house.json"];
var TYPES = ["tree", "plank", "house"];
// ---------

var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
var controlBox = Math.floor(Math.min(window.innerWidth, window.innerHeight)/4);
var mousePositionX = center[0];
var mousePositionY = center[1];

var rightButton = false;
var mouseBufferX = center[0];
var mouseBufferY = center[1];

var objectPrototypeArray = [];
var objectPrototypeArrayNames = [];
var objectIds = [];

var objectIdCount = 1;

var scene;
var camera;
var renderer;
var light;
var plane;
var grid;
var userReticle;

var selectedObject = 0; // the value is 0 if not used.
var selectedObjectMaterial = 0;
var selectedObjectType = ""; // empty string when there is no object to be used

var wireframeMaterial = material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});

var loadCount = 0;

//  **********************

function loadPromiseFunction(resolve2, reject2) {
	var length = OBJECT_SOURCES_ARRAY.length;
	if (loadCount<length) {	
		console.log(loadCount);
		console.log("hi");
		var name = OBJECT_SOURCES_ARRAY[loadCount].split("\.")[0]
		console.log(name);
		objectPrototypeArrayNames[loadCount] = name;
		var urlString = "src/"+name+".json";
		objectLoader.load(urlString, function(obj) {
			objectPrototypeArray[objectPrototypeArrayNames.indexOf(name)] = obj;
			loadCount++;
			if (loadCount==length) {
				reject2();
				console.log("lol");
			} else {
				resolve2();
			}
			setLoadingProgressBarValue(loadCount/length);
		});
	} else {
		loadCount = 0;
	}
}

function prep_func() {
	var promise = new Promise(function(resolve, reject) {
		var promise2 = new Promise(loadPromiseFunction);
		var x = function() {
			loadCount = 0;
			resolve();
		}
		var y = function() {
			promise2 = new Promise(loadPromiseFunction);
			promise2.then(y);
			promise2.catch(x);
		}
		loadCount = 0;
		promise2.then(y);
		promise2.catch(x);
	});
	promise.then(function() {
		$("#splash_screen").hide();
		console.log(JSON.stringify(objectPrototypeArrayNames));
		init();
		populateObjectsMenu();
	});
	promise.catch(function(e) {
		console.log(e);
	});
}

function setLoadingProgressBarValue(value) {
	$("#loading_progressbar").progressbar("value", Math.floor(value*100));
}

function objectWithNameIndex(name) {
	return objectPrototypeArrayNames.indexOf(name);
}

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	camera.position.y=3;
	camera.position.z=5;
	camera.lookAt(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set(0,0,50);
	scene.add(light);

	var planeGeometry = new THREE.PlaneGeometry(1000,1000, 1,1);
	planeGeometry.rotateX(Math.PI/2);
	var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
	plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.y=-0.5;
	scene.add(plane);

	grid = new THREE.GridHelper( 200, 10 );
	grid.setColors( 0x000000, 0x000000 );
	scene.add(grid);
	var axisHelper = new THREE.AxisHelper( 5 );
	scene.add(axisHelper);

	scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
	renderer.setClearColor( scene.fog.color, 1 );

	var userReticleMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
	var userReticleGeometry = new THREE.SphereGeometry(RETICLE_RADIUS, 100);
	userReticle = new THREE.Mesh(userReticleGeometry, userReticleMaterial);
	updateCameraReticle();
	scene.add(userReticle);
	
	setUpControlListeners();

	render();
}

function render() {
	if(rightButton) {
		pan();
	}
	rotate();	
	updateCameraReticle();
	updateSelectedObjectPosition();
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

function updateSelectedObjectPosition() {
	switch (selectedObjectType) {
		case "plank" :
			var cameraVector = camera.position.clone();
			var worldVector = camera.getWorldDirection().clone().normalize();
			var heldPos = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_PLANK_SCALAR));
			selectedObject.position.set(heldPos.x, heldPos.y, heldPos.z);
			selectedObject.lookAt(worldVector.add(cameraVector));
			break;
		case "tree":
			var placementVector = getPlacementSpot();
			selectedObject = placeTreeAtVector(selectedObject, placementVector);
			break;
		default:
			// do nothing for now
	}
}

function updateCameraReticle() {
	var cameraVector = camera.position.clone();
	var worldVector = camera.getWorldDirection().clone().normalize();
	var reticlePositionVector = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_RETICLE_SCALAR));
	userReticle.position.set(reticlePositionVector.x, reticlePositionVector.y, reticlePositionVector.z)
}

function pan() {
	var worldProjection = camera.getWorldDirection();
	worldProjection.projectOnPlane(new THREE.Vector3(0,1,0)).normalize();
	var strafeVector = worldProjection.clone().cross(new THREE.Vector3(0,1,0)).normalize().negate();
	var deltaX = (mouseBufferX -mousePositionX)/window.innerWidth;
	var deltaY = (mouseBufferY -mousePositionY)/window.innerHeight;
	camera.position.add(worldProjection.multiplyScalar(deltaY)).add(strafeVector.multiplyScalar(deltaX));
}
function rotate() {
	const worldVector = camera.getWorldDirection();
	var upVector = new THREE.Vector3(0,1,0);
	var tiltVector = new THREE.Vector3();
	tiltVector.crossVectors(worldVector.clone(),upVector.clone()).normalize();
	
	// Mouse Position -> Rotation Code
	// -------------------------------
	if (mousePositionX-center[0]>controlBox)
		worldVector.applyAxisAngle(upVector, -LEFT_RIGHT_ROTATION_COEFFICIENT*ANGLE_OF_ROTATION);
	
	if (mousePositionX-center[0]<-controlBox)
		worldVector.applyAxisAngle(upVector, LEFT_RIGHT_ROTATION_COEFFICIENT*ANGLE_OF_ROTATION);

	if (mousePositionY-center[1]>controlBox)
		worldVector.applyAxisAngle(tiltVector, -ANGLE_OF_ROTATION);

	if (mousePositionY-center[1]<-controlBox)
		worldVector.applyAxisAngle(tiltVector, ANGLE_OF_ROTATION);
	
	// --------------------------------------
	
	var cameraVector = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	camera.lookAt(worldVector.add(cameraVector));
}

function setUpControlListeners() {
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
			mouseBufferX = mousePositionX;
			mouseBufferY = mousePositionY;
			break;
	}
	});
	$(document).mouseup(function(e) {
		switch(e.which){
		case 1:

			break;
		case 2:

			break;
		case 3:
			rightButton = false;
			mouseBufferX = center[0];
			mouseBufferY = center[1];
			break;
		}
	});	

	$(document).keypress(function(e) {
		switch(e.keyCode){
		case 102: // F
			toggleMenuBar();
			break;
		case 32: // Space
			addObjectToScene();
		default:
			//alert(e.keyCode);
			break;
		}
	});
}

function addObjectToScene() {
	if (selectedObjectType=="plank") {
		selectedObject.material = selectedObjectOriginalMaterial;
	}
	clearSelectedObject();
	objectIds.push(selectedObjectType+""+(objectIdCount-1));
	console.log(JSON.stringify(objectIds));
}

function getPlacementSpot() {
	var ray = new THREE.Ray(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z), camera.getWorldDirection());
	var placementVector = new THREE.Vector3(0,0,0);
	if (false) {
		// This clause should be executed if the ray intersects another object other than the base plane
	} else {
		ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0), 0), placementVector);
	}
	return placementVector;
}

function addPlank () {
	var plankMaterial = new THREE.MeshLambertMaterial({color: 0x804000, fog: true});
	var plankGeometry = new THREE.BoxGeometry(1, 1, 1);
	var plank = new THREE.Mesh(plankGeometry, plankMaterial);
	addSelectedObject(plank, "plank");
}

function addTree (type) {
	var tree = getTree(type);
	addSelectedObject(tree, "tree");
}

function addSelectedObject(obj, type) {
	if (selectedObject != 0) {
		var currentObject = scene.getObjectByName(selectedObjectType+""+(objectIdCount-1));
		scene.remove(currentObject);
		clearSelectedObject();
	}
	selectedObject = obj;
	selectedObject.name = type+""+getObjectIdCount();
	if (type=="plank") {
		selectedObjectOriginalMaterial = selectedObject.material;
		selectedObject.material = wireframeMaterial;
	}
	scene.add(selectedObject);
	selectedObjectType = type;
}

function getObjectIdCount() {
	var returnCount = objectIdCount;
	objectIdCount++;
	return returnCount;
}

function clearSelectedObject() {
	selectedObject = 0;
	selectedObjectOriginalMaterial = 0;
	selectedObjectType = "";
}

$(document).ready(function() {
	$("#loading_progressbar").progressbar({
		value: 0
	});
	$("#loading_progressbar").css({ 'background': 'LightGreen' });
    $("#loading_progressbar > div").css({ 'background': 'LightBlue' });
	prep_func();
});
window.oncontextmenu = function() { return false };