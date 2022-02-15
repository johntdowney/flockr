export default class Vector extends Array {
    constructor(...array) {
        if (array.length === 1) {
            super();
            this.push(array[0]);
        } else super(...array);
    }

    add(other) {
        for(let i = 0; i < this.length; i++) {
            this[i] += other[i];
        }
        return this;
    }
    magnitude() {
        return Math.sqrt(this.map((e, i) => Math.pow(e, 2)).reduce((prev, v) => prev + v, 0));
    }
    normalize() {
        let m = this.magnitude();
        if(m !== 0) {
            this.scale(1/this.magnitude())   
        }
        return this;
    }

    scale(s) {
        for(let i = 0; i < this.length; i++) this[i] *= s;
        return this;
    }
}

