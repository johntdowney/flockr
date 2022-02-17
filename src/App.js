import './App.css';
import Particle from "./Particle.js";
import Lattice from "./Lattice.js";
import ParticlesView from './ParticlesView.js';

function App() {
    let config = {
        count:120,
        width: window.innerWidth,
        height: window.innerHeight,
        attraction:0.61,
        bubble: 0.035,
        sight:0.104,
        repellent: 0.028,
        herd:0.45,
        speed:0.15,
        latticeSize: 500,
        pointer:{x:0,y:0},
        pointerDown:false
    }
    
    const lattice = new Lattice(config.latticeSize, config.width, config.height);
    
    for(let i = 0; i < config.count; i++) {
        lattice.add(new Particle('a', config.width, config.height));
    }

    return (
        <div id="app-container" className="App">
            <ParticlesView config={config} models={lattice}/>
        </div>
    );
}

export default App;
