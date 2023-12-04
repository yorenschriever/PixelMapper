export enum States {
    Connecting = 'Connecting',
    Connected = 'Connected',
    Disconnected = 'Disconnected',
}

export type StateListener = (state: States) => void

export interface IConnection {
    getState(): States
    sendData(values: boolean[]): Promise<void>
    setDim(dim: number): void
    close(): void

    addStateListener(cb: StateListener): void
    removeStateListener(cb: StateListener): void
}
