export class Player {
    constructor(id) {
        this.id = id;
        this.ownedPlanets = [];
        this.fleet = [];
    }

    addPlanet(planet) {
        this.ownedPlanets.push(planet);
    }

    addShip(ship) {
        this.fleet.push(ship);
    }

    // Additional methods as needed...
}