import { Position} from "./position"

export type Pixel = {
    index: number //the index will be assigned after device configuration. indices will not reset per device. eg: for 3 devices with 50 pixels each, the indices will be 0-49, 50-99 and 100-149
    code: number //the code that belongs to the index. currently they will be equal

    //isLocated: boolean 
    position?: Position
    alternativePositions: Position[]
}