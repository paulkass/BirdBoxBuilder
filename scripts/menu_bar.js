var horizontalMarginFactor = 0.1;
var heightFactor = 0.3;

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
	"width": tabsWidth,
	"height": heightFactor*window.innerHeight
});

function enableSelectedObjectMenu() {
	$("#menu_bar").tabs("enable", 1);
}

function disableSelectedObjectMenu() {
	$("#menu_bar").tabs("disable", 1);
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
	mainDiv.appendChild(document.createElement("BR"));
	TYPES.forEach(function (type) {
		var objectArray = objectPrototypeArrayNames.filter(function (v) {
			return v.startsWith(type);
		});
		
		if (objectArray.length>0) {
			objectArray.forEach(function (name) {
				addSpanToElement(mainDiv, name);
			});
		} else {
			addSpanToElement(mainDiv, type);
		}
	});
	
	var selectedObjectDiv = document.getElementById("tab2");
	addSpanToElement(selectedObjectDiv, "place");
	
}

function addSpanToElement(parent, childName) {
	var objectDiv = document.createElement("SPAN");
	objectDiv.setAttribute("id", childName);
	objectDiv.setAttribute("class", "btn btn-success");
	objectDiv.onclick = function () { var x = getClickFunctionForName(childName); };
	objectDiv.appendChild(document.createTextNode(childName));
	parent.appendChild(objectDiv);
}

function menuBarRendering() {
	canvasArray.forEach(function (infoArray) {
		requestAnimationFrame( menuBarRendering );
		infoArray[2].render( infoArray[0], infoArray[1] );
	});
}

function toggleMenuBar() {
	$("#menu_bar").toggle({
		effect: 'puff',
		easing: 'easeInOutSine'
	});
}