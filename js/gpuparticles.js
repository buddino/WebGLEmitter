var WIDTH = window.innerWidth - 4,
    HEIGHT = window.innerHeight - 4;
var VIEW_ANGLE = 50,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();

var particles = new THREE.Geometry()

for (var p = 0; p < 1000; p++) {
    var pX = Math.nrand(50, 100);
    var pY = Math.nrand(50, 100);
    var pZ = Math.nrand(50, 100);
    particles.vertices.push(new THREE.Vector3(pX, pY, pZ));

    //particle.velocity = new THREE.Vector3(0,-Math.max(minVelocity,Math.nrand(1,0.3)),0);
    /*
     particle.velocity = new THREE.Vector3(0, 0, 0);
     particles.vertices.push(particle);
     particle.birth = new Date().getTime();
     particle.waitTime = Math.random() * 2000;
     */
}
var particle = new THREE.Vector3(pX, pY, pZ);
var pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 10
    }
);
var particleSystem = new THREE.Points(particles, pMaterial);
scene.add(particleSystem);


function start() {
    document.body.appendChild(renderer.domElement);
}