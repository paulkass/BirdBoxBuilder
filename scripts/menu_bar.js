var horizontalMarginFactor = 0.1;
var heightFactor = 0.3;

var tabsWidth = (1-2*horizontalMarginFactor)*window.innerWidth;

var iconLength = 0.5*tabsWidth;

var canvasArray = []; // scene, camera, renderer, rotation

$("#menu_bar").tabs({
	collapsible: true
});
$("#menu_bar").hide();
$("#menu_bar").css({
	"right": horizontalMarginFactor*window.innerWidth,
	"left": horizontalMarginFactor*window.innerWidth,
	"width": tabsWidth,
	"height": heightFactor*window.innerHeight
});

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
				var objectDiv = document.createElement("SPAN");
				objectDiv.setAttribute("id", name);
				objectDiv.onclick = function () { var x = getClickFunctionForName(name); };
				objectDiv.appendChild(document.createTextNode(name+"\t"));
				mainDiv.appendChild(objectDiv);
			});
		} else {
			var objectDiv = document.createElement("SPAN");
			objectDiv.setAttribute("id", type);
			objectDiv.appendChild(document.createTextNode(type+"\t"));
			objectDiv.onclick = function () { var x = getClickFunctionForName(type); };
			mainDiv.appendChild(objectDiv);
		}
	});
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