var objectLoader = new THREE.ObjectLoader();

function placeTreeAtVector(vector) {
	// Accounting for details in the tree geometry
	// -------------------------------------------
	vector.setZ(vector.z+6);
	vector.setX(vector.x-2.5);
	// -------------------------------------------
	objectLoader.load("src/tree-05.json", function(obj) {
		var tree = getObjectWithPositionVector(obj, vector);
		scene.add(tree);
	});
}

function getObjectWithPositionVector(object, vector) {
	object.position.x = vector.x;
	object.position.y = vector.y;
	object.position.z = vector.z;
	return object;
}