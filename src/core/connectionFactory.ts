import { Device } from "../entities"
import { deviceHash } from "../utils";
import { IConnection } from "./IConnection"
import { WebsocketConnection } from "./websocketConnection";


class ConnectionFactory {

    connections: { [key: string]: IConnection; } = {};

    getConnection(device: Device, forceNew?: boolean) {
        const hash = deviceHash(device)

        if (!this.connections[hash] || forceNew)
            this.connections[hash] = this.createConnection(device)

        return this.connections[hash]
    }

    createConnection(device: Device) {
        //todo proper factory here
        return new WebsocketConnection(device)
    }

}

export const connectionFactory = new ConnectionFactory()