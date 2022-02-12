//import logo from './logo.svg';
import './App.css';
import React from "react";
import ReactDOM from 'react-dom';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

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
    
    constructor(cols, width, height) {
        super();
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.cellSize = Math.ceil(this.width / this.cols);
        this.rows = Math.ceil(this.height / this.cellSize);
        this.length = this.rows;
        for(let i = 0; i < this.rows; i++) {
            this[i] = new Array(this.cols).fill(new Set());
        }
    }
    
    xyToMatrix(x, y) {
        return {
            col: Math.floor(Math.max(0, Math.min(this.width, x)) / this.cellSize),
            row: Math.floor(Math.max(0, Math.min(this.height, y)) / this.cellSize)
        };
    }
    
    add(model) {
        let mCoords = this.xyToMatrix(model.x, model.y)
        this[mCoords.row][mCoords.col].add(model);
    }
    delete(model) {
        let mCoords = this.xyToMatrix(model.x, model.y)
        this[mCoords.row][mCoords.col].delete(model);
    }
}

const ParticlesView = (props)=> {

    const [count, setCount] = React.useState(0)

    const updateTimeStep = (timestep) => {

        for(let p of props.models) {
            let avgVec = new Vector(0, 0);
            let neighborCount = 0;
            for(let p2 of props.models) {
                if (p == p2) continue;
                let distance = new Vector(p.x - p2.x, p.y - p2.y).magnitude() - (p.r + p2.r);
                
                let isNeighborInSight = distance > ((props.width/10) * props.config.sight);
                
                if(isNeighborInSight) continue;
                neighborCount++;
                avgVec.add(p2.v)
                let isRepelled = distance < ((props.width/10) * props.config.bubble);
                let influenceVec;
                if (isRepelled) influenceVec = new Vector(p.x - p2.x, p.y - p2.y).scale(props.config.repellent) 
                else influenceVec = new Vector(p2.x - p.x, p2.y - p.y).scale(props.config.attraction/100);
                
                p.v.add(influenceVec).normalize();
            }
            if(neighborCount > 0) {
                p.v.add(avgVec.normalize().scale(0.05 * props.config.herd));
            }
        }

        for(let p of props.models) {
            p.x += p.v[0] * p.s * props.config.speed;
            p.y += p.v[1] * p.s * props.config.speed;

            while((p.x - p.r) > props.width) p.x -= props.width;
            while((p.y - p.r) > props.height) p.y -= props.height;
            while((p.x + p.r) < 0) p.x += props.width;
            while((p.y + p.r) < 0) p.y += props.height;
        }  

    }


    useAnimationFrame((deltaTime, time) => {
        // Pass on a function to the setter of the state
        // to make sure we always have the latest state
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100)
        updateTimeStep(time);
    })
    const ps = props.models.map((model) => {
        return  <g key={model.id}>
                    <circle cx={isNaN(model.x)?0:model.x} cy={isNaN(model.y)?0:model.y} r={model.r} fill="rgba(255,255,255,0.3)"/>
                </g>;
    });
    return  <svg version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg">
                {ps}
            </svg>;
}

class Particles extends React.Component {
    constructor(props) {
        super(props);
        this.config = props.config;
        this.state = JSON.parse(JSON.stringify(props.config));
        this.models = [];
        for(let i = 0; i < this.config.count; i++) this.models.push(this.createRandomParticle());
        
        this.lattice = new Lattice(this.config.latticeSize, this.config.width, this.config.height);
        for(let i = 0; i < this.models.length; i++) {
            this.lattice.add(this.models[i]);
        }
        console.log("lattice = ", this.lattice);
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
            while(value > this.models.length) {
                let m = this.createRandomParticle();
                this.models.push(m);
                this.lattice.add(m);
            }
            while(value > this.models.length) {
                let m = this.models[this.models.length];
                this.lattice.delete(m);
                this.models.pop();
            }
        }
        this.config[name] = value;
    }
    createRandomParticle() {

        let radius = 1+(Math.random() * 5);
        let x = Math.random() * this.config.width;
        let y = Math.random() * this.config.height;

        x = Math.min(Math.max(x, radius), this.config.width-radius);
        y = Math.min(Math.max(y, radius), this.config.height-radius);
        let dx = Math.random() - 0.5;
        let dy = Math.random() - 0.5;
        let speed = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
        dx /= speed;
        dy /= speed;
        speed /= radius;
        //        speed = 1;

        return {id:uuidv4(), x:x, y:y, v: new Vector(dx, dy), s:speed, r:radius};
    }


    render() {
        return  <div>
                    <div style={{display:'flex', flexDirection:'row', fontSize:'11px', textTransform:'uppercase', justifyContent:'space-between'}}>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <label htmlFor="speed">Count<br />{this.config.count}</label>
                            <input 
                                id="count"
                                name="count" 
                                type="number" 
                                min="1"  step="1"
                                value={this.config.count} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <label htmlFor="attraction">Attraction<br />{this.config.attraction}</label>
                            <input 
                                id="attraction"
                                name="attraction" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.attraction} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <label htmlFor="repellent">Repellent<br />{this.config.repellent}</label>
                            <input 
                                id="repellent"
                                name="repellent" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.repellent} 
                                onChange={this.onSliderChange} />
                        </div>

                        <div style={{display:'flex', flexDirection:'column'}}>
                            <label htmlFor="bubble">Personal Bubble<br />{this.config.bubble}</label>
                            <input 
                                id="bubble"
                                name="bubble" 
                                type="range" 
                                min="0" max="1" step="0.001"
                                value={this.config.bubble} 
                                onChange={this.onSliderChange} />
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
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
                    <div style={{backgroundColor:'rgba(0,0,0,0.25)'}}>
                        <ParticlesView width={this.config.width} height={this.config.height} models={this.models} config={this.config}/>
                    </div>
                </div>;
    }
}



function App() {
    let config = {
        count:100,
        height:600,
        width:800,
        attraction:0,
        bubble: 0,
        sight:3,
        repellent: 0,
        herd:0.1,
        speed:10,
        latticeSize: 10
    }


    return (
        <div className="App">
            <header className="App-header">
                <Particles config={config} />
            </header>
        </div>
    );
}

export default App;
