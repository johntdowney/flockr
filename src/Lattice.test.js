import Lattice from './Lattice';
import Particle from './Particle';

    
test('Lattice: Add 100 particles - 400x200 - 10 particles/cell', () => {
    const width = 400, height = 200, targetParticlesPerCell = 10, totalParticles = 100;
    
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    for(let i = 0; i < totalParticles; i++) {
        lattice.add(new Particle(width, height));
    }
    expect(lattice.itemMap.size).toBe(totalParticles);
    expect(lattice.length * lattice[0].length).toBeGreaterThanOrEqual(totalParticles/targetParticlesPerCell);
    for(let [particle, mCoords] of lattice.itemMap) {
        let actualMCoords = lattice.xyToMatrix(particle.x, particle.y)
        expect(actualMCoords.row).toBe(mCoords.row)
        expect(actualMCoords.col).toBe(mCoords.col)
    }
//    for(let i = 0; i < lattice.itemMap)
});
//    
//test('Lattice: Add 100 particles - 400x200 - 10 particles/cell', () => {
//    const width = 400, height = 200, targetParticlesPerCell = 10, totalParticles = 100;
//    
//    const lattice = new Lattice(targetParticlesPerCell, width, height);
//    
//    for(let i = 0; i < totalParticles; i++) {
//        lattice.add(new Particle(width, height));
//    }
//    for(let i = 0; i < lattice.itemMap)
//});