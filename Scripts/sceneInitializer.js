//scene intializator js
import { SceneSetup } from '../Scripts/scene.js';
import { Sun } from '../Scripts/sun.js';
import { Planet } from '../Scripts/planet.js';
import { Ship } from '../Scripts/ship.js';
import { Player } from './player.js'; // Assuming Player.js exists
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneInitializer {
    constructor() {
        // Scene setup
        this.sceneSetup = new SceneSetup();

        // Initialize sun
        this.sun = new Sun('images/molten.jpg', 1.6);
        this.sceneSetup.scene.add(this.sun.mesh);

        // Initialize planets
        this.planets = this.createPlanets();

        // Add planets to the scene
        this.planets.forEach(planet => {
            this.sceneSetup.scene.add(planet.mesh);
            this.sceneSetup.scene.add(planet.orbitPath);
        });

        this.isShipActive = false;

        this.isReturning = false;
        // Initialize player and fleet movement
        this.player = new Player(1);
        this.initializePlayerPlanets();
        this.initializeOrbitControls();
        this.addPlanetEventListeners();
        

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    
        this.onMouseClick = this.onMouseClick.bind(this);
        window.addEventListener('click', this.onMouseClick);

        this.initializeFleetMovement();
    }

    createPlanets() {
        return [
        new Planet('images/desert2.jpg', 0.6, 0.001, 3.5, 0.001, 0.6, true),
        new Planet('images/desert.jpg', 0.4, 0.002, 5, 0.00004, 0.3,false),
        new Planet('images/green.jpg', 0.7, 0.001, 7, 0.001, 0.17,true),
        new Planet('images/green2.jpg', 0.85, 0.0015, 9, 0.00002, 0.33,false),
        new Planet('images/ice.jpg', 1.2, 0.0019, 11, 0.0001, 0.4,false),
        new Planet('images/coldplanet.jpg', 0.8, 0.0023, 13, 0.001, 0.5,true)
        ];
    }

    onMouseClick =(event) => {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.sceneSetup.camera);
    
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.planets.map(p => p.mesh));
    
        if (intersects.length > 0) {
            this.onPlanetClick(event,intersects[0]);
        }
    }

    initializePlayerPlanets() {
        const startingPlanet = this.planets[0];
        this.player.addPlanet(startingPlanet);
    }

    initializeFleetMovement() {
        var shipStartPosition = new THREE.Vector3().copy(this.planets[1].mesh.position);
        console.log("Initial ship start position:", shipStartPosition); // Debugging
    
        var me = this;
        const ship = new Ship(shipStartPosition, 0.5); // Assuming a constructor for Ship
        this.player.addShip(ship);
        this.sceneSetup.scene.add(ship.mesh); // Add the ship to the scene
    
        console.log("Ship position after adding to scene:", ship.mesh.position); // Debugging
    
        this.activeShip = ship; // Keep a reference
    }

    initializeOrbitControls() {
        this.controls = new OrbitControls(this.sceneSetup.camera, this.sceneSetup.renderer.domElement);
        this.controls.enableDamping = true; 
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = 0.6;
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.5;
        this.controls.screenSpacePanning = false;
    }

    showTooltip(event, planet) {
        const tooltip = document.getElementById('planet-tooltip');
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
        tooltip.innerHTML = `
            <div>Planet: ${planet.name}</div>
            <button onclick="sceneInitializer.deployToPlanet('${planet.name}')">Deploy</button>
            <button onclick="sceneInitializer.transportToPlanet('${planet.name}')">Transport</button>
        `;
    }

    addPlanetEventListeners() {
        this.planets.forEach(planet => {
            planet.mesh.userData = { planet: planet }; // Store planet reference in userData
            planet.mesh.addEventListener('click', this.onPlanetClick.bind(this));
        });
    }

    onPlanetClick(event,intersection) {
        console.log("Planet clicked:", intersection.object); // Debugging
        const clickedPlanet = intersection.object.userData.planet;
        this.showTooltip(event, clickedPlanet);
        var me = this;
        if (!this.player.ownedPlanets.includes(clickedPlanet)) {
            me.isShipActive=true;
            this.sendShipToPlanet(clickedPlanet);
        }
    }

    sendShipToPlanet(destinationPlanet) {
        // Send the first available ship in the fleet to the clicked planet
        const ship = this.player.fleet[0];
        if (ship) {
            ship.setDestinationPlanet(destinationPlanet);
            this.activeShip = ship; // Set the active ship
            // Additional logic for ship movement
        }
    }

    updateShip() {
        const ship = this.activeShip;
        if (!ship) return; // Exit if there's no active ship
    
        var isReturning = false;
        // Calculate the current distance to the destination
        const currentDistance = ship.mesh.position.distanceTo(ship.destinationPlanet.mesh.position);
        console.log('Current Distance to Destination:', currentDistance);
    
        // Calculate time to intercept (assuming distance and speed are in the same units)
        const timeToIntercept = currentDistance / ship.speed;
        console.log('Time to Intercept:', timeToIntercept);
    
        // Calculate future position of the destination planet
        const futurePosition = ship.destinationPlanet.calculateFuturePosition(timeToIntercept / 60); // Convert seconds to minutes
        ship.updateTarget(new THREE.Vector3(futurePosition.x, futurePosition.y, futurePosition.z));
    
        // Handling the ship's return logic
        if (this.isReturning) {
          const distanceToStart = ship.mesh.position.distanceTo(this.planets[0].mesh.position); // Assuming the first planet is the return destination
          console.log('Distance to Start on Return:', distanceToStart);
          if (distanceToStart <= 0.3) { // Define someReturnThreshold as needed
            console.log('Ship has returned. Removing from scene.');
            this.sceneSetup.scene.remove(ship.mesh); // Remove ship mesh from the scene
            this.isReturning = false;
            this.isShipActive = false; // Stop updating the ship
            // Additional logic after the ship returns
          }
        }
    
        // Handling switching to next destination or stopping the ship
        if (!this.isReturning && currentDistance <= 0.3) { // Define someArrivalThreshold as needed
          console.log('Switching to next destination or stopping the ship');
          isReturning = true;
        }
    
        // Update the ship's position and other properties
        ship.update(); // Assuming Ship class has an update method
    }

    update() {
        this.sun.update();
        this.planets.forEach(planet => planet.update());

        if (this.isShipActive) {
            this.updateShip();
        }

        this.controls.update();
    }
}

