import { useEffect, useState } from "react";
import { connectionPool } from "../core/connectionPool";
import { States } from "../core/IConnection";
import { Device } from "../entities/device";

export const useConnectionState = (device: Device) => {
    const connection = connectionPool.getConnection(device)
    const [state, setState] = useState<States>(connection.getState())
    
    useEffect(() => {
        setState(connection.getState());
        connection.addStateListener(setState)
        return () => { connection.removeStateListener(setState) }
    }, [connection])

    const reconnect = () => {
        connection.removeStateListener(setState);
        connectionPool.getConnection(device, true).addStateListener(setState);
    }

    return {state, reconnect}
}