var manneken;
var loader = new THREE.STLLoader();
loader.load('models/simplified10k.stl', function (mannekenGeom) {
    console.info("[Manneken]\tSmoothing model's geometry...");
    //Smooth
    var attrib = mannekenGeom.getAttribute('position');
    var positions = attrib.array;
    var vertices = [];
    for(var i = 0, n = positions.length; i < n; i += 3) {
        var x = positions[i];
        var y = positions[i + 1];
        var z = positions[i + 2];
        vertices.push(new THREE.Vector3(x, y, z));
    }
    var faces = [];
    for(var i = 0, n = vertices.length; i < n; i += 3) {
        faces.push(new THREE.Face3(i, i + 1, i + 2));
    }
    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    console.info("[Manneken]\tComputing face normals");
    geometry.computeFaceNormals();
    console.info("[Manneken]\tMerging vertices");
    geometry.mergeVertices()
    console.info("[Manneken]\tComputing vertex normals");
    geometry.computeVertexNormals();
    //Convert it bak to a buffer geometry for a better efficiency
    mannekenGeom.fromGeometry(geometry);
    geometry.shading = THREE.SmoothShading;
    //////

    var mannekenMaterial = new THREE.MeshPhongMaterial({
            color: 0x98A195,
            specular: 0x111111,
            shininess: 100,
            map: new THREE.TextureLoader().load('img/bronze.jpg')
        }
    );

    manneken = new THREE.Mesh(mannekenGeom, mannekenMaterial);
    manneken.rotateX(-Math.PI / 2);
    manneken.position.y = 30;
    scene.add(manneken);
});