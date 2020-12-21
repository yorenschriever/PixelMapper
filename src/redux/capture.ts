import { CompressedImage } from "../entities/compressedImage"
import { EncoderType } from "../encoders/encoderFactory"

export type AddImagesType = {
    type: 'ADD_IMAGES'
    whiteImage: CompressedImage
    blackImage: CompressedImage
    sliceImages: CompressedImage[]
}

export const addImages = (whiteImage: CompressedImage, blackImage: CompressedImage, sliceImages: CompressedImage[]): AddImagesType => ({
    type: 'ADD_IMAGES',
    whiteImage,
    blackImage,
    sliceImages
})

export type LoadCaptureStateType = {
    type: 'LOAD_CAPTURE_STATE'
    state: CaptureState
}

export const loadCaptureState = (state: CaptureState): LoadCaptureStateType => ({
    type: 'LOAD_CAPTURE_STATE',
    state
})

export const resetCaptureState = (): LoadCaptureStateType => ({
    type: 'LOAD_CAPTURE_STATE',
    state: initialState
})

export type SetAlignType = {
    type: 'SET_ALIGN'
    align: boolean
}

export const setAlign = (align: boolean): SetAlignType => ({
    type: 'SET_ALIGN',
    align
})

export const captureReducer = (state: CaptureState = initialState, action: CaptureActionTypes) => {
    switch (action.type) {
        case 'ADD_IMAGES':
            return {
                ...state,
                blackImage: action.blackImage,
                whiteImage: action.whiteImage,
                images: action.sliceImages
            }
        case 'LOAD_CAPTURE_STATE':
            return action.state
        case 'SET_ALIGN':
            return {...state, align: action.align}
        default:
            return state
    }
}

export type CaptureActionTypes = AddImagesType | LoadCaptureStateType | SetAlignType


export type CaptureState = {
    blackImage?: CompressedImage
    whiteImage?: CompressedImage
    images: CompressedImage[]
    encoderType: string
    align: boolean
}

const initialState: CaptureState =
{
    blackImage: undefined,
    whiteImage: undefined,
    images: [],
    encoderType: EncoderType.RGB,
    align: false
}
