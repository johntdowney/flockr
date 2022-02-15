import Lattice from './Lattice';
import Particle from './Particle';

   

test('correctly translates (x,y) to (row,col) coordinates', () => {
    const width = 500, height = 200, targetParticlesPerCell = 10;
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    let xy = lattice.xyToMatrix(-100, -1);
    expect(xy.row).toBe(0)
    expect(xy.col).toBe(0)
    
    for(let i = 0; i < 100; i++) {
        lattice.add(new Particle(width, height));
    }
    expect(lattice.rows).toBe(2)
    expect(lattice.cols).toBe(5)
    
    xy = lattice.xyToMatrix(399, 120);
    expect(xy.row).toBe(1)
    expect(xy.col).toBe(3)
    
    xy = lattice.xyToMatrix(400, 99);
    expect(xy.row).toBe(0)
    expect(xy.col).toBe(4)
    
});


test('can instantiate Lattice', () => {
    const width = 400, height = 200, targetParticlesPerCell = 10;
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    expect(lattice.itemMap.size).toBe(0);
    expect(lattice.length).toBe(1);
    expect(lattice[0].length).toBe(1);
    expect(lattice[0][0].size).toBe(0);
    expect(lattice.targetCellCount).toBe(targetParticlesPerCell)
    expect(lattice.width).toBe(width)
    expect(lattice.height).toBe(height)
    expect(lattice.cols).toBe(1)
    expect(lattice.rows).toBe(1)
    expect(lattice.cellWidth).toBe(width)
    expect(lattice.cellHeight).toBe(height)
});


test('correctly updates Particles\' position', () => {
    const width = 500, height = 200, targetParticlesPerCell = 10, totalParticles = 100;
    
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    for(let i = 0; i < totalParticles; i++) {
        lattice.add(new Particle(width, height));
    }
    
    const tests =[
        [[300, 100], [1, 3]],
        [[99, 550], [1, 0]],
        [[96, 540], [1, 0]],
        [[150, 99], [0, 1]],
        [[400, 100], [1, 4]],
        [[-Infinity, -Infinity], [0, 0]],
        [[Infinity, Infinity], [1, 4]]
    ];
    let allParticles = [...lattice.itemMap.keys()]
    let p = allParticles[0];
    for(let test of tests) {
        let input = test[0];
        let output = test[1];
        p.x = input[0];
        p.y = input[1];
        lattice.updatePosition(p);
        let mCoords = lattice.itemMap.get(p);
        expect(mCoords.row).toBe(output[0]);
        expect(mCoords.col).toBe(output[1]);
    }
});


test('can add Particles to/remove Particles from', () => {
    const width = 400, height = 600, targetParticlesPerCell = 10, totalParticles = 100;
    
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    for(let i = 0; i < totalParticles; i++) {
        expect(lattice.itemMap.size).toBe(i);
        expect(lattice.rows * lattice.cols).toBeGreaterThanOrEqual((i)/targetParticlesPerCell);
        lattice.add(new Particle(width, height));
    }
    expect(lattice.itemMap.size).toBe(totalParticles);
    
    let allParticles = [...lattice.itemMap.keys()]
    for(let i = 0; i < allParticles.length; i++) {
        expect(lattice.itemMap.size).toBe(totalParticles - i);
        expect(lattice.rows * lattice.cols).toBeGreaterThanOrEqual((totalParticles - i)/targetParticlesPerCell);
        lattice.delete(allParticles[i]);
    }
    expect(lattice.itemMap.size).toBe(0);
});

test('correctly calculates distance to cell', () => {
    const width = 500, height = 200, targetParticlesPerCell = 10;
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    for(let i = 0; i < 100; i++) {
        lattice.add(new Particle(width, height));
    }
    expect(lattice.rows).toBe(2)
    expect(lattice.cols).toBe(5)
    
    expect(lattice.distanceToCell(0, 0, 300, 150)).toBe(Math.sqrt(Math.pow(100 - 300, 2) + Math.pow(100 - 150, 2)))
    expect(lattice.distanceToCell(0, 4, 300, 150)).toBe(Math.sqrt(Math.pow(400 - 300, 2) + Math.pow(100 - 150, 2)))
    expect(lattice.distanceToCell(1, 0, 300, 150)).toBe(Math.sqrt(Math.pow(100 - 300, 2) + Math.pow(100 - 150, 2)))
    expect(lattice.distanceToCell(1, 4, 300, 150)).toBe(Math.sqrt(Math.pow(400 - 300, 2) + Math.pow(100 - 150, 2)))
    
    
});

test('correctly handles Particles/incorrect input', () => {
    const width = 500, height = 200, targetParticlesPerCell = 10;
    const lattice = new Lattice(targetParticlesPerCell, width, height);
    
    for(let i = 0; i < 100; i++) {
        lattice.add(new Particle(width, height));
    }
    let nonsenseObject = {id:"I'm nothing!"};
    lattice.delete(nonsenseObject);
    lattice.updatePosition(nonsenseObject)
    
});

