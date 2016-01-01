function returnTreeAtPosition(x,z) {
	var geometry = new THREE.CylinderGeometry(1,1,100,32,1,false);
	var material = new THREE.MeshBasicMaterial({color: 0x964b00});
	var tree = new THREE.Mesh(geometry, material);
	tree.position.y = 0;
	tree.position.x = x;
	tree.position.z = z;
	return tree;
}