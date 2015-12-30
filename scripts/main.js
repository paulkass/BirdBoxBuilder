var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.y=3;
camera.position.z=5;
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var planeGeometry = new THREE.PlaneGeometry(1000,1000, 1,1);
planeGeometry.rotateX(Math.PI/2);
var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y=-0.5;
scene.add(plane)

var grid = new THREE.GridHelper( 200, 10 );
grid.setColors( 0x000000, 0x000000 );
scene.add( grid );

// var geometry = new THREE.PlaneGeometry( 20, 20, 32 );
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var plane = new THREE.Mesh( geometry, material );
// scene.add( plane );

scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
renderer.setClearColor( scene.fog.color, 1 );

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();