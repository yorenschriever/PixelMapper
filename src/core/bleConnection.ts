import { Device } from "../entities"
import { IConnection, StateListener, States } from "./IConnection"

const SERVICE_UUID: string = "52077e21-e0b5-4b71-950c-2522c81adab0"
const CHARACTERISTIC_UUID: string = "ad86aa6a-70b7-4291-8943-598258fa2776"

export class BLEConnection implements IConnection {
    listeners: StateListener[] = []

    bledevice?: BluetoothDevice
    characteristic?: BluetoothRemoteGATTCharacteristic

    constructor(private device?: Device) {
        this.connect(device);
    }

    updateState = () => { this.listeners.forEach(l => l(this.getState())) }

    connect = async (device?: Device) => {

        const filters: BluetoothRequestDeviceFilter[] = [{ services: [SERVICE_UUID] }]

        if (device) {
            //if the hostname is already known we are trying to setup a connection that was made earlier
            alert(`Pixelmapper needs to reconnect to ${device.hostname}. For security reasons to have to reconfirm this connection. Please do so in the next screen.`)
            filters.push({ name: device.hostname })
        }

        console.log('scanning ble', filters)

        //shows the pairing popup
        let bledevice: BluetoothDevice;
        try {
            bledevice = await navigator.bluetooth.requestDevice({ filters });
        } catch (error) {
            console.log('No ble device received. User could have canceled' + error.message)
            return;
        }

        this.bledevice = bledevice;
        this.updateState();

        bledevice.addEventListener("gattserverdisconnected", (event) => {
            this.bledevice = undefined;
            this.updateState();
        })

        console.log('connecting to server')
        const server = await bledevice.gatt!.connect();

        console.log('Getting Service...');
        const service = await server.getPrimaryService(SERVICE_UUID);

        console.log('Getting Characteristic...');
        this.characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        console.log('Connected')
        this.updateState();
    }

    getHostname = () => {
        return this.bledevice?.name
    }

    getState = () => {
        if (!this.bledevice)
            return States.Disconnected

        if (!this.characteristic)
            return States.Connecting

        return this.bledevice!.gatt?.connected ?
            States.Connected :
            States.Disconnected
    }

    sendData = async (values: boolean[]) => {
        if (this.getState() !== States.Connected)
            throw Error('BLE Device cannot send data, because it is in state ' + this.getState());

        if (!this.characteristic)
            throw Error('BLE Device cannot send data, because the descriptor was not found')

        try {
            //I cant seem to read the mtu from the ble web api, so we just try, and hope for the best.
            //From my mac and android i am able to send 512 bytes. = 4096 leds
            await this.characteristic.writeValueWithResponse(this.valuesToBits(values))
        } catch (error) {
            console.error('Error sending BLE message', error);
        }
    }

    valuesToBits = (values: boolean[]) => {
        const chunked = this.chunk(values, 8)
        const bytes = chunked.map(chunk => chunk.reduce<number>((acc, value, index) => acc + (value ? Math.pow(2, index) : 0), 0))
        const length = [values.length >> 8, values.length & 0xff];
        return new Uint8Array([...length, ...bytes])
    }

    chunk = (array: boolean[], size: number) => {
        const chunked_arr = [];
        let index = 0;
        while (index < array.length) {
            chunked_arr.push(array.slice(index, size + index));
            index += size;
        }
        return chunked_arr;
    }

    addStateListener = (cb: StateListener) => {
        this.listeners.push(cb)
    }

    removeStateListener = (cb: StateListener) => {
        this.listeners = this.listeners.filter(i => i !== cb)
    }
}