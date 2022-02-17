import Vector from './Vector'


export default class Lattice extends Array {
    
    constructor(targetCellCount, width, height) {
        super();
        this.itemMap = new Map();
        this.targetCellCount = targetCellCount;
        this.width = width;
        this.height = height;
        this.#adjust();
    }
    updateSize(width, height) {
        if(this.width == width && this.height == height) return;
        this.width = width;
        this.height = height;
        this.#adjust();
    }
    updateTargetCellCount(targetCellCount) {
        if(this.targetCellCount == targetCellCount) return;
        this.targetCellCount = targetCellCount
        this.#adjust();
    }
    adjustCount(value, valueCreator) {
        while(value > this.itemMap.size) {
            this.add(valueCreator());
        }
        while(value < this.itemMap.size) {
            let m = this.itemMap.keys().next().value;
            if(m) {
                this.delete(m);
            }
        }
    }
    #adjust() {
        let targetCells = Math.ceil(this.itemMap.size / this.targetCellCount);
        if(this.itemMap.size == 0) {
            this.length = 0;

            this.cols = 1;
            this.rows = 1;
            this[0] = new Array(1).fill(new Set());
            this.cellWidth = Math.ceil(this.width / this.cols)
            this.cellHeight = Math.ceil(this.height / this.rows);
            
            return;
        }
        let count = 1;
        let oldRows = this.rows;
        let oldCols = this.cols;
        this.cols = 1;
        this.rows = 1;
        this.cellWidth = Math.ceil(this.width / this.cols)
        this.cellHeight = Math.ceil(this.height / this.rows)
        while(count < targetCells) {
            if(this.cellWidth < this.cellHeight) {
                this.rows++;
            } else { 
                this.cols++;
                
            }
            count = this.rows * this.cols;
            this.cellWidth = Math.ceil(this.width / this.cols)
            this.cellHeight = Math.ceil(this.height / this.rows)
        }
        this.length = this.rows;
        if(oldRows === this.rows && oldCols === this.cols) return;
        for(let i = 0; i < this.rows; i++) {
            this[i] = new Array(this.cols).fill(new Set());
        }
        let items = [...this.itemMap.keys()];
        for(let item of items) { 
            let mCoords = this.xyToMatrix(item.x, item.y);
            this[mCoords.row][mCoords.col].add(item);
            this.itemMap.set(item, mCoords);
        }
        
    }
    
    xyToMatrix(x, y) {
        let r = {
            col: Math.min(this.cols-1, Math.floor(Math.max(0, Math.min(this.width, x)) / this.cellWidth)),
            row: Math.min(this.rows-1, Math.floor(Math.max(0, Math.min(this.height, y)) / this.cellHeight))
        };
        return r;
    }
    
    distanceToCell(row, col, x, y) {
        let cellX = col * this.cellWidth;
        let cellY = row * this.cellHeight;
        let cellBottom = cellY + this.cellHeight;
        let cellRight = cellX + this.cellWidth;
        return Math.min(
            Math.sqrt(Math.pow(cellX - x, 2) + Math.pow(cellY - y, 2)),
            Math.sqrt(Math.pow(cellX - x, 2) + Math.pow(cellBottom - y, 2)),
            Math.sqrt(Math.pow(cellRight - x, 2) + Math.pow(cellY - y, 2)),
            Math.sqrt(Math.pow(cellRight - x, 2) + Math.pow(cellBottom - y, 2))
        )
    }
    
    add(model) {
        let mCoords = this.xyToMatrix(model.x, model.y)
        this.itemMap.set(model, mCoords)
        this[mCoords.row][mCoords.col].add(model);
        this.#adjust();
    }
    
    delete(model) {
        if(this.itemMap.has(model)) {
            let mCoords = this.itemMap.get(model);
            this.itemMap.delete(model);
            this[mCoords.row][mCoords.col].delete(model);
            this.#adjust(); 
        }
    } 
    
    updatePosition(model) {
        let prevMCoords = this.itemMap.get(model);
        if(!prevMCoords) return;
        let mCoords = this.xyToMatrix(model.x, model.y);
        if(prevMCoords.row === mCoords.row && prevMCoords.col === mCoords.col) return;
        
        this[mCoords.row][mCoords.col].add(model);

        this[prevMCoords.row][prevMCoords.col].delete(model);
        this.itemMap.set(model, mCoords);
        
    }

    collectNeighbors(p, sightRadius) {
        let neighbors = new Array();
        let distances = new Map();
        
        let topLeftLatticeCell = this.xyToMatrix(p.x - sightRadius, p.y - sightRadius);
        let bottomRightLatticeCell = this.xyToMatrix(p.x + sightRadius, p.y + sightRadius);
        
        for(let i = topLeftLatticeCell.row; i < bottomRightLatticeCell.row + 1; i++) {

            for(let j = topLeftLatticeCell.col; j < bottomRightLatticeCell.col + 1; j++) {

                if(this.distanceToCell(i,j,p.x,p.y) < sightRadius) {
                    for(let p2 of this[i][j]) {
                        if (p == p2) continue;
                        let distance = new Vector(p.x - p2.x, p.y - p2.y).magnitude() - (p.r + p2.r);

                        let isNeighborInSight = distance > sightRadius;

                        if(isNeighborInSight) continue;
                        distances.set(p2, distance);
                        neighbors.push(p2);
                    }
                }
            }   
        }
        return [neighbors, distances];
    }
    
    update(deltaTime, config) {
        const allModels = [...this.itemMap.keys()];
        const vecs = new Array(allModels.length);
        for(let a = 0; a < allModels.length; a++) {
            let p = allModels[a];
            let [neighbors, distances] = this.collectNeighbors(p, ((this.width) * config.sight));
            let vec = new Vector(...p.v);
            neighbors.forEach(p2=>{
                let distance = distances.get(p2);
                let isRepelled = distance < ((this.width/10) * config.bubble);
                let influenceVec;
                if (isRepelled) influenceVec = new Vector(p.x - p2.x, p.y - p2.y).scale(config.repellent/1000) 
                else influenceVec = new Vector(p2.x - p.x, p2.y - p.y).scale(config.attraction/5000);
                vec.add(influenceVec).normalize();
                vec.add(new Vector(...p2.v).normalize().scale(0.05 * config.herd)).normalize();
            })
            
            
            if(config.pointerOver) {
                let ptr = config.pointer;
                let distance = new Vector(p.x - ptr.x, p.y - ptr.y).magnitude() - p.r;
                let isPtrInSight = distance <= ((this.width) * config.sight);
                if(isPtrInSight) {
                    vec.add(new Vector(ptr.x - p.x, ptr.y - p.y).scale(config.attraction/50)).normalize();
                    if(!config.pointerDown) {
                        let ptr = config.pointer;

                        vec.add(new Vector(p.x - ptr.x, p.y - ptr.y).scale(config.attraction/5)).normalize();
                    }
                }
            }
            vecs[a] = vec.normalize();
        }

        for(let i = 0; i < allModels.length; i++) {
            const p = allModels[i];
            p.v = vecs[i]
            p.x += (p.v[0] * p.s * (config.speed * 200))/deltaTime;
            p.y += (p.v[1] * p.s * (config.speed * 200))/deltaTime;

            while((p.x - p.r) > this.width) p.x -= this.width;
            while((p.y - p.r) > this.height) p.y -= this.height;
            while((p.x + p.r) < 0) p.x += this.width;
            while((p.y + p.r) < 0) p.y += this.height;
            this.updatePosition(p)
        }  
    }
}