var objectLoader = new THREE.ObjectLoader();
var treeScale = 0.3;

function placeTreeAtVector(type, vector) {
	// Accounting for details in the tree geometry
// 	-------------------------------------------
	vector.setZ(vector.z+6*treeScale);
	vector.setX(vector.x-2.5*treeScale);
// 	-------------------------------------------
	//console.log(JSON.stringify(objectPrototypeArray[0]));
	var tree = objectPrototypeArray[objectWithNameIndex(type)].clone();
	tree = getObjectWithPositionVector(tree, vector);
	tree.scale.set(treeScale, treeScale, treeScale);
	scene.add(tree);
	trees.push(tree);
}

function getObjectWithPositionVector(object, vector) {
	object.position.x = vector.x;
	object.position.y = vector.y;
	object.position.z = vector.z;
	return object;
}