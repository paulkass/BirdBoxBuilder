var horizontalMarginFactor = 0.1;
var heightFactor = 0.3;

$("#menu_bar").tabs({
	collapsible: true
});
$("#menu_bar").hide();
$("#menu_bar").css({
	"right": horizontalMarginFactor*window.innerWidth,
	"left": horizontalMarginFactor*window.innerWidth,
	"width": (1-2*horizontalMarginFactor)*window.innerWidth,
	"height": heightFactor*window.innerHeight
});

function toggleMenuBar() {
	$("#menu_bar").toggle({
		effect: 'puff',
		easing: 'easeInOutSine'
	});
}