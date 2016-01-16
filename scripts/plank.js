function Plank(w,l,h) {
	THREE.Mesh.call(this, new plankGeometry(w,l,h), plankMaterial);
	
	this.getVectorsInWorldContext = function() {
		var arr = [];
		this.geometry.vertices.forEach( function(v) {
			arr.push(v.clone().applyMatrix4(this.matrixWorld));
		});
	};
	
	this.getSideClosestToPoint = function(point) {  // point is expected to be of type THREE.Vector3
	
	}; 
}

Plank.prototype = Object.create(THREE.Mesh.prototype);
Plank.prototype.constructor = Plank;