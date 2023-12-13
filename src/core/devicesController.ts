import { Device } from "../entities/device"
import { connectionPool } from "./connectionPool";
import { IConnection } from "./IConnection";
import { IEncoder } from "../encoders/IEncoder"

export class DevicesController {
    deviceControllers: { device: Device, connection: IConnection }[] = [];

    constructor(devices: Device[]) {
        this.deviceControllers = devices.map(device => ({
            device,
            connection: connectionPool.getConnection(device)
        }));
    }

    setAll = (on: boolean) => Promise.all(
        this.deviceControllers.map(devicecontroller =>
            devicecontroller.connection.sendData(Array(devicecontroller.device.pixelCount).fill(on))
        )
    )

    setHalf = (whichHalf: 0 | 1) => Promise.all(
        this.deviceControllers.map(devicecontroller =>
            devicecontroller.connection.sendData(
                Array(devicecontroller.device.pixelCount).fill(false).map((_, i) => i % 2 === whichHalf)
            )
        )
    )

    sendSlice = (slice: number, encoder: IEncoder) => Promise.all(
        this.deviceControllers.map((device, index) => {
            const pixelStart = this.deviceControllers.slice(0, index).map(d => d.device.pixelCount).reduce((a, b) => a + b, 0);

            const indices = Array.from(Array(device.device.pixelCount).keys()).map(i => i + pixelStart)
            const codes = indices.map(index => encoder.Encode(index))

            const sliceValues = codes.map(i => (i & (1 << (slice))) !== 0)
            return device.connection.sendData(sliceValues)
        })
    )

    setDim = (dim: number) => {
        this.deviceControllers.map(devicecontroller =>
            devicecontroller.connection.setDim(dim)
        )
    }
}
