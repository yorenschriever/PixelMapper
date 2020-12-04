import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BLEConnection } from "../core/bleConnection"
import { connectionPool } from "../core/connectionPool"
import { States } from "../core/IConnection"
import { Device, DeviceType } from "../entities"
import { useConnectionState } from "../hooks/useConnectionState"
import { useFlashLeds } from "../hooks/useFlashLeds"
import { ActiveStep, addDefaultDevice, addDevice, removeDevice, setName, setStep, State, updateHostname, updatePixelCount } from "../redux"
import { deviceHash } from "../utils"
import { UploadStateButton } from "./uploadDownloadState"

const DevicePanel = ({ device, index }: { device: Device, index: number }) => {
    const dispatch = useDispatch();
    const [hostname, setHostname] = useState(device.hostname)
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const editing = hostname !== device.hostname
    const { state, reconnect } = useConnectionState(device)

    const handleRemove = () => {
        if (devices.filter(d => deviceHash(d)===deviceHash(device)).length===1)
            connectionPool.removeConnection(device)
        dispatch(removeDevice(index))
    }

    return (
        <div className="devicePanel">
            {device.type === DeviceType.BLE ?
                <><div>Device name</div><span>{hostname}</span></> :
                <><div>Hostname</div><input value={hostname} onChange={e => setHostname(e.target.value)} onBlur={() => dispatch(updateHostname(index, hostname))} /></>
            }
            <div>Pixel count</div><input value={device.pixelCount || ""} onChange={e => dispatch(updatePixelCount(index, e.target.value ? parseInt(e.target.value) : 0))} type="number" />

            <div>State</div>
            <div>
                <ConnectionChip state={state} dirty={editing} />
                {device.type !== DeviceType.BLE && !editing && <CertificateChip state={state} device={device} />}
                {state === States.Disconnected && <button style={{ marginLeft: "10px", height: "28px", width: "unset", top: "-2px", position: "relative" }} onClick={reconnect}><span role="img" aria-label="retry">↻</span></button>}
            </div>

            <div>Remove</div>
            <button onClick={handleRemove} style={{ height: "28px", width: "32px" }}>🗑</button>

        </div>
    )
}

export const Devices = () => {
    const dispatch = useDispatch();
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const name = useSelector<State, string>(state => state.devicesReducer.name || '')
    useFlashLeds();

    const addBluetoothDevice = () => {
        //Due to security restrictions, the connectionPool cannot initiate a connection given a bluetooth address.
        //We go through the UI steps to create a connection here, and manually put in the connection pool

        //this will trigger the browsers BLE connection popup and return a connection object that is waiting for 
        //the user to select a device. As soon as it starts connecting create the device and add it to the ui.
        const connection = new BLEConnection();

        const listener = (state: States) => {
            if (state === States.Connecting) {
                const hostname = connection.getHostname() ?? "Unknown device";

                const device: Device = {
                    type: DeviceType.BLE,
                    hostname: hostname,
                    pixelCount: 50
                }

                connectionPool.setConnection(device, connection);
                dispatch(addDevice(device))
            }
            connection.removeStateListener(listener)
        }

        connection.addStateListener(listener);
    }

    return <div className="devices">
        <div className="deviceSettingsPanel">
            <div>Project name</div>
            <input value={name} onChange={event => dispatch(setName(event.currentTarget.value))} />
        </div>

        {devices.map((device, index) => <DevicePanel key={deviceHash(device)} device={device} index={index} />)}

        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => dispatch(addDefaultDevice())}>+ Add websocket device</button>
            <button onClick={addBluetoothDevice}>+ Add BLE device</button>
        </div>

        <br />

        <button onClick={() => dispatch(setStep(ActiveStep.Capture))}>Capture &gt;&gt;</button>

        <hr />

        <UploadStateButton />

        <a href="https://github.com/yorenschriever/PixelMapper" className="sourcelink">Source and documentation</a>
    </div>
}

type ConnectionChipProps = {
    dirty?: boolean
    state: States
}

export const ConnectionChip = ({ state, dirty }: ConnectionChipProps) => {

    let label: string = state
    if (dirty) label = "Editing"

    let color = "255,0,0"
    if (state === States.Connected) color = "0,127,0"
    if (state === States.Connecting || dirty) color = "255,127,0"

    return <span style={{
        backgroundColor: `rgba(${color},0.2)`,
        border: "1px solid",
        borderColor: `rgba(${color},1)`,
        borderRadius: "5px",
        color: "black",
        padding: "3px",
    }}>
        {label}
    </span>
}

type CertificateChipProps = {
    state: States
    device: Device
}

export const CertificateChip = ({ state, device }: CertificateChipProps) => {
    if (state !== States.Disconnected)
        return null

    return <span style={{ padding: "3px" }}>
        <a href={`https://${device.hostname}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><span role="img" aria-label="accept certificate">🔑</span></a>
    </span>
}