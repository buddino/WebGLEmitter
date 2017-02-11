

//var spG = new THREE.SphereGeometry(2,10,10);
//var spM = new THREE.MeshPhongMaterial({color:0xff0000});
//var sphere = new THREE.Mesh(spG,spM);
//sphere.position.y = 10;
//scene.add(sphere);

camera.position.x = -146;
camera.position.y = 32;
camera.position.z = 176;
camera.rotation.x = -0.12;
camera.rotation.y = -0.72;
camera.rotation.z = -0.08;
renderer.setSize(width, height);

particleSystem = createParticleSystem();
scene.add(particleSystem);
render();

function start() {
    document.body.appendChild(renderer.domElement);
    loadGUI();
}

function createParticleSystem(){
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
    particleSystem.position.set(37,80,-10);
    return particleSystem;
}

camera.position.x = -150;
camera.position.y = 100;
camera.position.z = -300;
// camera.rotation.x = -3.0;
// camera.rotation.y = 0.55;
// camera.rotation.z = -3.0;
orbitControls.update();