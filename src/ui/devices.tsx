import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { connectionFactory } from "../core/connectionFactory"
import { States } from "../core/IConnection"
import { Device } from "../entities"
import { ActiveStep, addDevice, removeDevice, setStep, State, updateHostname, updatePixelCount } from "../reducers"
import { UploadStateButton } from "./uploadDownloadState"

const DevicePanel = ({device,index}:{device:Device,index:number}) => {

    const dispatch = useDispatch();
    const [state,setState] = useState<States>(connectionFactory.getConnection(device).getState())
    useEffect(()=>{
        connectionFactory.getConnection(device).addStateListener(setState)
        return ()=>{ 
            connectionFactory.getConnection(device).removeStateListener(setState)
         }
    },[device])

    useEffect(()=>{
        setState(connectionFactory.getConnection(device).getState())
    },[device])

    const [hostname,setHostname] = useState(device.hostname)

    const editing = hostname !== device.hostname 

    return <div>
        <input value={hostname} onChange={e=>setHostname(e.target.value)} onBlur={()=>dispatch(updateHostname(index,hostname))}/>
        <input value={device.pixelCount || ""} onChange={e=>dispatch(updatePixelCount(index,e.target.value?parseInt(e.target.value):0))} type="numeric"/>
        <span>{editing ? "editing hostname" : state}</span>
        {state === States.Disconnected && <span>
            <a href={`https://${device.hostname}`} target="_blank" rel="noopener noreferrer">Click to accept certificate</a>
        </span>}
        <button onClick={()=>dispatch(removeDevice(index))}>Remove</button>


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

    return <>
    {devices.map((device,index) => <DevicePanel key={index} device={device} index={index}/>)}
    <button onClick={()=>dispatch(addDevice({
        hostname:"",
        port:0,
        pixelCount:50
    }))}>Add device</button>

<button onClick={()=>dispatch(setStep(ActiveStep.Capture))}>Capture</button>
<button onClick={()=>dispatch(setStep(ActiveStep.LoadTestset))}>Load testset</button>

        <UploadStateButton>upload</UploadStateButton>
    </>
}