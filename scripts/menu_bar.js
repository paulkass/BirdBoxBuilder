var horizontalMarginFactor = 0.1;
var heightFactor = 0.5;
var menuHeight = heightFactor*window.innerHeight;

var tabsWidth = (1-2*horizontalMarginFactor)*window.innerWidth;

var iconLength = 0.5*tabsWidth;

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
	$("#tab2 > button").attr("disabled", false);
}

function disableSelectedObjectMenu() {
	$("#menu_bar").tabs("disable", 1);
	$("#tab2 > button").attr("disabled", true);
}

function getClickFunctionForName(name) {
	var returnFunction = function() {};
	switch (name) {
		case "tree1":
			returnFunction = addTree("tree1");
			break;
		case "tree2":
			returnFunction = addTree("tree2");
			break;
		case "plank":
			returnFunction = addPlank();
			break;
		case "place": 
			if(selectedObject) {
				addObjectToScene();
			}
			break;
		default: 
			// not implemented
	}
	return returnFunction;
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
	
}

function addButtonToElement(parent, childName) {
	var objectDiv = document.createElement("BUTTON");
	objectDiv.setAttribute("id", childName);
	objectDiv.setAttribute("class", "btn btn-success");
	objectDiv.onclick = function () { var x = getClickFunctionForName(childName); };
	objectDiv.appendChild(document.createTextNode(childName));
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