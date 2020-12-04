import { useEffect, useState } from "react";
import { connectionFactory } from "../core/connectionFactory";
import { States } from "../core/IConnection";
import { Device } from "../entities/device";

export const useConnectionState = (device: Device) => {
    const connection = connectionFactory.getConnection(device)
    const [state, setState] = useState<States>(connection.getState())
    
    useEffect(() => {
        setState(connection.getState());
        connection.addStateListener(setState)
        return () => { connection.removeStateListener(setState) }
    }, [connection])

    const reconnect = () => {
        connection.removeStateListener(setState);
        connectionFactory.getConnection(device, true).addStateListener(setState);
    }

    return {state, reconnect}
}