import Vector from './Vector';


test('can instantiate', () => {
    let vector = new Vector(0);
    expect(vector.length).toBe(1);
    expect(vector[0]).toBe(0);
    vector = new Vector(2, 1);
    expect(vector.length).toBe(2);
    expect(vector[0]).toBe(2);
    expect(vector[1]).toBe(1);
    vector = new Vector();
    expect(vector.length).toBe(0);
    expect(vector[0]).toBeUndefined();
});
test('can add', () => {
    const v1 = new Vector(0, 3), v2 = new Vector(4, 5);
    v1.add(v2);
    expect(v1[0]).toBe(4);
    expect(v1[1]).toBe(8);
});
test('can correctly calculate magnitude', () => {
    const tests = [[1,8], [0, 10], [-3,4]];
    for(let test of tests) {
        const v = new Vector(test[0], test[1]);
        expect(v.magnitude()).toBe(Math.sqrt(Math.pow(test[0],2) + Math.pow(test[1],2)));
    }
});
test('can correctly normalize', () => { 
    const tests = [[1,8], [0, 10], [0,0], [-3,4]];
    for(let test of tests) {
        const x = test[0], y = test[1];
        const v = new Vector(x, y);
        let m = v.magnitude();
        v.normalize();
        if(m !== 0) {
            expect(v[0]).toBeCloseTo(x/m, 5);
            expect(v[1]).toBeCloseTo(y/m, 5);        
        } else {
            expect(v[0]).toBe(0);
            expect(v[1]).toBe(0);
        }
        
    }
    
});
    
test('can correctly scale', () => { 
    const tests = [[1,8, 100], [0, 10, 0.5], [0,0, 100], [-3,4,1/4]];
    for(let test of tests) {
        const x = test[0], y = test[1], scalar = test[2];
        const v = new Vector(x, y);
        v.scale(scalar)
        expect(v[0]).toBe(x * scalar);
        expect(v[1]).toBe(y * scalar);    
    }
    
});