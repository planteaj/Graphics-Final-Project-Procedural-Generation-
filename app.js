"use strict";

let container;      	        // keeping here for easy access
let scene, camera, renderer;    // Three.js rendering basics.
let score = 0;
var objects = [];
let RotateY = 0;
let nvShader = document.getElementById('myPunkVertexShader').innerHTML;
let nfShader = document.getElementById('myFragmentShader').innerHTML;
let ovShader = document.getElementById('myOtherVertexShader').innerHTML;
let tfShader = document.getElementById('myTextureFragmentShader').innerHTML;
let myMesh;
let myOtherMesh;
let ground;
let cTime = 0;
let cameraTop = true;
noise.seed(Math.random());
let noiseArray = makeDoubleArray(100, 100);


function makeDoubleArray(x, y) {
    let temp = new Array(x);
    for (var i = 0; i < temp.length; i++) {
        temp[i] = new Array(y);
    }
    return temp;
}

function makeCubeTexture(filenames, path) {
    var URLs;
    if (path) {
        URLs = [];
        for (var i = 0; i < 6; i++)
            URLs.push(path + filenames[i]);
    }
    else {
        URLs = filenames;
    }
    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load(URLs);
    return texture;
}

function addShader(object, time) {
    var bumptext = makeTexture('Mud.jpg');
    bumptext.wrapS = bumptext.wrapT = THREE.RepeatWrapping;
    var snow = makeTexture('snow.jpg');
    snow.wrapS = snow.wrapT = THREE.RepeatWrapping;
    var sand = makeTexture('sand.jpg');
    sand.wrapS = sand.wrapT = THREE.RepeatWrapping;
    var rock = makeTexture('rock.jpg');
    rock.wrapS = rock.wrapT = THREE.RepeatWrapping;
    var water = makeTexture('seaFoam.jpg');
    water.wrapS = water.wrapT = THREE.RepeatWrapping;
    var bumpscale = 50;
    let material = new THREE.ShaderMaterial({
        uniforms:
        {
            bumptexture: { value: bumptext },
            snow: { value: snow },
            sand: { value: sand },
            rock: { value: rock },
            water: { value: water},
        },
        vertexShader: ovShader,
        fragmentShader: tfShader,
        
    });

   
   // let geometry = object;

    let mesh = new THREE.Mesh(object, material);
    mesh.position.x = 5;
    return mesh;
  }
function addShaderAgain(object, time) {

    var bumpscale = 10;
    let bumptext = makeTexture('Aonuma.jpg', true);
    let material = new THREE.ShaderMaterial({
        uniforms:
        {
            bumptexture: { value: bumptext },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_time: { value: time },
            bumpscale: { value: bumpscale },
        },
        vertexShader: nvShader,
        fragmentShader: nfShader,

    });
    let mesh = new THREE.Mesh(object, material);
    return mesh;
}

function createWorld() {

    renderer.setClearColor(0);  // black background
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
   

    /* Add the camera and a light to the scene, linked into one object. */
    let light = new THREE.DirectionalLight(0xffffff);
   // light.target = (0, 0, 0);
    light.position.set(0, 50, 20);
    camera.position.set(0, 5, 100);
    if (cameraTop) {
        camera.position.set(0, 100, 0);
        camera.rotation.x = -Math.PI/2;
    }
   // camera.add(light);
    scene.add(light);

  // let geom = new THREE.BoxGeometry(100, 100, 100, 100, 100);
    let geom = new THREE.BoxGeometry(10, 10, 10);
    /*
   myOtherMesh = addShaderAgain(geom, cTime);
    myOtherMesh.position.x = 10;
    myOtherMesh.position.y = 10;
    myOtherMesh.position.z = 10;
    scene.add(myOtherMesh);
    */
  /*      var bumptext = makeTexture('Mud.jpg');

    for (var y = 0; y < 100; y++){
        for (var x = 0; x < 100; x++) {
            let nx = x / container.clientWidth - .05, ny = y / container.clientHeight - 0.5;
            noiseArray[y, x] = noise.simplex2(nx, ny);
        }
    }
    */

    

    let p = new THREE.PlaneGeometry(100, 100, 100, 100);
    p.verticesNeedUpdate = true;
    let freq = 2; 
    let freq2 = 4;
    let freq3 = 8;
    let freq4 = 16; 
       let test = 0;
    for (var i = 0; i < p.vertices.length; i++) {

        let nx = (Math.round((i/10)) / 10 - 0.5), ny = (i / 10 - 0.5);
        //console.log(noise.simplex2(nx, ny));
        let tempo = Math.abs(noise.simplex2(freq *(nx),freq *(ny)));
        tempo += .5 * noise.simplex2(freq2 * nx, freq2 * ny);
        tempo += .25 * noise.simplex2(freq3 * nx, freq3 * ny);
        tempo += .125 * noise.simplex2(freq4 * nx, freq4 * ny);
        p.vertices[i].z = Math.pow(tempo, 4);
        
        if (i % 500 == 0 && test < 5) {
            test++;
          
            let geom = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
           let mesh = addShaderAgain(geom, cTime);
            mesh.position.x = nx;
            mesh.position.y = ny;
            mesh.position.z = Math.pow(tempo, 4);
            scene.add(mesh);
            objects.push(mesh);
        }
        
    }
   // ground = addShader(p, cTime);
    p.verticesNeedUpdate = true;
    myMesh = addShader(p, cTime);
    myMesh.rotation.x = -Math.PI / 2;
    //myMesh.position.y = -1;
    scene.add(myMesh);
    
    light.target = myMesh;
    scene.add(camera);
    
    let cubeTexture = makeCubeTexture(
        ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"],
        "resources/skybox2/"
    );
    scene.background = cubeTexture;
  } // end createWorld

/**
 *  When an animation is in progress, this function is called just before rendering each
 *  frame of the animation.
 */
function updateForFrame() {
    cTime = clock.getElapsedTime();
}


/**
 *  Render the scene.  This is called for each frame of the animation, after updating
 *  the position and velocity data of the balls.
 */
function render() {
    renderer.render(scene, camera);
}


/**
 *  Creates and returns a Texture object that will read its image from the
 *  specified URL. If the second parameter is provided, the texture will be
 *  applied to the material when the
 */
function makeTexture(imageURL, temp, material) {
    function callback() {
        if (material) {
            material.map = texture;
            material.needsUpdate = true;
        }
        // not necessary to call render() since the scene is continually updating.
    }
    let loader = new THREE.TextureLoader();
    let texture = loader.load(imageURL, callback);
    if (temp) { 
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(10, 10);
    }
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}


//----------------------------- mouse and key support -------------------------------
function doMouseDown(evt) {
    let fn = "[doMouseDown]: ";
    console.log(fn);

    let x = evt.clientX;
    let y = evt.clientY;
    console.log("Clicked mouse at " + x + "," + y);
}

function doMouseMove(evt) {
    let fn = "[doMouseMove]: ";
   // console.log(fn);

    let x = evt.clientX;
    let y = evt.clientY;
    // mouse was moved to (x,y)

    var rotZ = 8 * Math.PI / 6 * (window.innerWidth / 2 - x) / window.innerWidth;
    var rotX = 8 * Math.PI / 6 * (y - window.innerHeight / 2) / window.innerHeight;

    var rcMatrix = new THREE.Matrix4(); // The matrix representing the gun rotation,
    //    so we can apply it to the ray direction.
   }

function doKeyDown(event) {
    let fn = "[doKeyDown]: ";
    console.log(fn + "Key pressed with code " + event.key);
    // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

    const code = event.key;
    // console.log("Key pressed with code " + code);
    let rot = 0;
    if (code === 'a' || code === 'ArrowLeft')           // 'a' and 'left arrow'
    {
        //gunbase.position.x -= 1;
        if (code === 'ArrowLeft')
            rot = .1;
        else
        camera.position.x -= 10;     
        
    }
    else if (code === 'd' || code === 'ArrowRight')     // 'd' and 'right arrow'
    {
       // gunbase.position.x += 1;
        if (code === "ArrowRight")
            rot = -0.1;
        else
            camera.position.x += 10;
    }
    else if (code === 'w' || code === 'ArrowUp') {
        //camera.translateZ(-10);
        if (code === 'ArrowUp') {
            camera.position.y += 10;
        }
        else
            camera.position.z -= 10;
    }
    else if (code === 's' || code === 'ArrowDown') {
       // camera.translateZ(10);
        if (code === 'ArrowDown')
            camera.position.y -= 10;
        else
        camera.position.z += 10;
    }
    //if (event.shiftKey)                                  // 'shift'
     //   rot *= 5;
    if (rot != 0) {
        RotateY += rot;
        if (event.shiftKey)
            camera.rotation.x = RotateY;
        else
        camera.rotation.y = RotateY;
        //event.stopPropagation();          // *** MH
    }
}

//--------------------------- animation support -----------------------------------

let clock;  // Keeps track of elapsed time of animation.

function doFrame() {
 //   console.log(cTime);
    for (let i = 0; i < objects.length; i++)
        objects[i].material.uniforms.u_time.value = cTime;
  //  myOtherMesh.material.uniforms.u_time.value = cTime;
   // ground.material.uniforms.u_time.value = cTime;
    updateForFrame();
    render();
    requestAnimationFrame(doFrame);

}

//----------------------- respond to window resizing -------------------------------

/* When the window is resized, we need to adjust the aspect ratio of the camera.
 * We also need to reset the size of the canvas that used by the renderer to
 * match the new size of the window.
 */
function doResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Need to call this for the change in aspect to take effect.
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createRenderer() {
    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // we set this according to the div container.
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 1.0);
    container.appendChild(renderer.domElement);  // adding 'canvas; to container here
    // render, or 'create a still image', of the scene
}

//----------------------------------------------------------------------------------

/**
 *  This init() function is called when by the onload event when the document has loaded.
 */
function init() {
    container = document.querySelector('#scene-container');

    // Create & Install Renderer ---------------------------------------
    createRenderer();

    window.addEventListener('resize', doResize);  // Set up handler for resize event
    document.addEventListener("keydown", doKeyDown);
    window.addEventListener("mousedown", doMouseDown);
    window.addEventListener("mousemove", doMouseMove);

    createWorld();

    clock = new THREE.Clock(); // For keeping time during the animation.

    requestAnimationFrame(doFrame);  // Start the animation.
   
}

init()

