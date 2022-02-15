export default class Lattice extends Array {
    
    constructor(targetCellCount, width, height) {
        super();
        this.itemMap = new Map();
        this.targetCellCount = targetCellCount;
        this.width = width;
        this.height = height;
        this.#updateCols();
    }
    
    #updateCols() {
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
        this.#updateCols();
    }
    
    delete(model) {
        if(this.itemMap.has(model)) {
            let mCoords = this.itemMap.get(model);
            this.itemMap.delete(model);
            this[mCoords.row][mCoords.col].delete(model);
            this.#updateCols(); 
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
}