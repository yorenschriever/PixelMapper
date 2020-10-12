import { Device } from "../entities/device"
import { connectionFactory } from "./connectionFactory";
import { IConnection } from "./IConnection";

export class DevicesController {
    deviceControllers: { device: Device, connection: IConnection }[] = [];

    constructor(devices: Device[]) {
        this.deviceControllers = devices.map(device => ({
            device,
            connection: connectionFactory.getConnection(device)
        }));
    }

    setAll = (on: boolean) => Promise.all(
        this.deviceControllers.map(devicecontroller =>
            devicecontroller.connection.sendData(Array(devicecontroller.device.pixelCount).fill(on))
        )
    )

    sendSlice = (slice: number) => Promise.all(
        this.deviceControllers.map((device, index) => {
            const pixelStart = this.deviceControllers.slice(0, index).map(d => d.device.pixelCount).reduce((a, b) => a + b, 0);

            const indices = Array.from(Array(device.device.pixelCount).keys()).map(i => i + pixelStart)
            const sliceValues = indices.map(i => (i & (1 << (slice))) !== 0)
            return device.connection.sendData(sliceValues)
        })
    )
}
