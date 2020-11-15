import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { connectionFactory } from "../core/connectionFactory";
import { DevicesController } from "../core/devicesController";
import { States } from "../core/IConnection";
import { Device } from "../entities";
import { State } from "../redux";
import { IEncoder } from "../encoders/IEncoder"

export const useDevices = () => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const controller = useRef(new DevicesController(devices))

    const calcAllConnected = useCallback(() => devices.every(device => connectionFactory.getConnection(device).getState() === States.Connected), [devices])
    const [connectionReady, setConnectionReady] = useState(calcAllConnected());
    const handleConnectionStateChange = useCallback(() => {
        const allConnected = calcAllConnected()
        setConnectionReady(allConnected)
        if (allConnected)
            controller.current.setAll(true)//set all leds on to frame the camera //TODO one by one, all connected
    }, [calcAllConnected])

    useEffect(() => {
        devices.forEach(device => connectionFactory.getConnection(device).addStateListener(handleConnectionStateChange))
        return () => {
            devices.forEach(device => connectionFactory.getConnection(device).removeStateListener(handleConnectionStateChange))
        }
    })

    const setAllLeds = (status: boolean) => controller.current.setAll(status)
    const sendSlice = (index: number, encoder: IEncoder) => controller.current.sendSlice(index, encoder)

    return {
        connectionReady,
        setAllLeds,
        sendSlice
    }
}