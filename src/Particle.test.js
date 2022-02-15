import Lattice from './Lattice';
import Particle from './Particle';
import Vector from './Vector';

    
test('can instantiate 100 particles', () => {
    const width = 400, height = 800;
    let ps = [];
    let psMap = new Map();
    for(let i = 0; i < 100; i++) {
        let p = new Particle(width, height);
        expect(p.x).not.toBeNaN();
        expect(p.y).not.toBeNaN();
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(width);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(height);
        expect(p.v).toBeInstanceOf(Vector);
        expect(p.v[0]).not.toBeNaN();
        expect(p.v[1]).not.toBeNaN();
        expect(p.r).not.toBeNaN()
        ps.push(p);
        psMap.set(p.id);
    }
    // Check to make sure each of the particle ids are unique.
    expect(psMap.size).toBe(ps.length);
});