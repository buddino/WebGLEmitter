var size = 10,
    gravity = 2,
    attr = 0.01,
    pressure = 0.5,
    particleCount = 1000;

var BOUNDS = 1000;
var WIDTH = 128;
var systemDistance = 100;
var noiseAnimation = false;
var simplex = new SimplexNoise();
var mouseMoved = false;
var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var xSpread = 0.001;
var ySpread = 0.001;
var zSpread = 0.001;

var width = window.innerWidth,
    height = window.innerHeight - 4;
var center = new THREE.Vector3(0, 0, 0);
var acc = new THREE.Vector3(0, -0.981, 0);

//Init
var renderer = new THREE.WebGLRenderer();
camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 300000);
var scene = new THREE.Scene();
var clock = new THREE.Clock();
var texLoader = new THREE.TextureLoader();

var orbitControls = new THREE.OrbitControls(camera);
orbitControls.autoRotate = true;

scene.add(new THREE.AmbientLight(0x444444));
var light = new THREE.DirectionalLight(0xffffbb, 1);
light.position.set(-4000, 3200, -5000);
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
fillTexture(heightmap0,0);
heightmapVariable = gpuCompute.addVariable("heightmap", document.getElementById('heightmapFragmentShader').textContent, heightmap0);
gpuCompute.setVariableDependencies(heightmapVariable, [heightmapVariable]);
heightmapVariable.material.uniforms.mousePos = {value: new THREE.Vector2(10000, 10000)};
heightmapVariable.material.uniforms.mouseSize = {value: 10.0};
heightmapVariable.material.uniforms.viscosityConstant = {value: 0.06};
heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed(1);
var error = gpuCompute.init();
if (error !== null) {
    console.error(error);
}


//CubeMap
var skyBoxMaterial = getSkyBoxMaterial('img/skyboxsun25degtest.png', 1024);
var skyBox = new THREE.Mesh(
    new THREE.BoxGeometry(BOUNDS+1000, BOUNDS+1000, BOUNDS+1000),
    skyBoxMaterial
);
scene.add(skyBox);


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
    opacity: 0.05,
    sizeAttenuation: true,
    map: texLoader.load("img/particle.png"),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false
});


var material = new THREE.MeshPhongMaterial({color: 0x3B970B, reflectivity:0.75, depthTest:true})

//Tube
var path = new THREE.CatmullRomCurve3( [
    new THREE.Vector3( 0, 100, -300 ),
    new THREE.Vector3( 0, systemDistance, 0 ),
] );
var tube = new THREE.Mesh(new THREE.TubeGeometry(path,20,2,10,false), material);
scene.add(tube);


//Create particles
for (var i = 0; i < particleCount; i++) {
    var particle = new THREE.Vector3(0, 0, 0);
    resetParticle(particle);
    particles.vertices.push(particle);
}

var particleSystem = new THREE.Points(particles, pMaterial);
particleSystem.position.setY(systemDistance);
particleSystem.geometry.dynamic = true;
scene.add(particleSystem);
render();


function render() {
    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();
    //Update particles
    for (var i = 0; i < particleCount; i++) {
        var particle = particles.vertices[i];
            if (elapsed - particle.birth > particle.waitTime) {
                particle.waitTime = 0;
                if (particle.y <= -systemDistance) {
                    //center.x = (center.x + particle.x )/ 2;
                    //center.z = (center.z + particle.z )/ 2;
                    if(Math.random()>0.2 && particle.bounced<3){
                        particle.bounced++;
                        particle.speed.y = Math.nrand(0.25,0.1);
                        particle.speed.x = Math.nrand(0,0.1);
                        particle.speed.z = Math.nrand(0.1,0.1);
                    }
                    else {
                        resetParticle(particle);
                    }
                }
                particle.speed.y += acc.y * delta * gravity;
                particle.speed.x -= particle.speed.x * attr;
                particle.speed.z -= particle.speed.z * attr;
                //particle.speed.y -= particle.speed.y*attr+Math.random()/100-0.005;
                particle.add(particle.speed);
            }
    }
    particleSystem.geometry.verticesNeedUpdate = true;
    //Ripples
    var uniforms = heightmapVariable.material.uniforms;
    if (mouseMoved) {
        raycaster.setFromCamera(mouseCoords, camera);
        var intersects = raycaster.intersectObject(water);
        if (intersects.length > 0) {
            var point = intersects[0].point;
            uniforms.mousePos.value.set(point.x, point.z);
        }
        else {
            uniforms.mousePos.value.set(10000, 10000);
        }
        mouseMoved = false;
    }
    else {
        uniforms.mousePos.value.set(10000, 10000);
    }

    gpuCompute.compute();
    water.material.uniforms.ripplesMap.value =  gpuCompute.getCurrentRenderTarget( heightmapVariable ).texture;
    if(noiseAnimation)
        waterShader.material.uniforms.time.value += 1.0 / 60.0;
    waterShader.render();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function resetParticle(particle) {
    particle.bounced = 0;
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
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
            var x = i * 128 / 16;
            var y = j * 128 / 16;
            pixels[p + 0] = noise(x, y, 123.4);
            pixels[p + 1] = 0;
            pixels[p + 2] = 0;
            pixels[p + 3] = 1;
            p += 4;
        }
    }
}


