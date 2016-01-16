function plankGeometry(w,l,h) {
	THREE.Geometry.call(this);
	
	var plankVertices = [
			l/2,-h/2,w/2,
			-l/2,-h/2,w/2,
			l/2,-h/2,-w/2,
			-l/2,-h/2,-w/2,
			l/2,h/2,w/2,
			-l/2,h/2,w/2,
			l/2,h/2,-w/2,
			-l/2,h/2,-w/2,
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
		this.vertices.push(new THREE.Vector3(plankVertices[i], plankVertices[i+1], plankVertices[i+2]));
	}
	
	for (var i=0; i<plankFaces.length; i+=3) {
		this.faces.push(new THREE.Face3(plankFaces[i], plankFaces[i+1], plankFaces[i+2]));
	}
}

plankGeometry.prototype = Object.create(THREE.Geometry.prototype);
plankGeometry.prototype.constructor = plankGeometry;