import { combineReducers } from 'redux'
import { captureReducer, CaptureActionTypes, CaptureState } from "./capture"
import { devicesReducer, DevicesActionTypes, DevicesState} from "./devices"
import { navigationReducer, NavigationActionTypes, NavigationState } from './navigation'
import { processReducer, ProcessActionTypes, ProcessState } from './process'

export * from "./capture"
export * from "./devices"
export * from "./navigation"

export const reducers = combineReducers({
    captureReducer,
    devicesReducer,
    navigationReducer,
    processReducer
})

export type ActionTypes = CaptureActionTypes | DevicesActionTypes | NavigationActionTypes | ProcessActionTypes

export type State = {
    navigationReducer: NavigationState
    devicesReducer: DevicesState
    processReducer: ProcessState
    captureReducer: CaptureState
}

