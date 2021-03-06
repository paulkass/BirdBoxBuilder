var horizontalMarginFactor = 0.1;
var heightFactor = 0.5;
var menuHeight = heightFactor*window.innerHeight;

var tabsWidth = (1-2*horizontalMarginFactor)*window.innerWidth;

var iconLength = 0.5*tabsWidth;

var names = new Names();

var snap = false;
var canvasArray = []; // scene, camera, renderer, rotation

$("#menu_bar").tabs({
	collapsible: true,
	disabled: [1]
});
$("#menu_bar").hide();
$("#menu_bar").css({
	"right": horizontalMarginFactor*window.innerWidth,
	"left": horizontalMarginFactor*window.innerWidth,
	"width": tabsWidth
	// "height": menuHeight
});

for (var x=1; x<=4; x++) {
	var id_prefix = "tab"+x;
	document.getElementById(id_prefix).appendChild(getTable(3,4,id_prefix));
}

function enableSelectedObjectMenu() {
	$("#menu_bar").tabs("enable", 1);
	$("#tab2 button").attr("disabled", false);
}

function disableSelectedObjectMenu() {
	$("#menu_bar").tabs("disable", 1);
	$("#tab2 button").attr("disabled", true);
}

function getClickFunctionForName(name) {
	var returnFunction = function() {};
	switch (name) {
		case "tree1":
			returnFunction = function() {addTree("tree1");};
			break;
		case "tree2":
			returnFunction = function() {addTree("tree2");};
			break;
		case "plank":
			returnFunction = function() {addPlank();};
			break;
		case "house":
			// nothing for now
			break;
		case "bird_hole_plank":
			returnFunction = function() {addBirdHolePlank();};
			break;
		case "place": 
			returnFunction = function() {
				if(selectedObject) {
					addObjectToScene();
				}
			};
			break;
		case "unselect":
			returnFunction = function() {
				unselectCurrentObject();
			};
			break;
		case "toggle_space":
			returnFunction = function() {
				gizmo.setSpace( gizmo.space === "local" ? "world" : "local" );
			};
			break;
		case "snap_to_grid":
			returnFunction = function() {
				snap ? gizmo.setTranslationSnap(null) : gizmo.setTranslationSnap(1);
				snap ? gizmo.setRotationSnap(null) : gizmo.setRotationSnap( WORLD_ROTATION_SNAP );
				snap = !snap;
			};
			break;
		case "translate":
			returnFunction = function() {
				gizmo.setMode( "translate" );
			};
			break;
		case "rotate":
			returnFunction = function() {
				gizmo.setMode( "rotate" );
			};
			break;
		case "scale":
			returnFunction = function() {
				gizmo.setMode( "scale" );
			};
			break;
		case "zoom_in":
			returnFunction = function() {
				gizmo.setSize( gizmo.size + 0.1 );
			};
			break;
		case "zoom_out":
			returnFunction = function() {
				gizmo.setSize( Math.max( gizmo.size - 0.1, 0.1 ) );
			};
			break;
		case "camera_follows_object":
			returnFunction = function() {
				if (cameraFollowsObjectFlag) {
					cameraFollowsObjectFlag = false;
				} else {
					cameraFollowsObjectFlag = true;
				}
			};
			break;
		case "toggle_grid":
			returnFunction = function() {
				togglePlaneGrid();
			};
			break;
		default: 
			// not implemented
	}
	return returnFunction;
}

function lololol() {
				var house = objectPrototypeArray[objectWithNameIndex("house")].clone();
				house.position.x = 0;
				house.position.y = 0;
				house.position.z = 0;
				console.log(JSON.stringify(house.geometry));
				addSelectedObject(house, "house", false);
}

function populateObjectsMenu() {
	var objectCount = 0;
	var mainDiv = document.getElementById("tab1");
	
	var cellCount = 0;
	TYPES.forEach(function (type) {
		var objectArray = objectPrototypeArrayNames.filter(function (v) {
			return v.startsWith(type);
		});
		
		if (objectArray.length>0) {
			objectArray.forEach(function (name) {
				var element = document.getElementById("tab1_"+(Math.floor((cellCount)/4)+1)+""+((cellCount)%4+1));
				addButtonToElement(element, name);
				cellCount++;
			});
		} else {
			var element = document.getElementById("tab1_"+(Math.floor((cellCount)/4)+1)+""+((cellCount)%4+1));
			addButtonToElement(element, type);
			cellCount++;
		}
	});
	
	var selectedObjectDiv = document.getElementById("tab2");
	tableToAdd = getTable(3,4, "tab2");
	selectedObjectDiv.appendChild(tableToAdd);
	cellCount = 1;
	addButtonToElement(document.getElementById("tab2_11"), "place");
	addButtonToElement(document.getElementById("tab2_12"), "unselect");
	addButtonToElement(document.getElementById("tab2_21"), "toggle_space");
	addButtonToElement(document.getElementById("tab2_22"), "snap_to_grid");
	addButtonToElement(document.getElementById("tab2_23"), "translate");
	addButtonToElement(document.getElementById("tab2_24"), "rotate");
	addButtonToElement(document.getElementById("tab2_31"), "scale");
	addButtonToElement(document.getElementById("tab2_32"), "zoom_in");
	addButtonToElement(document.getElementById("tab2_33"), "zoom_out");
	addButtonToElement(document.getElementById("tab2_34"), "camera_follows_object");
	
	addButtonToElement(document.getElementById("tab3_11"), "toggle_grid");
	
}

function addButtonToElement(parent, childName) {
	var objectDiv = document.createElement("BUTTON");
	objectDiv.setAttribute("id", childName);
	objectDiv.setAttribute("class", "btn btn-success");
	objectDiv.onclick = function () { var x = getClickFunctionForName(childName); x();};
	var childText = names.getName(childName);
	objectDiv.appendChild(document.createTextNode(childText));
	objectDiv.setAttribute("style", "font-family: 'Dancing Script', cursive;");
	parent.appendChild(objectDiv);
}

function getTable(row, col, id_prefix) { // id prefix cannot contain underscores
	var table = document.createElement("TABLE");
	
	for (var r=1; r<=row; r++) {
		var ro = document.createElement("TR");
		for (var c=1; c<=col; c++) {
			var column = document.createElement("TD");
			column.setAttribute("id", id_prefix+"_"+r+""+c);
			ro.appendChild(column);
		}
		table.appendChild(ro);
	}
	
	return table;
}

function toggleMenuBar() {
	$("#menu_bar").toggle({
		effect: 'puff',
		easing: 'easeInOutSine'
	});
}