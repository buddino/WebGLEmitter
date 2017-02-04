var params = {
    gravity: gravity,
    attr: attr,
    pressure: pressure,
    xSpread: xSpread,
    ySpread: ySpread,
    zSpread: zSpread,
    opacity: opacity,
    ripples: rippleSize,
    viscosity: viscosityConst,
    size: size,
    noiseAnimation:true,
    particleAnimation:true,
    distortion:water.material.uniforms.distortionScale.value
};

function loadGUI() {
    console.info("[GUI] Loading...");
    //var gui = new DAT.GUI({        height: (Object.keys(params).length) * 32 - 1    });
    var gui = new dat.GUI();
    var noise = gui.addFolder("Noise");
    var ripples = gui.addFolder("Ripples");
    var gravityCtrl = gui.add(params, 'gravity', 0.01, 5, 0.01);
    var attrCtrl = gui.add(params, 'attr', 0, 0.1, 0.001);
    var pressureCtrl = gui.add(params, 'pressure', 0, 2, 0.01);
    var xSpreadCtrl = gui.add(params, 'xSpread', 0.001, 0.03, 0.001);
    var ySpreadCtrl = gui.add(params, 'ySpread', 0.001, 0.03, 0.001);
    var zSpreadCtrl = gui.add(params, 'zSpread', 0.001, 0.03, 0.001);
    var opacityCtrl = gui.add(params, 'opacity', 0, 0.3, 0.01);
    var sizeCtrl = gui.add(params, 'size', 1, 10, 0.1);
    var animationCtrl = gui.add(params, 'particleAnimation');

    var noiseAnimationCtrl = noise.add(params, 'noiseAnimation');
    var distortionCtrl = noise.add(params, 'distortion', 0,30, 0.1);

    var rippleCtrl = ripples.add(params, 'ripples', 0,30, 0.1);
    var viscovityCtrl = ripples.add(params, 'viscosity', 0,0.05, 0.001);

    gravityCtrl.onChange(function (value) {
        gravity = value;
    });

    attrCtrl.onChange(function (value) {
        attr = value;
    });

    pressureCtrl.onChange(function (value) {
        pressure = value;
    });

    xSpreadCtrl.onChange(function (value) {
        xSpread = value;
    })

    ySpreadCtrl.onChange(function (value) {
        ySpread = value;
    })

    zSpreadCtrl.onChange(function (value) {
        zSpread = value;
    })

    opacityCtrl.onChange(function (value) {
        particleSystem.material.opacity = value;
    })

    sizeCtrl.onChange(function (value) {
        particleSystem.material.size = value;
    })

    animationCtrl.onChange(function (value) {
        particlesAnimation = value;
    })

    noiseAnimationCtrl.onChange(function (value) {
        noiseAnimation = value;
    })
    distortionCtrl.onChange(function (value) {
        water.material.uniforms.distortionScale.value = value;
    })
    rippleCtrl.onChange(function (value) {
        heightmapVariable.material.uniforms.rippleSize.value = value;
    })
    viscovityCtrl.onChange(function (value) {
        heightmapVariable.material.uniforms.viscosityConstant.value = value;
    })

}