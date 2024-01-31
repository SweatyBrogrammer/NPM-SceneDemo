//main.js
import { SceneSetup } from '../Scripts/scene.js';
import { Sun } from '../Scripts/sun.js';
import { Planet } from '../Scripts/planet.js';
import { Ship } from '../Scripts/ship.js';
import * as THREE from 'three';
import { SceneInitializer } from '../Scripts/sceneInitializer.js';

const sceneInit = new SceneInitializer();


function animate() {
    requestAnimationFrame(animate);
    // Update all components in the scene (sun, planets, ship, etc.)
    sceneInit.update();

    // Render the updated scene
    sceneInit.sceneSetup.render();
}

animate();


