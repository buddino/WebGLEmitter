var size = 1,
    minVelocity = 0.7,
    velFactor = 2,
    gravity = 0.0001,
    particleCount = 5000,
    cloudsCount = 100;

var WIDTH = window.innerWidth - 4,
    HEIGHT = window.innerHeight - 4;

var VIEW_ANGLE = 50,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();
renderer.setSize(WIDTH, HEIGHT);

camera.position.z = 100;

var texLoader = new THREE.TextureLoader();

var particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: size,
            map: texLoader.load("img/better_drop.png"),
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: false
        }
    );

var clouds = new THREE.Geometry();
var cMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 100,
    map: texLoader.load("img/cloud.png"),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false
});

for (var p = 0; p < cloudsCount; p++) {
    var pX = Math.random() * 100 - 50,
        pY = Math.nrand(45, 5),
        pZ = Math.nrand(mean, std);
    var cloud = new THREE.Vector3(pX, pY, pZ);
    clouds.vertices.push(cloud);
}

var mean = 0;
var std = 100;
function randomizePosition() {
    for (var p = 0; p < particleCount; p++) {
        var pX = Math.nrand(mean, std),
            pY = Math.nrand(mean, std),
            pZ = Math.nrand(mean, std);
        particles.vertices[p].set(pX, pY, pZ);
    }
}

function moveParticles() {
    for (var p = 0; p < particleCount; p++) {
        particles.vertices[p].x += Math.nrand(0, 0.1);
        particles.vertices[p].y += Math.nrand(0, 0.1);
        particles.vertices[p].z += Math.nrand(0, 0.1);
    }
}

for (var p = 0; p < particleCount; p++) {
    var pX = 3 * Math.nrand(mean, std),
        pY = Math.nrand(55, 10);
    pZ = Math.nrand(mean, std);
    particle = new THREE.Vector3(pX, pY, pZ);
    //particle.velocity = new THREE.Vector3(0,-Math.max(minVelocity,Math.nrand(1,0.3)),0);
    particle.velocity = new THREE.Vector3(0, 0, 0);
    particles.vertices.push(particle);
    particle.birth = new Date().getTime();
    particle.waitTime = Math.random() * 2000;
}

var particleSystem = new THREE.Points(particles, pMaterial);
var cloudSystem = new THREE.Points(clouds, cMaterial);
particleSystem.sortParticles = true;
particleSystem.geometry.dynamic = true;
cloudSystem.geometry.dynamic = true;
scene.add(particleSystem);
scene.add(cloudSystem);
render();

function start() {
    document.body.appendChild(renderer.domElement);
    loadGUI();
}

var x = 0;
function render() {
    var now = new Date().getTime();

    //moveParticles();
    for (var c = 0; c < cloudsCount; c++) {
        clouds.vertices[c].x += Math.nrand(0.1, 0.01);
        clouds.vertices[c].z += Math.nrand(0.1, 0.01);
        if (clouds.vertices[c].x > 50) {
            clouds.vertices[c].x = Math.random() * 200 - 100;
        }
        if (clouds.vertices[c].z > 20) {
            clouds.vertices[c].z = Math.nrand(0, 100);
        }
    }
    for (var i = 0; i < particleCount; i++) {
        particle = particles.vertices[i];
        if (now - particle.birth > particle.waitTime) {

            if (particle.y < -30) {
                params.drops++;
                particle.velocity.y = 0;
                particle.y = 55;
                particle.waitTime = Math.random() * 1000;
                particle.birth = new Date().getTime();
            }
            else {
                particle.add(particle.velocity);
                particle.velocity.y -= (now - particle.birth) * gravity * Math.random() * 2;
            }
        }

    }
    particleSystem.geometry.verticesNeedUpdate = true;
    cloudSystem.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

var lastTime = 0;
var tick = 0.01;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        particleSystem.rotation.y += 0.01;
    }
    lastTime = timeNow;
}

