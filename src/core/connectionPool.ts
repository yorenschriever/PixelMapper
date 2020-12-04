import { Device, DeviceType } from "../entities"
import { deviceHash } from "../utils";
import { BLEConnection } from "./bleConnection";
import { IConnection } from "./IConnection"
import { WebsocketConnection } from "./websocketConnection";

class ConnectionPool {

    connections: { [key: string]: IConnection; } = {};

    getConnection(device: Device, forceNew?: boolean) {
        const hash = deviceHash(device)

        if (!this.connections[hash] || forceNew)
            this.connections[hash] = this.createConnection(device)

        return this.connections[hash]
    }

    createConnection(device: Device) {
        switch (device.type){
            case DeviceType.BLE:
                return new BLEConnection(device)
            default:
                return new WebsocketConnection(device)
        }
    }

    setConnection(device: Device, connection:IConnection)
    {
        const hash = deviceHash(device)
        this.connections[hash] = connection
    }

    removeConnection(device:Device)
    {
        const hash = deviceHash(device)
        if (!this.connections[hash])
            return
        
        this.connections[hash].close()
        delete this.connections[hash]
    }
}

export const connectionPool = new ConnectionPool()