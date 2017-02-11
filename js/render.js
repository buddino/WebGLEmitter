function render() {
    if (particlesAnimation) {
        var delta = clock.getDelta();
        var elapsed = clock.getElapsedTime();
        //Update particles
        for (var i = 0; i < particleCount; i++) {
            var particle = particleSystem.geometry.vertices[i];
            if (elapsed - particle.birth > particle.waitTime) {
                //New active particle
                if (particle.waitTime != -1) {
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
    }
    //Ripples
    var uniforms = heightmapVariable.material.uniforms;
    var planeCenter = {x: center.x + particleSystem.position.x, z: center.z + particleSystem.position.z};
    uniforms.ripplePos.value.set(planeCenter.x, planeCenter.z);


    //Compute the noise
    gpuCompute.compute()
    //Pass the computed noise
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