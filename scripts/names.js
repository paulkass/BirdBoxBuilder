
var Names = function() {
	this.names = {
		"tree1": "Tree Variant 1",
		"tree2": "Tree Variant 2",
		"plank": "Plank",
		"house": "House",
		"place": "Place Object",
		"unselect": "Unselect Object",
		"toggle_space": "Toggle global/local space",
		"snap_to_grid": "Toggle snap to grid",
		"translate": "Set Translation Mode",
		"rotate": "Set rotation Mode",
		"scale": "Set Scaling Mode",
		"zoom_in": "Enlarge Gizmo",
		"zoom_out": "Shrink Gizmo"
	}
	
	this.getName = function(value) {
		console.log(JSON.stringify(this.names[value]));
		return this.names[value];
	}
};