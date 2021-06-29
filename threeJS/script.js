import * as THREE from './three/build/three.module.js';
import {OrbitControls} from './three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from './three/examples/jsm/libs/dat.gui.module.js';
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from './three/examples/jsm/postprocessing/BokehPass.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const postprocessing = {};

const camera = new THREE.PerspectiveCamera(90, 2, 0.1, 256);
camera.position.set(16, 16, -8);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2, 0);
controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color('blue');

{
    const color = 0x0000FF; //ambient blue light
    const intensity = 0.50;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
}

{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(10, 12, 4);
    scene.add(light);
    scene.add(light.target);
}

{
    const loader = new THREE.CubeTextureLoader();
    scene.background = loader.load([
        './three/examples/textures/cube/MilkyWay/dark-s_px.jpg',
        './three/examples/textures/cube/MilkyWay/dark-s_nx.jpg',
        './three/examples/textures/cube/MilkyWay/dark-s_py.jpg',
        './three/examples/textures/cube/MilkyWay/dark-s_ny.jpg',
        './three/examples/textures/cube/MilkyWay/dark-s_pz.jpg',
        './three/examples/textures/cube/MilkyWay/dark-s_nz.jpg',
    ]);
}

//SHUTTLES
{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/orbiter_space_shuttle_ov-103_discovery/scene.gltf', (gltf) => {
        scene.add(gltf.scene);

    });
}

{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/orbiter_space_shuttle_ov-103_discovery/scene.gltf', (gltf) => {
        gltf.scene.position.x = 32;
        gltf.scene.position.z = 16;
        scene.add(gltf.scene);
    });
}

{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/orbiter_space_shuttle_ov-103_discovery/scene.gltf', (gltf) => {
        gltf.scene.position.x = -32;
        gltf.scene.position.z = 16;
        scene.add(gltf.scene);
    });
}

//ALIEN
{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/space_cast_one/scene.gltf', (gltf) => {
        gltf.scene.rotation.x = 180;
        gltf.scene.position.x = 0;
        gltf.scene.position.y = 8;
        gltf.scene.position.z = 64;
        scene.add(gltf.scene);
    });
}

//ASTEROIDS
{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/foraminifera_zellia_and_parafusulina_pri/scene.gltf', (gltf) => {
        gltf.scene.position.x = -16;
        gltf.scene.position.y = 8;
        gltf.scene.position.z = 16;
        scene.add(gltf.scene);
    });
}

{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/foraminifera_zellia_and_parafusulina_pri/scene.gltf', (gltf) => {
        gltf.scene.position.x = 16;
        gltf.scene.position.y = 8;
        gltf.scene.position.z = 16;
        scene.add(gltf.scene);
    });
}

{
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('glTF_models/foraminifera_zellia_and_parafusulina_pri/scene.gltf', (gltf) => {
        gltf.scene.position.x = 0;
        gltf.scene.position.y = 8;
        gltf.scene.position.z = 32;
        scene.add(gltf.scene);
    });
}

{
    const effectController = {

        focus: 500.0,
        aperture: 5,
        maxblur: 0.01

    };

    const matChanger = function () {

        postprocessing.bokeh.uniforms["focus"].value = effectController.focus;
        postprocessing.bokeh.uniforms["aperture"].value = effectController.aperture * 0.00001;
        postprocessing.bokeh.uniforms["maxblur"].value = effectController.maxblur;

    };

    const gui = new GUI();
    gui.add(effectController, "focus", 10.0, 3000.0, 10).onChange(matChanger);
    gui.add(effectController, "aperture", 0, 10, 0.1).onChange(matChanger);
    gui.add(effectController, "maxblur", 0.0, 0.01, 0.001).onChange(matChanger);
}

const renderPass = new RenderPass(scene, camera);

const bokehPass = new BokehPass(scene, camera, {
    focus: 5.0,
    aperture: 0.0025,
    maxblur: 0.01,

    width: canvas.width,
    height: canvas.height
});

const composer = new EffectComposer(renderer);

composer.addPass(renderPass);
composer.addPass(bokehPass);

postprocessing.composer = composer;
postprocessing.bokeh = bokehPass;


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    //renderer.render(scene, camera);
    postprocessing.composer.render(0.1);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
