//Water Material
var waterNormals = new THREE.TextureLoader().load('img/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
var waterShader = new THREE.Water(renderer, camera, scene, {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals: waterNormals, //TODO Add switch to the GUI
    //alpha: 0.9,
    factor: 20,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffaa,
    waterColor: 0x777777,
    distortionScale: 10.0
});

//Water geometry
var waterGeometry = new THREE.PlaneGeometry(BOUNDS, BOUNDS, WIDTH, WIDTH);
waterShader.material.side = THREE.FrontSide;
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
heightmapVariable.material.uniforms.rippleSize = {value: rippleSize};
heightmapVariable.material.uniforms.viscosityConstant = {value: 0.03};
heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed(1);
var error = gpuCompute.init();
if (error !== null) {
    console.error(error);
}