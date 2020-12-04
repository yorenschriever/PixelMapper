import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { connectionPool } from "../core/connectionPool";
import { States } from "../core/IConnection";
import { Device } from "../entities";
import { State } from "../redux";

//flashes all connected leds on and off to indicate a succesful connection
export const useFlashLeds = () => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const flashState = useRef(false);
    useEffect(() => {
        const interval = setInterval(() => {
            flashState.current = !flashState.current
            devices.forEach(device => {
                const conn = connectionPool.getConnection(device)
                if (conn.getState() !== States.Connected)
                    return
                conn.sendData(new Array(device.pixelCount).fill(flashState.current))
            })
        }, 500)
        return () => {
            clearInterval(interval);
        }
    })
}