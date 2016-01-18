var snapDistance = 1;

function snap(plank1) {
	scene.children.forEach(function (plank2){
		if(plank2.name.includes("plank") && plank2.id != plank1.id)
		{
			// XZ plane snap
			// *************
			plank1.geometry.computeBoundingSphere();
			plank2.geometry.computeBoundingSphere();
			var d = plank2.worldToLocal(plank1.position.clone());
			var vertex1 = plank1.geometry.vertices[0].clone();
			var vertex2 = plank2.geometry.vertices[0].clone();
			var box1 = new THREE.Vector3(Math.abs(vertex1.x), Math.abs(vertex1.y), Math.abs(vertex1.z));
			var box2 = new THREE.Vector3(Math.abs(vertex2.x), Math.abs(vertex2.y), Math.abs(vertex2.z));
			var errorMargin = plank1.geometry.boundingSphere.radius +plank2.geometry.boundingSphere.radius +0.25;
			if( d.length() < errorMargin)
			{
				console.log("ready to snap");
				if(d.z > d.x && d.z > -d.x)//+z section of plane
				{
					d.setZ(box1.z +box2.z);
				}
				else if(d.z < d.x && d.z > -d.x)//+x section 
				{
					d.setX(box1.x +box2.x);
				}
				else if(d.z < d.x && d.z < -d.x)//-z section
				{
					d.setZ(-(box1.z +box2.z));
				}
				else if(d.z > d.x && d.z < -d.x)//-x section
				{
					d.setX(-(box1.x +box2.x));
				}
				//plank1.position.copy(plank2.localToWorld(d));
			}
			
			// ************
			
			// Y snap
			// ------------
			
			// plank1.updateMatrixWorld();
// 			plank2.updateMatrixWorld();
// 			
// 			var plank1Vertices = [];
// 			var plank2Vertices = [];
// 			
// 			plank1.geometry.vertices.forEach( function(v) {
// 				// This function should be efficianized
// 				plank1Vertices.push(v.clone().applyMatrix4(plank1.matrixWorld));
// 			});
// 			
// 			plank2.geometry.vertices.forEach( function(v) {
// 				plank2Vertices.push(v.clone().applyMatrix4(plank2.matrixWorld));
// 			});
			
			// function checkVertices() {
// 				plank1Vertices.forEach(function(v) {
// 					plank2Vertices.forEach(function(u) {
// 						var diff = u.clone().sub(v);
// 						if (diff.length() <= snapDistance && diff.length() >= 0.3*snapDistance) {
// 							// var quat = new THREE.Quaternion().setFromUnitVectors(v.clone().normalize(), u.clone().normalize());
// // 							var matrix = new THREE.Matrix4().makeRotationFromQuaternion(quat);
// // 							plank1.applyMatrix(matrix);
// 							console.log("snapping");
// 							plank1.position.add(diff);
// 						
// 						}
// 					});
// 				});
// 			}
			
			// ------------
			
			var closest1 = plank1.getSideClosestToPoint(plank2.position)[0];
			var closest2 = plank2.getSideClosestToPoint(plank1.position)[0];
			var diff = closest2.sub(closest1);
			
			if (diff.length() < snapDistance) {
				plank1.position.add(diff.clone());
			}
		}
	});

}