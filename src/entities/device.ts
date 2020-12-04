export enum DeviceType {
    Websocket = 'Websocket',
    BLE = 'BLE'
}

export type Device = {
    type: DeviceType
    hostname: string
    pixelCount: number
}