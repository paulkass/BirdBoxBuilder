function BirdHolePlank(w, l, h, r, s) {
	THREE.Geometry.call(this);
	
	this.holeHeight = 0.5;
	
	// Initializing properties width defaults
	// **************************************
	this.width = 0;
	this.length = 0;
	this.height = 0;
	this.radius = 0;
	this.segments = 8;
	// **************************************
	// Setting up the object parameters with the passed in variables
	// **************************************
	if (!(w === undefined))
		this.width = w;
	if (!(l === undefined))
		this.length = l;
	if (!(h === undefined)) 
		this.height = h;
	if (!(r === undefined))
		this.radius = r;
	if (!(s === undefined) && s%4==0) 
		this.segments = s;
	// **************************************
	
	var plankVertices = [
		this.length, 0, this.width,// vector 0
		this.length, 0, -1*this.width,// 1
		-1*this.length, 0, this.width,// 2
		-1*this.length, 0, -1*this.width,// 3
		this.length, this.height, this.width,// 4
		this.length, this.height, -1*this.width,// 5
		-1*this.length, this.height, this.width,// 6
		-1*this.length, this.height, -1*this.width// 7
	];
	
	var circleVertices = [];
	var angle = 2*Math.PI/this.segments;
	for (var i=0; i<this.segments; i++) {
		circleVertices.push(Math.cos(i*angle), this.height*0.5+Math.sin(i*angle), this.width);
		circleVertices.push(Math.cos(i*angle), this.height*0.5+Math.sin(i*angle), -1*this.width);
	}
	
	var totalVertices = plankVertices.concat(circleVertices);
	
	for (var i=0; i<totalVertices.length; i+=3) {
		this.vertices.push(new THREE.Vector3(totalVertices[i], totalVertices[i+1], totalVertices[i+2]));
	}
	
	var planeFaces = [
		0,2,3,3,1,0,
		2,3,7,7,6,2,
		6,4,5,5,7,6,
		0,1,5,5,4,0
	];
	
	circleFaces = [];
	
	var quarter = 0;
	
	function addFaceEven(index) {
			var cornerIndex = 0;
			switch (quarter) {
				case 1:
					cornerIndex = 4;
					break;
				case 2:
					cornerIndex = 6;
					break;
				case 3:
					cornerIndex = 2;
					break;
				case 4:
					cornerIndex = 0;
					break;
				default:
					// do nothing
			}
			circleFaces.push(cornerIndex, index, index-2);
	}
	
	function addFaceOdd(index) {
			var cornerIndex = 0;
			switch (quarter) {
				case 1:
					cornerIndex = 5;
					break;
				case 2:
					cornerIndex = 7;
					break;
				case 3:
					cornerIndex = 3;
					break;
				case 4:
					cornerIndex = 1;
					break;
				default:
					// do nothing
			}
			circleFaces.push(cornerIndex, index, index-2);
	}
	
	for (var i=0; i<this.segments*2; i+=2) {
		var evenIndex = 8+i;
		var oddIndex = 8+1+i;
		if (i%(2*this.segments/4)==0) {
			switch (quarter) {
				case 0:
					circleFaces.push(0,4,evenIndex);
					//console.log("Here is the problem vertex: "+JSON.stringify(this.vertices[evenIndex]));
					circleFaces.push(1,5,oddIndex);
					break;
				case 1:
					circleFaces.push(4,6,evenIndex);
					circleFaces.push(5,7,oddIndex);
					break;
				case 2:
					circleFaces.push(6,2,evenIndex);
					circleFaces.push(7,3,oddIndex);
					break;
				case 3:
					circleFaces.push(2,0,evenIndex);
					circleFaces.push(1,3,oddIndex);
					break;
				default:
					// do nothing. maybe exit with an error later
			}
			if (quarter!=0) {
				addFaceEven(evenIndex);
				addFaceOdd(oddIndex);
			}
			quarter++;
		} else {
			addFaceEven(evenIndex);
			addFaceOdd(oddIndex);
		}
		
		// fill in a gap
		circleFaces.push(8,0,8+2*this.segments-2);
		circleFaces.push(9,1,9+2*this.segments-2);
		
		// The inside of the circle
		if (evenIndex+2<this.vertices.length) {
			circleFaces.push(evenIndex, oddIndex, evenIndex+2);
 			circleFaces.push(oddIndex, oddIndex+2, evenIndex+2);
 		}
 		
	}
	
	circleFaces.push(this.vertices.length-2, this.vertices.length-1, 8);
 	circleFaces.push(this.vertices.length-1, 9, 8);
	
	var facesArray = planeFaces.concat(circleFaces);
	//var facesArray = planeFaces;
	
	for (var i=0; i<facesArray.length; i+=3) {
		this.faces.push(new THREE.Face3(facesArray[i], facesArray[i+1], facesArray[i+2]));
	}
}

BirdHolePlank.prototype = Object.create(THREE.Geometry.prototype);
BirdHolePlank.prototype.constructor = BirdHolePlank;