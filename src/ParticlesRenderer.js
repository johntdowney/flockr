import React from "react";
import Vector from "./Vector.js";

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

const ParticlesRenderer = (props)=> {

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
        return <line key={"hline-"+i} x1="0" y1={(i + 1) * rowHeight} x2={props.width} y2={(i + 1) * rowHeight} stroke="black"
       strokeOpacity="0.2" ></line> 
    });
    
    const vLines = new Array(props.models.cols-1).fill().map((e,i)=>{
        return <line key={"hline-"+i} x1={(i + 1) * colWidth} y1="0" x2={(i + 1) * colWidth} y2={props.height} stroke="black"
       strokeOpacity="0.2" ></line> 
    });
                   
    return  <svg onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} preserveAspectRatio="none" version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg">
                <g>{hLines}</g>
                <g>{vLines}</g>
                <g>{ps}</g>
            </svg>;
}
export default ParticlesRenderer;