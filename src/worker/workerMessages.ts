import { EncoderType } from "../encoders/encoderFactory";
import { Position } from "../entities";

export type MessageToWorkerType = {
    type: "RUN"
    whiteImage: ImageData
    blackImage: ImageData
    sliceImages: ImageData[]
    numPixels: number
    encoderType: EncoderType
    align: boolean
} | {
    type: "RECALCULATE"
    code: number
    index: number
} | {
    type: "ISINITIALIZEDREQUEST"
} | {
    type: "CLEAN"
} | {
    type: "INITONLY"
    whiteImage: ImageData
    blackImage: ImageData
    sliceImages: ImageData[]
    numPixels: number
    encoderType: EncoderType
    align: boolean
}

export type MessageFromWorkerType = {
    type: "DEBUGIMG"
    img: ImageData
    msg: string
} | {
    type: "PIXELRESULT"
    index: number
    code: number
    position?: Position
    alternativePositions: Position[]
} | {
    type: "STATUS"
    msg: string
} | {
    type: "DONE"
} | {
    type: "ISINITIALIZEDRESPONSE"
    initialized: boolean
} | {
    type: "RECALCULATEIMG"
    img: ImageData
    code: number
    index: number
}