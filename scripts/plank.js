function Plank(w,l,h) {
	THREE.Mesh.call(this, new plankGeometry(w,l,h), plankMaterial);
	
	this.getVectorsInWorldContext = function() {
		var arr = [];
		this.geometry.vertices.forEach( function(v) {
			arr.push(v.clone().applyMatrix4(this.matrixWorld));
		});
		return arr;
	};
	
	this.getSideClosestToPoint = function(point) {  // point is expected to be of type THREE.Vector3
		var sortedVectorArr = [];
		var unsortedVectorArr = this.getVectorsInWorldContext();
		for (var trol = 0; trol<4; trol++) {
			var shortestVector = new THREE.Vector3(Global.Infinity, Global.Infinity, Global.Infinity);
			var shortestVectorIndex = 0;
			unsortedVectorArr.forEach(function (v, i) {
				if (v.clone().sub(point).length() < shortestVector.clone().sub(point).length()) {
					shortestVector.copy(v);
					shortestVectorIndex = i;
				}
			});
			unsortedVectorArr.splice(shortestVectorIndex, 0);
			sortedVectorArr.push(shortestVector.clone());
		}
		
		return sortedVectorArr;
	}; 
}

Plank.prototype = Object.create(THREE.Mesh.prototype);
Plank.prototype.constructor = Plank;