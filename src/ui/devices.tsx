import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { connectionFactory } from "../core/connectionFactory"
import { States } from "../core/IConnection"
import { Device } from "../entities"
import { ActiveStep, addDevice, removeDevice, setStep, State, updateHostname, updatePixelCount } from "../reducers"
import {  UploadStateButton } from "./uploadDownloadState"

const DevicePanel = ({device,index}:{device:Device,index:number}) => {

    const dispatch = useDispatch();
    const [state,setState] = useState<States>(connectionFactory.getConnection(device).getState())
    const [hostname,setHostname] = useState(device.hostname)
    const editing = hostname !== device.hostname 

    useEffect(()=>{
        connectionFactory.getConnection(device).addStateListener(setState)
        return ()=>{ 
            connectionFactory.getConnection(device).removeStateListener(setState)
         }
    },[device])

    useEffect(()=>{
        setState(connectionFactory.getConnection(device).getState())
    },[device])

    return <div style={{
        paddingBottom: "20px",
        display:"grid",
        gridTemplateColumns:"40%  60%",
        gridTemplateRows: "30px 30px 30px 30px",
        alignItems: "center"
    }}>
        <div>Hostname</div><input value={hostname} onChange={e=>setHostname(e.target.value)} onBlur={()=>dispatch(updateHostname(index,hostname))}/>
        <div>Pixel count</div><input value={device.pixelCount || ""} onChange={e=>dispatch(updatePixelCount(index,e.target.value?parseInt(e.target.value):0))} type="number"/>
        
        <div>State</div>
        <div>
            <ConnectionChip state={state} dirty={editing}/>
            {!editing && <CertificateChip state={state} device={device}/>}
        </div>

        <div>Remove</div>
        <button onClick={()=>dispatch(removeDevice(index))}>🗑</button>

    </div>
}

export const Devices = () => {
    const dispatch = useDispatch();
    const devices = useSelector<State,Device[]>(state=>state.devicesReducer.devices)

    const flashState = useRef(false);
    useEffect(()=>{
        const interval = setInterval(() => {
            flashState.current = !flashState.current
            devices.forEach(device => {
                const conn = connectionFactory.getConnection(device)
                if (conn.getState()!==States.Connected)
                    return
                conn.sendData(new Array(device.pixelCount).fill(flashState.current?25:0))
            })
        },500)
        return ()=>{ 
            clearInterval(interval);
         }
    })

    return <div style={{
        backgroundColor:"#eee",
        border: "1px solid #aaa",
        maxWidth:"100vw",
        width:"300px",
        padding: "40px",

        position:"absolute",
        top: "24px",
        left: "50vw",
        transform: "translate(-50%, 0)"
    }}>
        {devices.map((device,index) => <DevicePanel key={index} device={device} index={index}/>)}
        <button onClick={()=>dispatch(addDevice({
            hostname:"",
            port:0,
            pixelCount:50
        }))}>Add device</button>

        <br/><br/>

        <button onClick={()=>dispatch(setStep(ActiveStep.Capture))}>Capture</button>

        <br/><br/>

        <UploadStateButton/>
    </div>
}

type ConnectionChipProps = {
    dirty:boolean
    state:States
}

export const ConnectionChip = ({state,dirty}:ConnectionChipProps) => {

    let label:string = state
    if (dirty) label = "Editing"

    let color="255,0,0"
    if (state===States.Connected) color="0,127,0"
    if (state===States.Connecting || dirty) color="255,127,0"

    return <span style={{
        backgroundColor: `rgba(${color},0.2)`,
        border:"1px solid",
        borderColor: `rgba(${color},1)`,
        borderRadius: "5px",
        color: "black",
        padding:"3px",
    }}>
        {label}
    </span>
}

type CertificateChipProps = {
    state:States
    device:Device
}

export const CertificateChip = ({state, device}:CertificateChipProps) => {
    if (state!==States.Disconnected)
        return null

    return <span style={{ padding:"3px"}}>
        <a href={`https://${device.hostname}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}><span role="img" aria-label="accept certificate">🔑</span></a>
    </span>
}