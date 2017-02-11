var particleCount = getParticlesCount(10000);
var particleSystem;
var size = 6,
    gravity = 1,
    attr = 0.01,
    opacity = 0.03,
    pressure = 1.0,
    BOUNDS = 700, //500
    WIDTH = 128, //128,
    viscosityConst = 0.03,
    rippleSize = 10.0,
    noiseAnimation = true,
    particlesAnimation = true,
    xSpread = 0.001,
    ySpread = 0.001,
    zSpread = 0.001,
    center = {x: 0, y: 0},
    width = window.innerWidth,
    height = window.innerHeight - 4,
    center = new THREE.Vector3(0, 0, 0),
    acc = new THREE.Vector3(0, -0.981, 0),

    renderer = new THREE.WebGLRenderer({autoClear: true, antialias: true}),
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300000),
    scene = new THREE.Scene(),
    clock = new THREE.Clock(),
    texLoader = new THREE.TextureLoader(),
    orbitControls = new THREE.OrbitControls(camera);

orbitControls.maxPolarAngle = 0.99 * Math.PI / 2;orbitControls.max
//Lights
var ambientLight = new THREE.AmbientLight(0x444444, 1.5);
var light = new THREE.DirectionalLight(0xffffbb, 1);
light.position.set(1100, 3200, 3000);
scene.add(ambientLight);
scene.add(light);

//CubeMap
var skyBoxMaterial = getSkyBoxMaterial('img/skyboxsun25degtest.png', 1024);
var deviation = 50;
var skyBox = new THREE.Mesh(
    new THREE.BoxGeometry(BOUNDS + deviation, BOUNDS + deviation, BOUNDS + deviation),
    skyBoxMaterial
);
scene.add(skyBox);
scene.rotateY(1.1 * Math.PI);

cube = new THREE.Mesh(new THREE.CubeGeometry(58, 30, 44), new THREE.MeshPhongMaterial({map: texLoader.load("img/marble.jpg")}));
cube.position.x = 36;
cube.position.y = 15;
cube.position.z = -20;
scene.add(cube);

function getParticlesCount(defaultCount) {
    var count = parseInt(window.location.hash.replace("#", ""));
    if (!isNaN(count) && count >= 0) {
        console.info("Particles: "+count);
        return count;
    }
    console.info("Particles: "+defaultCount);
    return defaultCount;
}