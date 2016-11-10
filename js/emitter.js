var size = 5,
    gravity = 1,
    attr = 0.01,
    velFactor = 2,
    pressure = 0.5,
    particleCount = 1000,
    cloudsCount = 100;

var xSpread = 0.001;
var ySpread = 0.001;
var zSpread = 0.001;

var width = window.innerWidth - 500,
    height = window.innerHeight - 4;
var box = {x: 30, y: 10, z: 10};
var center = new THREE.Vector3(0, 0, 0);
var acc = new THREE.Vector3(0, -0.981, 0);

//Init
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
var scene = new THREE.Scene();
var clock = new THREE.Clock();
var texLoader = new THREE.TextureLoader();
var simplex = new SimplexNoise();

var orbitControls = new THREE.OrbitControls(camera);
orbitControls.autoRotate = true;


var floorTexture = texLoader.load("img/water.jpg");
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide, blending: THREE.NormalBlending, transparent: false, depthTest: true } );
var planeWidth = 1000;
var WIDTH = 32;
var floorGeometry = new THREE.PlaneGeometry(planeWidth, planeWidth, WIDTH, WIDTH);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.material.wireframe = true;
floor.position.y = -52;
floor.rotation.x = Math.PI / 2;
scene.add(floor);


camera.position.z = 100;
camera.position.y = 0;
camera.position.x = -50;

renderer.setSize(width, height);

var particles = new THREE.Geometry();

var pMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: size,
    opacity: 0.1,
    sizeAttenuation: true,
    map: texLoader.load("img/particle.png"),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false
});

//Create particles
for (var i = 0; i < particleCount; i++) {
    var particle = new THREE.Vector3(0, 0, 0);
    particle.enabled = true;
    resetParticle(particle);
    particles.vertices.push(particle);
}

var particleSystem = new THREE.Points(particles, pMaterial);
particleSystem.geometry.dynamic = true;
floor.geometry.dynamic = true;
scene.add(particleSystem);
render();

function render() {
    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();
    params.fps = 1 / delta;
    for (var i = 0; i < particleCount; i++) {
        var particle = particles.vertices[i];
        //if (particle.enabled) {
            if (elapsed - particle.birth > particle.waitTime) {
                particle.waitTime = 0;
                if (particle.y < -50) {
                    particle.enabled = false;
                    resetParticle(particle);
                }
                particle.speed.y += acc.y * delta * gravity;
                particle.speed.x -= particle.speed.x * attr;
                particle.speed.z -= particle.speed.z * attr;
                //particle.speed.y -= particle.speed.y*attr+Math.random()/100-0.005;
                particle.add(particle.speed);
            }
        //}
    }


    /// Noise











    ///

    particleSystem.geometry.verticesNeedUpdate = true;
    floor.geometry.verticesNeedUpdate = true;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function resetParticle(particle) {
    particle.x = 0;
    particle.y = 0;
    particle.z = 0;
    particle.speed = new THREE.Vector3(Math.nrand(0, xSpread), Math.nrand(0, ySpread), Math.nrand(pressure, zSpread));
    particle.birth = clock.getElapsedTime();
    particle.waitTime = Math.random()*2;
}

function start() {
    document.body.appendChild(renderer.domElement);
    loadGUI();
}


