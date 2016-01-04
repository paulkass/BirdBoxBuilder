
$("#menu_bar").tabs({
	collapsible: true
});
$("#menu_bar").hide();
$("#menu_bar").css({
	"width": 0.9*window.innerWidth
});

function toggleMenuBar() {
	$("#menu_bar").toggle({
		effect: 'puff',
		easing: 'easeInOutSine'
	});
}