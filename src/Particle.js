import Vector from "./Vector.js";
const getRandomValues = require('get-random-values');


function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (((c ^ getRandomValues(new Uint8Array(1))[0]) & 15) >> (c / 4)).toString(16)
    );
};

export default class Particle {
    constructor(worldWidth, worldHeight) {
        
        let radius = 3+(Math.random() * 5);
        let x = Math.random() * worldWidth;
        let y = Math.random() * worldHeight;

        x = Math.min(Math.max(x, radius), worldWidth-radius);
        y = Math.min(Math.max(y, radius), worldHeight-radius);
        let dx = Math.random() - 0.5;
        let dy = Math.random() - 0.5;
        let speed = 1;//Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
        dx /= speed;
        dy /= speed;
        speed /= (radius);
        //        speed = 1;

        this.id = uuidv4();
        this.x = x;
        this.y = y;
        this.v = new Vector(dx, dy);
        this.s = speed;
        this.r = radius;
    }
};