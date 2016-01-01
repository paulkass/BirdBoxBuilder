var objectLoader = new THREE.ObjectLoader();
var treeScale = 0.3;

function placeTreeAtVector(vector) {
	// Accounting for details in the tree geometry
	// -------------------------------------------
	vector.setZ(vector.z+6*treeScale);
	vector.setX(vector.x-2.5*treeScale);
	// -------------------------------------------
	objectLoader.load("src/tree-05.json", function(obj) {
		var tree = getObjectWithPositionVector(obj, vector);
		tree.scale.set(treeScale, treeScale, treeScale);
		scene.add(tree);
	});
}

function getObjectWithPositionVector(object, vector) {
	object.position.x = vector.x;
	object.position.y = vector.y;
	object.position.z = vector.z;
	return object;
}