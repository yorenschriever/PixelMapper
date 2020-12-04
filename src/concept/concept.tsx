import React, { useState } from 'react'
import white from "./white.png"
import pos0 from "./pos0.png"
import neg0 from "./neg0.png"
import pos1 from "./pos1.png"
import neg1 from "./neg1.png"
import solve0 from "./0.png"
import solve1 from "./1.png"
import solve2 from "./2.png"
import solve3 from "./3.png"
import result from "./result.png"
import code0 from "./code0.png"
import code1 from "./code1.png"
import start from "./start.png"

const inputCss = {
    width: "20px",
    height: "24px",
    border: "1px solid #eee",
    backgroundColor: "#555",
    color: "#fff",
    fontSize: "20px"
}

export const Concept = () => {
    const [state0, setState0] = useState<boolean | undefined>(false)
    const [state1, setState1] = useState<boolean | undefined>(false)

    const stateToVal = (state:boolean|undefined) => state===undefined?"":state?"1":"0"
    const valToState = (val:string) => val==="1"?true:val==="0"?false:undefined

    const solvedVal = (state0?2:0)+(state1?1:0)
    const solvedImg = [solve0,solve1,solve2,solve3]

    return <>
    
    <div style={{
        position:"fixed",
        left:"50%",
        top:"50%",
        transform: "translate(-50%, -50%)",
        display:"grid",
        gridTemplateColumns: "300px 50px 300px 50px 300px 50px 300px",
        gridTemplateRows: "50px 300px 80px 300px",
        color:"white",
        fontSize:"20px",
        justifyItems:"center",
        alignItems:"center"
    }}>

    <span>White</span>
    <span></span>
    <span>Picture 1 </span>
    <span></span>
    <span>Picture 0 </span>
    <span></span>
    <span>Stacked</span>

    <img src={white} alt="white"/>
    <span> </span>
    <img src={code1} alt="stack1"/>
    <span> </span>
    <img src={code0} alt="stack2"/>
    <span> </span>
    <img src={result} alt="result"/>

    <span></span>
    <span></span>
    <span>
        code bit 1 = <input value={stateToVal(state0)} onChange={e=>setState0(valToState(e.currentTarget.value.slice(-1)))} style={inputCss}/><br/>
        ({state0?"positive":"negative"})
    </span>
    <span></span>
    <span>
        code bit 0 = <input value={stateToVal(state1)} onChange={e=>setState1(valToState(e.currentTarget.value.slice(-1)))} style={inputCss}/><br/>
        ({state1?"positive":"negative"})
    </span>
    <span></span>
    <span>code = B{stateToVal(state0)}{stateToVal(state1)} = <input 
        value={solvedVal} 
        onChange={e=>{
            const val = parseInt(e.currentTarget.value.slice(-1))
            setState0(val===2 || val===3)
            setState1(val===1 || val===3)
        }}
        style={inputCss}
    /></span>

    <img src={start} alt="white"/>
    <span> X </span>
    <img src={state0?pos0:neg0} alt="stack1"/>
    <span> X </span>
    <img src={state1?pos1:neg1} alt="stack2"/>
    <span> = </span>
    <img src={solvedImg[solvedVal]} alt="result"/>
    
    </div>
    </>
}