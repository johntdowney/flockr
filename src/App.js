//import logo from './logo.svg';
import './App.css';
import React from "react";
import ReactDOM from 'react-dom';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import ResizeSensor from 'resize-sensor'

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (((c ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >> (c / 4)).toString(16)
    );
}

const useAnimationFrame = callback => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = React.useRef();
    const previousTimeRef = React.useRef();

    const animate = time => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime, time)
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Make sure the effect runs only once
}

class Vector extends Array {
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
        this.scale(1/this.magnitude())
        return this;
    }

    scale(s) {
        for(let i = 0; i < this.length; i++) this[i] *= s;
        return this;
    }
}
class Lattice extends Array {
    
    constructor(targetCellCount, width, height) {
        super();
        this.itemMap = new Map();
        this.targetCellCount = targetCellCount;
        this.width = width;
        this.height = height;
        this.updateCols();
    }
    updateCols() {
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
        
//        console.log(`xyToMatrix(${x}, ${y}) = `,r);
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
        this.updateCols();
    }
    delete(model) {
        if(this.itemMap.has(model)) {
            
            let mCoords = this.itemMap.get(model);
            this.itemMap.delete(model);
            this[mCoords.row][mCoords.col].delete(model);
            this.updateCols(); 
            
        }
    } 
    
    updatePosition(model) {
        let mCoords = this.xyToMatrix(model.x, model.y);
        if(!this[mCoords.row][mCoords.col].has(model)) {
            this[mCoords.row][mCoords.col].add(model);
            let prevMCoords = this.itemMap.get(model);
            if(prevMCoords) this[prevMCoords.row][prevMCoords.col].delete(model);
            this.itemMap.set(model, mCoords);
        }
    }
}

const ParticlesView = (props)=> {

    const [count, setCount] = React.useState(0)

    const updateTimeStep = (timestep) => {
        const allModels = [...props.models.itemMap.keys()];
        for(let p of allModels) {
            let avgVec = new Vector(0, 0);
            let latticeCoords = props.models.itemMap.get(p);
            let sightRadius = ((props.width) * props.config.sight);
            let topLeftLatticeCell = props.models.xyToMatrix(p.x - sightRadius, p.y - sightRadius);
            let bottomRightLatticeCell = props.models.xyToMatrix(p.x + sightRadius, p.y + sightRadius);
            
            let neighborCount = 0;
            for(let i = topLeftLatticeCell.row; i < bottomRightLatticeCell.row + 1; i++) {
                 
                for(let j = topLeftLatticeCell.col; j < bottomRightLatticeCell.col + 1; j++) {
                    
                    if(props.models.distanceToCell(i,j,p.x,p.y) < sightRadius) {
                        for(let p2 of props.models[i][j]) {
                            if (p == p2) continue;
                            let distance = new Vector(p.x - p2.x, p.y - p2.y).magnitude() - (p.r + p2.r);

                            let isNeighborInSight = distance > ((props.width) * props.config.sight);

                            if(isNeighborInSight) continue;
                            neighborCount++;
                            avgVec.add(p2.v)
                            let isRepelled = distance < ((props.width/10) * props.config.bubble);
                            let influenceVec;
                            if (isRepelled) influenceVec = new Vector(p.x - p2.x, p.y - p2.y).scale(props.config.repellent/100) 
                            else influenceVec = new Vector(p2.x - p.x, p2.y - p.y).scale(props.config.attraction/5000);

                            p.v.add(influenceVec).normalize();
                        }
                    }
                }   
            }
            
            if(neighborCount > 0) {
                p.v.add(avgVec.normalize().scale(0.05 * props.config.herd)).normalize();
            }
            
            if(props.config.pointerOver) {
                let ptr = props.config.pointer;
                let distance = new Vector(p.x - ptr.x, p.y - ptr.y).magnitude() - p.r;
                let isPtrInSight = distance <= ((props.width) * props.config.sight);
                if(isPtrInSight) {
                    p.v.add(new Vector(ptr.x - p.x, ptr.y - p.y).scale(props.config.attraction/50)).normalize();
                    if(props.config.pointerDown) {
                        let ptr = props.config.pointer;

                        p.v.add(new Vector(p.x - ptr.x, p.y - ptr.y).scale(props.config.attraction/5)).normalize();
                    }
                }
            }
        }

        for(let p of allModels) {
            
            p.v.normalize();
            p.x += p.v[0] * p.s * (props.config.speed * 100);
            p.y += p.v[1] * p.s * (props.config.speed * 100);

            while((p.x - p.r) > props.width) p.x -= props.width;
            while((p.y - p.r) > props.height) p.y -= props.height;
            while((p.x + p.r) < 0) p.x += props.width;
            while((p.y + p.r) < 0) p.y += props.height;
            props.models.updatePosition(p)
        }  

    }


    useAnimationFrame((deltaTime, time) => {
        // Pass on a function to the setter of the state
        // to make sure we always have the latest state
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100)
        updateTimeStep(time);
    })
    const ps = [...props.models.itemMap.keys()].map((model) => {
        
        return <circle key={model.id} cx={isNaN(model.x)?0:model.x} cy={isNaN(model.y)?0:model.y} r={model.r} fill="rgba(255,255,255,0.3)"/>;
                
    });
    const onMouseEnter = () => {
//        props.config.pointerOver = true
    }
    const onMouseLeave = () => {
        props.config.pointerOver = false
    }
    const onMouseDown = () => {
        props.config.pointerDown = true
    }
    const onMouseUp = () => {
        props.config.pointerDown = false
    }
    const onMouseMove = (e) => {
//        this.props.config.pointer.x = 
//        console.log("MOUSE OVER", e)
        props.config.pointerOver = true
        props.config.pointer = {x: (e.clientX / window.innerWidth) * props.width, y: (e.clientY / window.innerHeight) * props.height};
        
    }
    let colWidth = props.width / props.models.cols;
    let rowHeight = props.height / props.models.rows;
    
    const hLines = new Array(props.models.rows-1).fill().map((e,i)=>{ 
        return <line key={"hline-"+i} x1="0" y1={(i + 1) * rowHeight} x2={props.width} y2={(i + 1) * rowHeight} stroke="black"
       strokeOpacity="0.2" ></line> 
    });
    
    const vLines = new Array(props.models.cols-1).fill().map((e,i)=>{
        return <line key={"hline-"+i} x1={(i + 1) * colWidth} y1="0" x2={(i + 1) * colWidth} y2={props.height} stroke="black"
       strokeOpacity="0.2" ></line> 
    });
    
    
    
                   
    return  <svg onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} preserveAspectRatio="none" version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg">
                <g>
                {hLines}
                </g>
                <g>
                {vLines}
                </g>
                <g>
                {ps}
                </g>
            </svg>;
}

class Particle {
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
}

class Particles extends React.Component {
    constructor(props) {
        super(props);
        this.config = props.config;
        this.state = JSON.parse(JSON.stringify(props.config));
        this.models = props.models;
        this.onSliderChange = this.onSliderChange.bind(this);    
    }



    onSliderChange(event) {
        const target = event.target;
        let value = parseFloat(target.value);
        const name = target.name
//        console.log("onSliderChange() value = ",value, "name = ", name);
        this.setState({
            [name]: value 
        });

        if(name === 'count') {
            value = parseInt(value);
            while(value > this.models.itemMap.size) {
                let m = new Particle(this.config.width, this.config.height);
                this.models.add(m);
            }
            while(value < this.models.itemMap.size) {
                let m = this.models.itemMap.keys().next().value;
                if(m) {
                    this.models.delete(m);
                }
                
            }
        }
        this.config[name] = value;
    }


    render() {
        return  <div className="particles-container">
                    <div className="controls">
                        <div>
                            <label htmlFor="speed">Count<br />{this.config.count}</label>
                            <input 
                                id="count"
                                name="count" 
                                type="number" 
                                min="1"  step="1"
                                value={this.config.count} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div>
                            <label htmlFor="speed">Speed<br />{this.config.speed}</label>
                            <input 
                                id="speed"
                                name="speed" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.speed} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div>
                            <label htmlFor="sight">Sight Radius<br />{this.config.sight}</label>
                            <input 
                                id="sight"
                                name="sight" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.sight} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div>
                            <label htmlFor="attraction">Attraction<br />{this.config.attraction}</label>
                            <input 
                                id="attraction"
                                name="attraction" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.attraction} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div>
                            <label htmlFor="repellent">Repellent<br />{this.config.repellent}</label>
                            <input 
                                id="repellent"
                                name="repellent" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.repellent} 
                                onChange={this.onSliderChange} />
                        </div>

                        <div>
                            <label htmlFor="bubble">Personal Bubble<br />{this.config.bubble}</label>
                            <input 
                                id="bubble"
                                name="bubble" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.bubble} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div>
                            <label htmlFor="herd">Herd Mentality<br />{this.config.herd}</label>

                            <input 
                                id="herd"
                                name="herd" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.herd} 
                                onChange={this.onSliderChange} />
                        </div>
                    </div>
                    <div className="particles-view">
                        <ParticlesView width={this.config.width} height={this.config.height} models={this.models} config={this.config}/>
                    </div>
                </div>;
    }
}


function App() {
    let config = {
        count:60,
        width: window.innerWidth,
        height: window.innerHeight,
        attraction:0.61,
        bubble: 0.035,
        sight:0.104,
        repellent: 0.028,
        herd:0.45,
        speed:0.15,
        latticeSize: 15,
        pointer:{x:0,y:0},
        pointerDown:false
    }
    
    const models = [];
    for(let i = 0; i < config.count; i++) models.push(new Particle(config.width, config.height));
    const lattice = new Lattice(config.latticeSize, config.width, config.height);
    
    for(let i = 0; i < models.length; i++) {
        lattice.add(models[i]);
    }
    console.log("lattice = ", lattice);

    return (
        <div id="app-container" className="App">
            <Particles config={config} models={lattice}/>
        </div>
    );
}

export default App;
