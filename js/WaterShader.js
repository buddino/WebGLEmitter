/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

THREE.ShaderLib[ 'water' ] = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "fog" ], {
			"normalSampler":    { value: null },
			"mirrorSampler":    { value: null },
			"alpha":            { value: 0.0 },
			"factor":           { value: 10.0 },
			"time":             { value: 0.0 },
			"distortionScale":  { value: 20.0 },
			"noiseScale":       { value: 1.0 },
			"textureMatrix" :   { value: new THREE.Matrix4() },
			"sunColor":         { value: new THREE.Color( 0x7F7F7F ) },
			"sunDirection":     { value: new THREE.Vector3( 0.70707, 0.70707, 0 ) },
			"eye":              { value: new THREE.Vector3() },
			"waterColor":       { value: new THREE.Color( 0x94D9F1 ) }
		}
	] ),

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',
		'uniform float factor;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
        'vec3 noise;',
        'float xMove = 32.0;',
        'float yMove = 32.0;',
        'float speed = 1.0;',
		'vec3 mod289(vec3 x) {',
		'  return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',
		'vec4 mod289(vec4 x) {',
		'  return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',
		'vec4 permute(vec4 x) {',
		'     return mod289(((x*34.0)+1.0)*x);',
		'}',
		'vec4 taylorInvSqrt(vec4 r)',
		'{',
		'  return 1.79284291400159 - 0.85373472095314 * r;',
		'}',
		'float snoise(vec3 v)',
		'  {',
		'  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;',
		'  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);',
		'// First corner',
		'  vec3 i  = floor(v + dot(v, C.yyy) );',
		'  vec3 x0 =   v - i + dot(i, C.xxx) ;',
		'  vec3 g = step(x0.yzx, x0.xyz);',
		'  vec3 l = 1.0 - g;',
		'  vec3 i1 = min( g.xyz, l.zxy );',
		'  vec3 i2 = max( g.xyz, l.zxy );',
		'  vec3 x1 = x0 - i1 + C.xxx;',
		'  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y',
		'  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y',
		'  i = mod289(i);',
		'  vec4 p = permute( permute( permute(',
		'             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))',
		'           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))',
		'           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));',
		'  float n_ = 0.142857142857; // 1.0/7.0',
		'  vec3  ns = n_ * D.wyz - D.xzx;',
		'  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)',
		'  vec4 x_ = floor(j * ns.z);',
		'  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)',
		'  vec4 x = x_ *ns.x + ns.yyyy;',
		'  vec4 y = y_ *ns.x + ns.yyyy;',
		'  vec4 h = 1.0 - abs(x) - abs(y);',
		'  vec4 b0 = vec4( x.xy, y.xy );',
		'  vec4 b1 = vec4( x.zw, y.zw );',
		'  vec4 s0 = floor(b0)*2.0 + 1.0;',
		'  vec4 s1 = floor(b1)*2.0 + 1.0;',
		'  vec4 sh = -step(h, vec4(0.0));',
		'  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;',
		'  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;',
		'  vec3 p0 = vec3(a0.xy,h.x);',
		'  vec3 p1 = vec3(a0.zw,h.y);',
		'  vec3 p2 = vec3(a1.xy,h.z);',
		'  vec3 p3 = vec3(a1.zw,h.w);',
		'  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));',
		'  p0 *= norm.x;',
		'  p1 *= norm.y;',
		'  p2 *= norm.z;',
		'  p3 *= norm.w;',
		'  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
		'  m = m * m;',
		'  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),',
		'                                dot(p2,x2), dot(p3,x3) ) );',
		'  }',

		'void main()',
		'{',
		'	noise = vec3(position.x/xMove,position.y/yMove,time/speed);',
		'	float fn = snoise(noise)*0.5+0.5;',
		'	mirrorCoord = modelMatrix * vec4( position.x, position.y, position.z+fn*factor, 1.0 );',
		'	worldPosition = mirrorCoord.xyz;',
		'	mirrorCoord = textureMatrix * mirrorCoord;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join( '\n' ),

	fragmentShader: [
		'precision highp float;',

		'uniform sampler2D mirrorSampler;',
		'uniform float alpha;',
		'uniform float time;',
		'uniform float distortionScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 eye;',
		'uniform vec3 waterColor;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',

		'vec4 getNoise( vec2 uv )',
		'{',
		'	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
		'	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
		'	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
		'	vec4 noise = texture2D( normalSampler, uv0 ) +',
		'		texture2D( normalSampler, uv1 ) +',
		'		texture2D( normalSampler, uv2 ) +',
		'		texture2D( normalSampler, uv3 );',
		'	return noise * 0.5 - 1.0;',
		'}',

		'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor )',
		'{',
		'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
		'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
		'	specularColor += pow( direction, shiny ) * sunColor * spec;',
		'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
		'}',

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],

		'void main()',
		'{',
		'	vec4 noise = getNoise( worldPosition.xz );',
		'	vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.0, 1.0, 1.0 ) );',

		'	vec3 diffuseLight = vec3(0.0);',
		'	vec3 specularLight = vec3(0.0);',

		'	vec3 worldToEye = eye-worldPosition;',
		'	vec3 eyeDirection = normalize( worldToEye );',
		'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

		'	float distance = length(worldToEye);',

		'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
		'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion ) );',

		'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
		'	float rf0 = 0.3;',
		'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
		'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
		'	vec3 albedo = mix( sunColor * diffuseLight * 0.3 + scatter, ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance );',
		'	vec3 outgoingLight = albedo;',
			THREE.ShaderChunk[ "fog_fragment" ],
		'	gl_FragColor = vec4( outgoingLight, alpha );',
		'}'
	].join( '\n' )

};

THREE.Water = function ( renderer, camera, scene, options ) {

	THREE.Object3D.call( this );
	this.name = 'water_' + this.id;

	function optionalParameter ( value, defaultValue ) {

		return value !== undefined ? value : defaultValue;

	}

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = optionalParameter( options.textureWidth, 512 );
	var height = optionalParameter( options.textureHeight, 512 );
	this.clipBias = optionalParameter( options.clipBias, 0.0 );
	this.alpha = optionalParameter( options.alpha, 1.0 );
	this.time = optionalParameter( options.time, 0.0 );
	this.factor = optionalParameter( options.factor, 10.0 );
	this.normalSampler = optionalParameter( options.waterNormals, null );
	this.sunDirection = optionalParameter( options.sunDirection, new THREE.Vector3( 0.70707, 0.70707, 0.0 ) );
	this.sunColor = new THREE.Color( optionalParameter( options.sunColor, 0xffffff ) );
	this.waterColor = new THREE.Color( optionalParameter( options.waterColor, 0x7F7F7F ) );
	this.eye = optionalParameter( options.eye, new THREE.Vector3( 0, 0, 0 ) );
	this.distortionScale = optionalParameter( options.distortionScale, 20.0 );
	this.side = optionalParameter( options.side, THREE.FrontSide );
	this.fog = optionalParameter( options.fog, false );

	this.renderer = renderer;
	this.scene = scene;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3( 0, 0, 1 );
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
	this.clipPlane = new THREE.Vector4();

	if ( camera instanceof THREE.PerspectiveCamera ) {

		this.camera = camera;

	} else {

		this.camera = new THREE.PerspectiveCamera();
		console.log( this.name + ': camera is not a Perspective Camera!' );

	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();

	this.renderTarget = new THREE.WebGLRenderTarget( width, height );
	this.renderTarget2 = new THREE.WebGLRenderTarget( width, height );

	var mirrorShader = THREE.ShaderLib[ "water" ];
	var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms );

	this.material = new THREE.ShaderMaterial( {
		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: mirrorUniforms,
		transparent: true,
		side: this.side,
		fog: this.fog
	} );

	this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;
	this.material.uniforms.alpha.value = this.alpha;
	this.material.uniforms.time.value = this.time;
    this.material.uniforms.factor.value = this.factor;
	this.material.uniforms.normalSampler.value = this.normalSampler;
	this.material.uniforms.sunColor.value = this.sunColor;
	this.material.uniforms.waterColor.value = this.waterColor;
	this.material.uniforms.sunDirection.value = this.sunDirection;
	this.material.uniforms.distortionScale.value = this.distortionScale;

	this.material.uniforms.eye.value = this.eye;

	if ( ! THREE.Math.isPowerOfTwo( width ) || ! THREE.Math.isPowerOfTwo( height ) ) {

		this.renderTarget.texture.generateMipmaps = false;
		this.renderTarget.texture.minFilter = THREE.LinearFilter;
		this.renderTarget2.texture.generateMipmaps = false;
		this.renderTarget2.texture.minFilter = THREE.LinearFilter;

	}

	this.updateTextureMatrix();
	this.render();

};

THREE.Water.prototype = Object.create( THREE.Mirror.prototype );
THREE.Water.prototype.constructor = THREE.Water;


THREE.Water.prototype.updateTextureMatrix = function () {

	function sign( x ) {

		return x ? x < 0 ? - 1 : 1 : 0;

	}

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
	this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

	this.rotationMatrix.extractRotation( this.matrixWorld );

	this.normal.set( 0, 0, 1 );
	this.normal.applyMatrix4( this.rotationMatrix );

	var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
	view.reflect( this.normal ).negate();
	view.add( this.mirrorWorldPosition );

	this.rotationMatrix.extractRotation( this.camera.matrixWorld );

	this.lookAtPosition.set( 0, 0, - 1 );
	this.lookAtPosition.applyMatrix4( this.rotationMatrix );
	this.lookAtPosition.add( this.cameraWorldPosition );

	var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
	target.reflect( this.normal ).negate();
	target.add( this.mirrorWorldPosition );

	this.up.set( 0, - 1, 0 );
	this.up.applyMatrix4( this.rotationMatrix );
	this.up.reflect( this.normal ).negate();

	this.mirrorCamera.position.copy( view );
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt( target );
	this.mirrorCamera.aspect = this.camera.aspect;

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

	// Update the texture matrix
	this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0 );
	this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
	this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
	this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

	this.clipPlane.set( this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = ( sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
	q.y = ( sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
	q.z = - 1.0;
	q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[ 2 ] = c.x;
	projectionMatrix.elements[ 6 ] = c.y;
	projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[ 14 ] = c.w;

	var worldCoordinates = new THREE.Vector3();
	worldCoordinates.setFromMatrixPosition( this.camera.matrixWorld );
	this.eye = worldCoordinates;
	this.material.uniforms.eye.value = this.eye;

};

