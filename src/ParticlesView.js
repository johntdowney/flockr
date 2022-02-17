import React from "react";
import Particle from "./Particle.js";
import ParticlesRenderer from './ParticlesRenderer.js';

export default class ParticlesView extends React.Component {

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
        this.setState({
            [name]: value 
        });

        if(name === 'count') {
            value = parseInt(value);
            this.models.adjustCount(value, ()=>new Particle('a', this.config.width, this.config.height));
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
                        <ParticlesRenderer width={this.config.width} height={this.config.height} models={this.models} config={this.config}/>
                    </div>
                </div>;
    }
}