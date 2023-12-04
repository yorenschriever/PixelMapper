import { Device } from "../entities"
import { IConnection, StateListener, States } from "./IConnection"

export class WebsocketConnection implements IConnection {
    socket?: WebSocket
    listeners: StateListener[] = []
    dim:number=255

    constructor(device: Device) {
        if (device.hostname==="")
            return;
            
        try {
            this.socket = new WebSocket('wss://' + device.hostname + '/ws/map')
        } catch (e) {
            return;
        }

        const updateState = () => { this.listeners.forEach(l => l(this.getState())) }

        this.socket.onerror = updateState
        this.socket.onclose = updateState
        this.socket.onopen = updateState
    }

    getState = () => {
        if (!this.socket)
            return States.Disconnected
        switch (this.socket.readyState) {
            case this.socket.CLOSED:
                return States.Disconnected
            case this.socket.CONNECTING:
                return States.Connecting
            case this.socket.OPEN:
                return States.Connected
            case this.socket.CLOSING:
                return States.Disconnected
            default:
                return States.Disconnected
        }
    }

    sendData = (values: boolean[]) => {
        if (this.getState() !== States.Connected)
            throw Error('WebsocketDevice cannot set data, because it is in state ' + this.getState());
        this.socket!.send(new Uint8Array(values.map(i => i ? this.dim : 0)))

        return new Promise<void>((acc) => {
            this.socket!.onmessage = (event) => { acc() }
        })
    }

    setDim = (dim:number) => this.dim = dim;

    close = () => {
        this.socket?.close()
        this.socket = undefined
    }

    addStateListener = (cb: StateListener) => {
        this.listeners.push(cb)
    }

    removeStateListener = (cb: StateListener) => {
        this.listeners = this.listeners.filter(i => i !== cb)
    }
}