//scene.js
import * as THREE from 'three';
export class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 20, 10);
        this.camera.lookAt(this.scene.position);

        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMappingExposure = 1.5;
        document.body.appendChild(this.renderer.domElement);

        // Set up lights and background
        this.addLights();
        this.addBackground();

        // Adjust window resize listener
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    }



    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 3);
        this.scene.add(ambientLight);
    }

    addBackground() {
        const spaceTextureLoader = new THREE.TextureLoader();
        spaceTextureLoader.load('images/space.webp', texture => {
            texture.colorSpace = THREE.SRGBColorSpace; // Update texture encoding to colorSpace
            texture.minFilter = THREE.LinearFilter;
            this.scene.background = texture;
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
