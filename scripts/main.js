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
var ROTATION_UNIT = Math.PI/6;
var INITIAL_PLANK_DIMENSIONS = [0.25,1.5,1.5] // [width, length, height]
var WORLD_ROTATION_SNAP = Math.PI/12;
// ---------

var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
var mousePositionX = center[0];
var mousePositionY = center[1];

var grassPlanePower = 3;
var grassPlaneSize = 5*Math.pow(2, grassPlanePower);
var grassPlaneExtension = 300;
var grassMeshArray = [];

var tracerLines = [];
var tracerLineMaterial = new THREE.LineDashedMaterial({
	color: 0x0000ff,
	linewidth: 2,
	dashSize: 1,
	gapSize: 0.5
});

var mouseFlag = false;
var rightButton = false;
var mouseBufferX = center[0];
var mouseBufferY = center[1];

var objectPrototypeArray = [];
var objectPrototypeArrayNames = [];
var objectIds = [];

var objectIdCount = 1;

var controls = {};
var gizmo = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var scene;
var camera;
var renderer;
var light;
var plane;
var grid;
var userReticle;

var oldMatrix = null;
var selectedObject = 0; // the value is 0 if not used.
var selectedObjectMaterial = 0;
var selectedObjectType = ""; // empty string when there is no object to be used

var wireframeArray = [];

var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
    transparent: false
});

var loadCount = 0;

//  **********************

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function loadPromiseFunction(resolve2, reject2) {
	var length = OBJECT_SOURCES_ARRAY.length;
	if (loadCount<length) {	
		console.log(loadCount);
		var name = OBJECT_SOURCES_ARRAY[loadCount].split("\.")[0]
		console.log(name);
		objectPrototypeArrayNames[loadCount] = name;
		var urlString = "src/"+name+".json";
		objectLoader.load(urlString, function(obj) {
			objectPrototypeArray[objectPrototypeArrayNames.indexOf(name)] = obj;
			loadCount++;
			if (loadCount==length) {
				reject2();
			} else {
				resolve2();
			}
			setLoadingProgressBarValue(0.75*loadCount/length);
		});
	} else {
		loadCount = 0;
	}
}

function loadGrassMeshes(resolve, reject) {
	var planeGeometry = new THREE.PlaneBufferGeometry( grassPlaneSize, grassPlaneSize );

	var planeTexture = new THREE.CanvasTexture(generateTexture());

	for ( var i = 0; i < 15; i ++ ) {

		var material = new THREE.MeshLambertMaterial( {
			color: new THREE.Color().setHSL( 0.3, 0.75, ( i /15 ) * 0.4 + 0.1 ),
			map: planeTexture,
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		var mesh = new THREE.Mesh( planeGeometry, material );
		mesh.renderOrder = 100;

		mesh.position.y = i * 0.01;
		mesh.rotation.x = - Math.PI / 2;

		grassMeshArray.push(mesh);
		setLoadingProgressBarValue(0.75+0.25*i/15);
		console.log("Pushed a mesh. It's number is "+i);
	}
	resolve();
}

function prep_func() {
	var promise = new Promise(function(resolve, reject) {
		var promise2 = new Promise(loadPromiseFunction);
		var x = function() {
			loadCount = 0;
			//var meshPromiseLoad = new Promise(loadGrassMeshes);
			var meshPromiseLoad = new Promise(function(res, rej) {
				res();
			});
			meshPromiseLoad.then(function() {
				console.log("Done loading meshes.");
				resolve();
			});
			meshPromiseLoad.catch(function (e) {
				console.log(JSON.stringify(e));
			});
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
		
		// Set Up Menu Bar Opener
		$("#menu_bar_opener").css({
			"position": "absolute",
			"top": window.innerHeight*0.01,
			"left": window.innerWidth*0.005
		})
		.click(function(e) {
			toggleMenuBar();
		})
		.show();
		
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
	camera.lookAtVector = new THREE.Vector3(0,0,0);

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x003300 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '100px';
	document.body.appendChild( stats.domElement );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = false;
	controls.enableZoom = true;
	
	window.addEventListener( 'resize', onWindowResize, false );

	var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	scene.add(light);

	var planeGeometry = new THREE.PlaneGeometry(1000,1000, 1,1);
	planeGeometry.rotateX(Math.PI/2);
	var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: false});
	plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.y=-0.5;
	plane.name = "plane";
	scene.add(plane);
	
	gizmo = new THREE.TransformControls(camera, renderer.domElement);
	gizmo.setRotationSnap(WORLD_ROTATION_SNAP);
	gizmo.setMode("translate");

	//addGrassMeshPlane(grassMeshArray);
	
	console.log("Added meshes to scene");
	
	var geometry = new THREE.SphereGeometry( 100, 32, 32 );
	var material = new THREE.MeshLambertMaterial( {color: 0x33ccff} );
	material.side = THREE.DoubleSide;
	var sphere = new THREE.Mesh( geometry, material );
	scene.add( sphere );

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
	updateReticle(camera.position.clone(), camera.getWorldDirection().clone().normalize());
	scene.add(userReticle);
	
	setUpControlListeners();

	console.log("started rendering");
	render();
}

function addGrassMeshPlane(meshArray) {
	// var extent = Math.ceil(grassPlaneExtension/grassPlaneSize);
// 	for (var x = -extent; x<extent; x+=grassPlaneSize) {
// 		for (var z = -extent; z<extent; z+=grassPlaneSize) {
			meshArray.forEach(function (mesh) {
				var m = mesh.clone();
				// m.position.x = x;
// 				m.position.z = z;
				scene.add(m);
			});
		//}
	// }
}

function generateTexture() {

				var canvas = document.createElement( 'canvas' );
				canvas.width = 512*Math.pow(2, grassPlanePower);
				canvas.height = 512*Math.pow(2, grassPlanePower);

				var context = canvas.getContext( '2d' );

				for ( var i = 0; i < 20000*Math.pow(2, grassPlanePower*2); i ++ ) {

					context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50 ) + '%)';
					context.beginPath();
					context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
					context.fill();

				}

				//context.globalAlpha = 0.075;
				context.globalCompositeOperation = 'lighter';

				return canvas;

			}

function render() {
	updateSelectedObjectAndCamera();
	stats.update();
	scene.traverse(function (child) {
		if (child.position.y<0) {
			child.position.setY(0);
		}
	});
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

function updateSelectedObjectAndCamera() {
	var cameraVector = camera.position.clone();
	var worldVector = camera.getWorldDirection().clone().normalize();
	updateReticle(cameraVector, worldVector);
	 switch (selectedObjectType) {
		case "plank" :
 			// var heldPosVector = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_PLANK_SCALAR));
// 			//selectedObject.position.set(heldPosVector.x, heldPosVector.y, heldPosVector.z);
// 			camera.lookAt(selectedObject.position);
// 			updateReticle(cameraVector, worldVector);
// 			//selectedObject.lookAt(worldVector.add(cameraVector));
// 			selectedObject.updateMatrix();
			gizmo.update();
 			break;
 		case "tree":
			var placementVector = getPlacementSpot();
 			selectedObject = placeTreeAtVector(selectedObject, placementVector);
 			break;
 		default:
// 			// do nothing for now
 	}
 	
 	if (tracerLines.length != 0) {
 		tracerLines[0].geometry = getTracerGeometry(1);
 		tracerLines[1].geometry = getTracerGeometry(2);
 		tracerLines[2].geometry = getTracerGeometry(3);
 	}
}

function updateReticle (cameraVector, worldVector) {
	var reticleVector = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_RETICLE_SCALAR));
	userReticle.position.set(reticleVector.x, reticleVector.y, reticleVector.z);
}

function raycast () {
	// TESTING CODE
	// for (var i=0; i<scene.children.length; i++) {
// 		console.log("hi"+scene.children[i].name);
// 	}
	// ************
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(scene.children, true);
	var objectToBeSelected;
	if(intersects.length > 0 && intersects[0].object != selectedObject) {
		//for (var i = 0; i < intersects.length; i++) {
			//intersects[i].object.material.color.set(0xff0000);
			//console.log("LOl"+intersects[i].object.name);
			var i = 0;
			if(intersects[i].object.name.includes("plank")) {
				objectToBeSelected = intersects[i].object;
				oldMatrix = [objectToBeSelected.position.clone(), objectToBeSelected.quaternion.clone(), objectToBeSelected.scale.clone()];
				addSelectedObject(objectToBeSelected, "plank", true);
				return;
			} else if (intersects[i].object.parent.name.includes("tree")) {
				objectToBeSelected = intersects[i].object.parent;
				oldMatrix = [objectToBeSelected.position.clone(), objectToBeSelected.quaternion.clone(), objectToBeSelected.scale.clone()];
				addSelectedObject(objectToBeSelected, "tree", true);
			} else {
			
			}
		//};
	}
}

function rotateSelectedObject(direction) {
	var upVector = new THREE.Vector3(0,1,0);
	var orthVector = new THREE.Vector3(1,0,0);
	if (selectedObject!=0) {
		switch (direction) {
			case "up":
				selectedObject.rotateOnAxis(orthVector, -ROTATION_UNIT);
				break;
			case "down":
				selectedObject.rotateOnAxis(orthVector, ROTATION_UNIT);
				break;
			case "left":
				selectedObject.rotateOnAxis(upVector, -ROTATION_UNIT);
				break;
			case "right":
				selectedObject.rotateOnAxis(upVector, ROTATION_UNIT);
				break;
			default:
				console.log("rotateSelectedObject:: unknown direction "+direction);
		}
	}
}

function jumpCamera () {
	var cameraPosition = camera.position.clone();
	var placeVector = getPlacementSpot();
	placeVector.setY(camera.position.y);
	camera.position.copy(placeVector.clone());
	//console.log(JSON.stringify(cameraPosition));
	camera.lookAt(cameraPosition);
	camera.lookAtVector=cameraPosition.clone();
	
	controls.replaceConstraint(camera);
}

function setUpControlListeners() {
	$(document).mousemove(function(e) {
		mouseFlag = true;
		mousePositionX = e.pageX;
		mousePositionY = e.pageY;
		mouse.x = ( mousePositionX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( mousePositionY / window.innerHeight ) * 2 + 1;
	});
	$(document).dblclick(function(e) {
		switch(e.which){
			case 1:
				jumpCamera();
				break;
			default:
				break;
		}
	});

	$(document).mousedown(function(e) {
	mouseFlag = false;
	switch(e.which){
		case 1:
			break;
		default:
			break;
		}
	});
	$(document).mouseup(function(e) {
		switch(e.which){
		case 1:
			if (!mouseFlag)
				raycast();
			break;
		default:
			break;
		}
		mouseFlag = false;
	});
	$(document).keydown(function(e) {
		switch(e.keyCode){
			//to be changed into buttons
			case 81: // Q
				
				break;

			case 17: // Ctrl
				
				break;

			case 87: // W
				
				break;

			case 69: // E
				
				break;

			case 82: // R
				
				break;

			case 187:
			case 107: // +, =, num+
				
				break;

			case 189:
			case 109: // -, _, num-
				
				break;
				
			default:
				//alert(e.keyCode);
		}
	});
	$(document).keyup(function(e) {
		switch(e.keyCode){
			case 17: // Ctrl
				gizmo.setTranslationSnap(null);
				gizmo.setRotationSnap(null);
				break;
		}
	});	
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
	var plankMaterial = new THREE.MeshBasicMaterial({color: 0x804000, fog: true, transparent: false, side: THREE.DoubleSide});
	
	var plankGeometry = new THREE.Geometry();
	var plankVertices = [
			INITIAL_PLANK_DIMENSIONS[1]/2,-INITIAL_PLANK_DIMENSIONS[2]/2,INITIAL_PLANK_DIMENSIONS[0]/2,
			-INITIAL_PLANK_DIMENSIONS[1]/2,-INITIAL_PLANK_DIMENSIONS[2]/2,INITIAL_PLANK_DIMENSIONS[0]/2,
			INITIAL_PLANK_DIMENSIONS[1]/2,-INITIAL_PLANK_DIMENSIONS[2]/2,-INITIAL_PLANK_DIMENSIONS[0]/2,
			-INITIAL_PLANK_DIMENSIONS[1]/2,-INITIAL_PLANK_DIMENSIONS[2]/2,-INITIAL_PLANK_DIMENSIONS[0]/2,
			INITIAL_PLANK_DIMENSIONS[1]/2,INITIAL_PLANK_DIMENSIONS[2]/2,INITIAL_PLANK_DIMENSIONS[0]/2,
			-INITIAL_PLANK_DIMENSIONS[1]/2,INITIAL_PLANK_DIMENSIONS[2]/2,INITIAL_PLANK_DIMENSIONS[0]/2,
			INITIAL_PLANK_DIMENSIONS[1]/2,INITIAL_PLANK_DIMENSIONS[2]/2,-INITIAL_PLANK_DIMENSIONS[0]/2,
			-INITIAL_PLANK_DIMENSIONS[1]/2,INITIAL_PLANK_DIMENSIONS[2]/2,-INITIAL_PLANK_DIMENSIONS[0]/2,
	];
	var plankFaces = [
		2,3,1,1,0,2,
		0,4,6,6,2,0,
		1,5,7,7,3,1,
		0,1,5,5,4,0,
		4,6,7,7,5,4,
		2,6,7,7,3,2
	];
	
	for (var i=0; i<plankVertices.length; i+=3) {
		plankGeometry.vertices.push(new THREE.Vector3(plankVertices[i], plankVertices[i+1], plankVertices[i+2]));
	}
	
	for (var i=0; i<plankFaces.length; i+=3) {
		plankGeometry.faces.push(new THREE.Face3(plankFaces[i], plankFaces[i+1], plankFaces[i+2]));
	}
	plankGeometry.computeBoundingSphere();
	//var plankGeometry = new THREE.BoxGeometry(1, 1, 1);
	
	var plank = new THREE.Mesh(plankGeometry, plankMaterial);
	addSelectedObject(plank, "plank", false);
}

function addTree (type) {
	var tree = getTree(type);
	console.log("Adding a tree");
	addSelectedObject(tree, "tree", false);
}

function addSelectedObject(obj, type, existing) {
	if(selectedObject && existing)
		return;
	enableSelectedObjectMenu();
	if (selectedObject) {
//		var currentObject = scene.getObjectByName(selectedObjectType+""+(objectIdCount-1));
//		scene.remove(currentObject);
		clearSelectedObject(true, false);
	}
	selectedObject = obj;
	selectedObjectType = type;
	var cameraVector = camera.position.clone();
	var worldVector = camera.getWorldDirection().clone().normalize();
	var heldPosVector = cameraVector.add(worldVector.multiplyScalar(WORLD_TO_PLANK_SCALAR));
	selectedObject.position.set(heldPosVector.x, heldPosVector.y, heldPosVector.z);
	if(!existing) {
		selectedObject.name = type+""+getObjectIdCount();
	}
	if (type=="plank") {
		gizmo.attach(obj);
		scene.add(gizmo);
	}
	selectedObject.traverse(function (child) {
    	if ( child instanceof THREE.Mesh ) {
        	var wh = new THREE.WireframeHelper( child, 0xff0000 );
        	wh.name = "wireframe"+wireframeArray.length;
        	wireframeArray.push(wh);
        	scene.add( wh );
    	}
	});
	if(!existing) {
		for (var i=0; i<selectedObject.children.length; i++) {
			if (selectedObjectType == "tree") {
				selectedObject.children[i].name = "child_of_tree";
			}
		}
		console.log("Added an object with the name "+selectedObject.name);
		scene.add(selectedObject);
	}
	
	for (var i=1; i<=3; i++) {
		tracerLines.push(new THREE.Line(getTracerGeometry(i), tracerLineMaterial));
	}

	tracerLines.forEach(function(l) {
		scene.add(l);
	});
}

function getTracerGeometry(index) {
	var returnGeometry = new THREE.Geometry();
	if (selectedObject != 0) {
	switch (index) {
		case 1:
			var firstTracerGeometry = new THREE.Geometry();
			firstTracerGeometry.vertices.push(
				new THREE.Vector3(selectedObject.position.x, 0,0),
				new THREE.Vector3(selectedObject.position.x, 0, selectedObject.position.z)
			);
			returnGeometry = firstTracerGeometry.clone();
			break;
		case 2:
			var secondTracerGeometry = new THREE.Geometry(); 
			secondTracerGeometry.vertices.push(
				new THREE.Vector3(0,0,selectedObject.position.z),
				new THREE.Vector3(selectedObject.position.x, 0, selectedObject.position.z)
			);
			returnGeometry = secondTracerGeometry.clone();
			break;
		case 3:
			var thirdTracerGeometry = new THREE.Geometry();
			thirdTracerGeometry.vertices.push(
				new THREE.Vector3(selectedObject.position.x, 0, selectedObject.position.z),
				selectedObject.position.clone()
			);
			returnGeometry = thirdTracerGeometry.clone();
			break;
		default:
			//return an empty geometry
	}
	}
	return returnGeometry;
}

function unselectCurrentObject() {
	if(oldMatrix)
	{
		restoreCurrentObject(oldMatrix);
		oldMatrix = null;
	}
	else
		clearSelectedObject(true, true);
}

function getObjectIdCount() {
	var returnCount = objectIdCount;
	objectIdCount++;
	return returnCount;
}

function addObjectToScene() {
	disableSelectedObjectMenu();
//	if (selectedObjectType=="plank") {
// 		selectedObject.material = selectedObjectOriginalMaterial;
// 	}
	clearSelectedObject(false, true);
	objectIds.push(selectedObjectType+""+(objectIdCount-1));
	console.log(JSON.stringify(objectIds));
}

function restoreCurrentObject(oldMatrix) {
	disableSelectedObjectMenu();
	selectedObject.position.copy(oldMatrix[0].clone());
	selectedObject.quaternion.copy(oldMatrix[1].clone());
	selectedObject.scale.copy(oldMatrix[2].clone());
	addObjectToScene();
}

function clearSelectedObject(remove, disableMenu) {
	tracerLines.forEach(function (v) {
		scene.remove(v);
	});
	tracerLines = [];
	if(disableMenu)
		disableSelectedObjectMenu();
	if(selectedObjectType == "plank") {
		gizmo.detach();
		scene.remove(gizmo);
	}
	if(remove)
		scene.remove(selectedObject);
	wireframeArray.forEach(function (w) {
		scene.remove(w);
	});
	wireframeArray = [];
	selectedObject = 0;
	selectedObjectOriginalMaterial = 0;
	selectedObjectType = "";
	objectIds.splice(objectIdCount-1, 1);
	console.log(JSON.stringify(objectIds));
}

$(document).ready(function() {
	$("#menu_bar_opener").hide();
	$("#loading_progressbar").progressbar({
		value: 0
	});
	$("#loading_progressbar").css({ 'background': 'LightGreen' });
    $("#loading_progressbar > div").css({ 'background': 'LightBlue' });
	prep_func();
});
window.oncontextmenu = function() { return false };