import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

let camera, scene, renderer, stats, controls;
let object;

const clock = new THREE.Clock();

init();

function init() {

    const container = document.getElementById('three-container');

    // 📷 CÁMARA
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    // Aparece dentro del salón
    camera.position.set(0, 1.6, 1);
    camera.lookAt(0, 1.6, 0);


    // 🌄 ESCENA
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // 💡 ILUMINACIÓN
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);


    // 📦 CARGAR MODELO FBX
    const loader = new FBXLoader();
    loader.load("models/fbx/Ejemplo3.fbx", (group) => {

        group.scale.set(1, 1, 1);

        // ---------------------------
        // CORREGIR ORIENTACIÓN (TU MODELO ESTABA DE CABEZA)
        // ---------------------------
        group.rotation.x = Math.PI /2;   // 180° → piso abajo
        group.rotation.y = Math.PI;   // 180° → ventanas hacia adentro
        group.rotation.z = 0;

        // ---------------------------
        // CENTRAR MODELO
        // ---------------------------
        let box = new THREE.Box3().setFromObject(group);
        let center = box.getCenter(new THREE.Vector3());
        group.position.x -= center.x;
        group.position.z -= center.z;

        // ---------------------------
        // AJUSTAR PISO A Y = 0
        // ---------------------------
        box = new THREE.Box3().setFromObject(group);
        const minY = box.min.y;
        group.position.y -= minY;

        // ---------------------------
        // PAREDES VISIBLES (DOBLE CARA)
        // ---------------------------
        group.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.side = THREE.DoubleSide;
            }
        });

        // Agregar modelo final corregido
        scene.add(group);
        object = group;

        // ---------------------------
        // POSICIÓN DENTRO DEL SALÓN (USUARIO)
        // ---------------------------
       camera.position.set(0, 1.6, -1.5);
controls.target.set(0, 1.6, -3);
controls.update();

    });


    // 🖥 RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // VR
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    document.body.appendChild(VRButton.createButton(renderer));

    container.appendChild(renderer.domElement);


    // 🎮 CONTROLES
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0);
    controls.update();


    // 🧪 STATS
    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(animate);
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    const delta = clock.getDelta();
    renderer.render(scene, camera);
    stats.update();
}