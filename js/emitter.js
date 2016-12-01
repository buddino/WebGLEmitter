var size = 2,
    gravity = 2,
    attr = 0.01,
    pressure = 1.0,
    particleCount = 10000;

opacity = 0.1;

var BOUNDS = 500;
var WIDTH = 128;
var systemDistance = 100;
var noiseAnimation = true;
var simplex = new SimplexNoise();
var mouseMoved = false;
var mouseCoords = new THREE.Vector2();
var xSpread = 0.001;
var ySpread = 0.001;
var zSpread = 0.001;
var center = {x: 0, y: 0};

var width = window.innerWidth,
    height = window.innerHeight - 4;
var center = new THREE.Vector3(0, 0, 0);
var acc = new THREE.Vector3(0, -0.981, 0);

//Init
renderer = new THREE.WebGLRenderer({autoClear: false, antialias: true});
camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300000);
var scene = new THREE.Scene();
var clock = new THREE.Clock();
var texLoader = new THREE.TextureLoader();

var orbitControls = new THREE.OrbitControls(camera);
orbitControls.autoRotate = true;

scene.add(new THREE.AmbientLight(0x444444));
var light = new THREE.DirectionalLight(0xffffbb, 1);
light.position.set(1100, 3200, 3000);
scene.add(light);

//Water Material
var waterNormals = new THREE.TextureLoader().load('img/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
var waterShader = new THREE.Water(renderer, camera, scene, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    alpha: 0.9,
    factor: 20,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffaa,
    waterColor: 0x777777,
    distortionScale: 10.0
});

//Water geometry
var waterGeometry = new THREE.PlaneGeometry(BOUNDS, BOUNDS, WIDTH, WIDTH);
waterShader.material.side = THREE.DoubleSide;
var water = new THREE.Mesh(waterGeometry, waterShader.material);
water.add(waterShader);
water.rotation.x = -Math.PI * 0.5;
water.position.y = 0;
scene.add(water);

//Heightmap
gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
var heightmap0 = gpuCompute.createTexture();
//fillTexture(heightmap0, 10);
heightmapVariable = gpuCompute.addVariable("heightmap", document.getElementById('heightmapFragmentShader').textContent, heightmap0);
gpuCompute.setVariableDependencies(heightmapVariable, [heightmapVariable]);
heightmapVariable.material.uniforms.mousePos = {value: new THREE.Vector2(10000, 10000)};
heightmapVariable.material.uniforms.mouseSize = {value: 5.0};
heightmapVariable.material.uniforms.viscosityConstant = {value: 0.03};
heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed(1);
var error = gpuCompute.init();
if (error !== null) {
    console.error(error);
}


//CubeMap
var skyBoxMaterial = getSkyBoxMaterial('img/skyboxsun25degtest.png', 1024);
var skyBox = new THREE.Mesh(
    new THREE.BoxGeometry(BOUNDS + 1000, BOUNDS + 1000, BOUNDS + 1000),
    skyBoxMaterial
);
scene.add(skyBox);

//var spG = new THREE.SphereGeometry(2,10,10);
//var spM = new THREE.MeshPhongMaterial({color:0xff0000});
//var sphere = new THREE.Mesh(spG,spM);
//sphere.position.y = 10;
//scene.add(sphere);
var manneken;
var mannekenNormals = new THREE.TextureLoader().load('img/bronze.jpg');
var loader = new THREE.STLLoader();
loader.load('models/m2.stl', function (mannekenGeom) {
    var material = new THREE.MeshPhongMaterial({
            color: 0x98A195,
            specular: 0x111111,
            shininess: 0
        }
    );
    manneken = new THREE.Mesh(mannekenGeom, material);
    manneken.rotateX(-Math.PI / 2);
    manneken.position.y = 30;
    scene.add(manneken);
});




camera.position.x = -146;
camera.position.y = 32;
camera.position.z = 176;
camera.rotation.x = -0.12;
camera.rotation.y = -0.72;
camera.rotation.z = -0.08;


renderer.setSize(width, height);

var particles = new THREE.Geometry();
var pMaterial = new THREE.PointsMaterial({
    color: 0x555555,
    size: size,
    opacity: opacity,
    sizeAttenuation: true,
    map: texLoader.load("img/particleT.png"),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});

//Create particles
for (var i = 0; i < particleCount; i++) {
    var particle = new THREE.Vector3(0, 0, 0);
    resetParticle(particle);
    particles.vertices.push(particle);
}


var particleSystem = new THREE.Points(particles, pMaterial);
particleSystem.geometry.dynamic = true;
particleSystem.sortParticles = true;
scene.add(particleSystem);

particleSystem.position.set(37,80,-10);

render();



function render() {
    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();
    //Update particles
    for (var i = 0; i < particleCount; i++) {
        var particle = particles.vertices[i];
        if (elapsed - particle.birth > particle.waitTime) {
            //New active particle
            if(particle.waitTime!=-1){
                particle.waitTime = -1;
                particle.x = 0;
                particle.y = 0;
                particle.z = 0;
            }

            if (particle.y <= -particleSystem.position.y) {
                center.x = (center.x + particle.x ) / 2;
                center.z = (center.z + particle.z ) / 2;
                if (Math.random() > 0.2 && particle.bounced < 3) {
                    particle.bounced++;
                    particle.speed.y = Math.nrand(0.10, 0.05);
                    particle.speed.x = Math.nrand(0, 0.05);
                    particle.speed.z = Math.nrand(0.1, 0.05);
                }
                //If bounced enough or not selected for bouncing
                else {
                    resetParticle(particle);
                }
            }
            //Update particle's paramenters
            particle.speed.y += acc.y * delta * gravity;
            particle.speed.x -= particle.speed.x * attr;
            particle.speed.z -= particle.speed.z * attr;
            //particle.speed.y -= particle.speed.y*attr+Math.random()/100-0.005;

            //Update particle position (adding the speed vector)
            particle.add(particle.speed);
        }
    }
    particleSystem.geometry.verticesNeedUpdate = true;
    //Ripples
    var uniforms = heightmapVariable.material.uniforms;
    //TODO Beautify the names
    var planeCenter = {x: center.x + particleSystem.position.x, z: center.z + particleSystem.position.z};
    uniforms.mousePos.value.set(planeCenter.x, planeCenter.z);


    gpuCompute.compute();
    water.material.uniforms.ripplesMap.value = gpuCompute.getCurrentRenderTarget(heightmapVariable).texture;
    if (noiseAnimation)
        waterShader.material.uniforms.time.value += 1.0 / 60.0;
    waterShader.render();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function resetParticle(particle) {
    particle.bounced = 0;
    particle.x = 10000;
    particle.y = 10000;
    particle.z = 10000;
    particle.speed = new THREE.Vector3(Math.nrand(0, xSpread), Math.nrand(0, ySpread), Math.nrand(pressure, zSpread));
    particle.birth = clock.getElapsedTime();
    particle.waitTime = Math.random() * 2;
}

function start() {
    document.body.appendChild(renderer.domElement);
    loadGUI();
}

function getSkyBoxMaterial(imageFile, size) {
    var cubeMap = new THREE.CubeTexture([]);
    cubeMap.format = THREE.RGBFormat;
    var loader = new THREE.ImageLoader();
    loader.load(imageFile, function (image) {
        var getSide = function (x, y) {
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var context = canvas.getContext('2d');
            context.drawImage(image, -x * size, -y * size);
            return canvas;
        };
        cubeMap.images[0] = getSide(2, 1); // px
        cubeMap.images[1] = getSide(0, 1); // nx
        cubeMap.images[2] = getSide(1, 0); // py
        cubeMap.images[3] = getSide(1, 2); // ny
        cubeMap.images[4] = getSide(1, 1); // pz
        cubeMap.images[5] = getSide(3, 1); // nz
        cubeMap.needsUpdate = true;
    });
    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;
    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    return skyBoxMaterial;
}

//Bindings
document.addEventListener('keydown', function (event) {
    if (event.key == 's') {
    }
}, false);


function setMouseCoords(x, y) {
    mouseCoords.set(( x / renderer.domElement.clientWidth ) * 2 - 1, -( y / renderer.domElement.clientHeight ) * 2 + 1);
    mouseMoved = true;
}
function onDocumentMouseMove(event) {
    setMouseCoords(event.clientX, event.clientY);
}

function fillTexture(texture, max) {
    var waterMaxHeight = max;

    function noise(x, y, z) {
        var multR = waterMaxHeight;
        var mult = 0.025;
        var r = 0;
        for (var i = 0; i < 15; i++) {
            r += multR * simplex.noise3d(x * mult, y * mult, z * mult);
            multR *= 0.53 + 0.025 * i;
            mult *= 1.25;
        }
        return r;
    }

    var pixels = texture.image.data;
    var p = 0;
    for (var j = 0; j < BOUNDS; j++) {
        for (var i = 0; i < BOUNDS; i++) {
            var x = i * WIDTH / 16;
            var y = j * WIDTH / 16;
            pixels[p + 0] = noise(x, y, 123.4);
            pixels[p + 1] = 0;
            pixels[p + 2] = 0;
            pixels[p + 3] = 1;
            p += 4;
        }
    }
}


