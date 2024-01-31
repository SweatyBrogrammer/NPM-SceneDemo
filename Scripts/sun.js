// sun.js
import * as THREE from 'three';
export class Sun {
    constructor(textureUrl, size) {
        this.textureUrl = textureUrl;
        this.size = size;

        this.geometry = new THREE.SphereGeometry(size, 32, 32);
        this.texture = new THREE.TextureLoader().load(textureUrl, (tex) => {
            tex.encoding = THREE.SRGBColorSpace; // Use sRGB encoding for color textures
            tex.minFilter = THREE.LinearFilter;});
        this.material = new THREE.MeshBasicMaterial({ map: this.texture });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.light = new THREE.PointLight(0xffffff, 1.5, 100);
        this.light.position.set(0, 0, 0); // Assuming the sun is at the origin
        this.mesh.add(this.light);
    }

    update() {
        this.mesh.rotation.y += 0.001;
    }
}