import { Device} from "../entities"

export type AddDeviceType = {
    type: 'ADD_DEVICE'
    device:Device
}

export const addDevice = (device:Device):AddDeviceType => ({
    type: 'ADD_DEVICE',
    device
})

export type RemoveDeviceType = {
    type: 'REMOVE_DEVICE'
    index:number
}

export const removeDevice = (index:number):RemoveDeviceType => ({
    type: 'REMOVE_DEVICE',
    index
})

export type UpdateDeviceType = {
    type: 'UPDATE_DEVICE'
    index: number,
    device: Device
}

export const updateDevice = (index:number, device:Device):UpdateDeviceType => ({
    type: 'UPDATE_DEVICE',
    index, device
})

export type UpdatePixelCountType = {
    type: 'UPDATE_PIXELCOUNT'
    index: number,
    pixelCount:number
}

export const updatePixelCount = (index:number, pixelCount:number):UpdatePixelCountType => ({
    type: 'UPDATE_PIXELCOUNT',
    index, pixelCount
})

export type UpdateHostnameType = {
    type: 'UPDATE_HOSTNAME'
    index: number,
    hostname:string
}

export const updateHostname = (index:number, hostname:string):UpdateHostnameType => ({
    type: 'UPDATE_HOSTNAME',
    index, hostname
})

export const devicesReducer = (state : DevicesState = initialState, action : DevicesActionTypes) => {
    switch (action.type) {
        case 'ADD_DEVICE':
            return { ...state, devices: [...state.devices, action.device]}
        case 'UPDATE_DEVICE':
            const newdevices = [...state.devices]
            newdevices[action.index] = action.device
            return { ...state, devices: newdevices}
        case 'REMOVE_DEVICE':
            const newdevices2 = state.devices.filter((v,index)=>index!==action.index)
            return { ...state, devices: newdevices2}
        case 'UPDATE_PIXELCOUNT':
            const newdevices3 = [...state.devices]
            newdevices3[action.index] = {...state.devices[action.index],pixelCount:action.pixelCount}
            return { ...state, devices: newdevices3}
        case 'UPDATE_HOSTNAME':
            const newdevices4 = [...state.devices]
            newdevices4[action.index] = {...state.devices[action.index],hostname:action.hostname}
            return { ...state, devices: newdevices4}
        default:
            return state
    }
}

export type DevicesActionTypes = AddDeviceType | UpdateDeviceType | RemoveDeviceType | UpdatePixelCountType | UpdateHostnameType


export type DevicesState = {
    devices: Device[]
}

const initialState : DevicesState = 
{
    devices: [
        {
            hostname:"192.168.1.105", //"pixelmapper.local",//"Hyperion.local",
            port: 9601,
            pixelCount:50,
        }
    ]
}