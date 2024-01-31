//planet.js
import * as THREE from 'three';
export class Planet {
    constructor(textureUrl, size, rotationSpeed, orbitRadius, orbitSpeed, orbitTiltAngle,clockwise=true) {
        this.textureUrl = textureUrl;
        this.size = size;
        this.rotationSpeed = rotationSpeed;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.orbitTiltAngle = orbitTiltAngle;
        this.angle = 0;
        this.clockwise=clockwise;

        this.geometry = new THREE.SphereGeometry(size, 32, 32);
        this.texture = new THREE.TextureLoader().load(textureUrl, (texture) => { // Use sRGB encoding for color textures
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
        });

        this.material = new THREE.MeshStandardMaterial({ map: this.texture,emissive:0xffffff,emissiveIntensity:0.3,emissiveMap:this.texture });

        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.createOrbitPath(orbitRadius, orbitTiltAngle);
    }

    createOrbitPath(orbitRadius, orbitTiltAngle) {
        const orbitSegments = 64; // The number of segments in the orbit path
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

        const points = [];
        for (let i = 0; i <= orbitSegments; i++) {
            const segment = (i / orbitSegments) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    Math.cos(segment) * orbitRadius,
                    Math.sin(segment) * Math.sin(orbitTiltAngle) * orbitRadius,
                    Math.sin(segment) * Math.cos(orbitTiltAngle) * orbitRadius
                )
            );
        }

        orbitGeometry.setFromPoints(points);
        this.orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
    }


    // calculateFuturePosition(timeAheadInSeconds) {
    //     const angleChange = this.orbitSpeed * timeAheadInSeconds; // Keep time in seconds
    //     const futureAngle = this.angle + (this.clockwise ? angleChange : -angleChange);
    
    //     return {
    //         x: this.orbitRadius * Math.cos(futureAngle),
    //         y: this.orbitRadius * Math.sin(futureAngle) * Math.sin(this.orbitTiltAngle),
    //         z: this.orbitRadius * Math.sin(futureAngle) * Math.cos(this.orbitTiltAngle)
    //     };
    // }

    calculateFuturePosition(minutesAhead) {    //STARI CALCF POSITION CEMO KORISTIT ZA INITIAL PATH DO PLANETA KAD SMO NA 10 % DISTANCA OD PLANETA SWITCHAMO NA TAJ LINER NOVI CALC KOJI CEMI NE RIJESIT SRANJE DA U POVRATKU ODE SHIP INTERCEPTA PRERANO NAPRIJED
        const angleChange = this.orbitSpeed * minutesAhead * 60; // Convert minutes to seconds
        const futureAngle = this.angle + (this.clockwise ? angleChange : -angleChange);

        return {
            x: this.orbitRadius * Math.cos(futureAngle),
            y: this.orbitRadius * Math.sin(futureAngle) * Math.sin(this.orbitTiltAngle),
            z: this.orbitRadius * Math.sin(futureAngle) * Math.cos(this.orbitTiltAngle)
        };
    }

    update() {
        this.mesh.rotation.y += this.rotationSpeed;
        this.angle += (this.clockwise ? 1 : -1) * this.orbitSpeed;
        this.mesh.position.x = this.orbitRadius * Math.cos(this.angle);
        this.mesh.position.y = this.orbitRadius * Math.sin(this.angle) * Math.sin(this.orbitTiltAngle);
        this.mesh.position.z = this.orbitRadius * Math.sin(this.angle) * Math.cos(this.orbitTiltAngle);
    }
}