import React from "react";
import Vector from "./Vector";
import { useWindowDimension, useAnimationFrame } from './Tools'

const ParticlesRenderer = (props)=> {
    
    [props.config.width, props.config.height] = useWindowDimension(props.config);
    props.models.updateSize(props.config.width, props.config.width);
    const [count, setCount] = React.useState(0);
    

    useAnimationFrame((deltaTime, time) => {
        // Pass on a function to the setter of the state
        // to make sure we always have the latest state
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100)
        props.models.update(deltaTime, props.config);
    })
    const ps = [...props.models.itemMap.keys()].map((model) => {
        
        return <circle key={model.id} cx={isNaN(model.x)?0:model.x} cy={isNaN(model.y)?0:model.y} r={model.r} fill="rgba(255,255,255,0.3)"/>;
                
    });
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
        props.config.pointerOver = true
        props.config.pointer = {x: (e.clientX / window.innerWidth) * props.width, y: (e.clientY / window.innerHeight) * props.height};
        
    }
    let colWidth = props.width / props.models.cols;
    let rowHeight = props.height / props.models.rows;
    
    const hLines = new Array(props.models.rows-1).fill().map((e,i)=>{ 
        return <line key={"hline-"+i} x1="0" y1={(i + 1) * rowHeight} x2={props.width} y2={(i + 1) * rowHeight} stroke="black" strokeOpacity="0.2" ></line> 
    });
    
    const vLines = new Array(props.models.cols-1).fill().map((e,i)=>{
        return <line key={"hline-"+i} x1={(i + 1) * colWidth} y1="0" x2={(i + 1) * colWidth} y2={props.height} stroke="black" strokeOpacity="0.2" ></line> 
    });
                   
    return  <svg onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} preserveAspectRatio="none" version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg">
                <g>{hLines}</g>
                <g>{vLines}</g>
                <g>{ps}</g>
            </svg>;
}
export default ParticlesRenderer;