//ship.js
import * as THREE from 'three';
export class Ship {
    constructor(position, speed) {
        this.position = position; // THREE.Vector3
        this.speed = speed; // Units per second
        this.targetPosition = null; // THREE.Vector3

        // Ship's representation (e.g., a simple sphere)
        this.geometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);
        this.destinationPlanet = null;

        // Line to show path (initially empty)
        this.pathLine = new THREE.Line(
            new THREE.BufferGeometry(),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
        );

    }

    setDestinationPlanet(planet) {
        this.destinationPlanet = planet; // Set the destination planet
        const targetPosition = new THREE.Vector3().copy(planet.mesh.position);
        this.updateTarget(targetPosition);
    }

    returnToStartingPlanet(startingPlanet, currentTime) {
        // Calculate the time it will take to reach the starting planet
        console.log(startingPlanet);
        const distanceToStartingPlanet = this.position.distanceTo(startingPlanet.mesh.position);
        const timeToReachStarting = distanceToStartingPlanet / this.speed; // Assuming constant speed

        // Calculate the future position of the starting planet
        const futurePositionOfStartingPlanet = startingPlanet.calculateFuturePosition(timeToReachStarting);

        // Update the ship's target to this new position
        this.updateTarget(new THREE.Vector3(futurePositionOfStartingPlanet.x, futurePositionOfStartingPlanet.y, futurePositionOfStartingPlanet.z));
    }

    
    updateTarget(targetPosition) {
        this.targetPosition = targetPosition;
        this.updatePathLine();
    }

    updatePathLine() {
        const pathGeometry = new THREE.BufferGeometry().setFromPoints([this.mesh.position, this.targetPosition]);
        this.pathLine.geometry.dispose(); // Dispose old geometry
        this.pathLine.geometry = pathGeometry;
    }

    update() {
        if (!this.targetPosition) return;
    
        console.log("Updating ship position"); // Debugging
        const currentDistance = this.position.distanceTo(this.destinationPlanet.mesh.position);
        const relativeSpeed = this.speed + this.destinationPlanet.orbitSpeed; // Example of combining speeds
        const timeToIntercept = currentDistance / relativeSpeed; // Calculate intercept time considering relative speeds
    
        // Calculate the future position of the destination planet
        const futurePosition = this.destinationPlanet.calculateFuturePosition(timeToIntercept);
        this.updateTarget(new THREE.Vector3(futurePosition.x, futurePosition.y, futurePosition.z));

        // Calculate direction towards the target
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.position).normalize();
    
        // Move the ship towards the target
        const moveDistance = this.speed / 60; // Assuming 60 FPS
        this.mesh.position.addScaledVector(direction, moveDistance);
    
        // Update the ship's position
        this.position.copy(this.mesh.position);
    
        // Update the path line if necessary
        this.updatePathLine();
    }
}