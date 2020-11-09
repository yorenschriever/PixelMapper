import { CompressedImage } from "../entities/compressedImage"

export type AddImagesType = {
    type: 'ADD_IMAGES'
    whiteImage: CompressedImage
    blackImage: CompressedImage
    sliceImages: CompressedImage[]
}

export const addImages = (whiteImage:CompressedImage,blackImage:CompressedImage,sliceImages:CompressedImage[]):AddImagesType => ({
    type: 'ADD_IMAGES',
    whiteImage,
    blackImage,
    sliceImages
})

export type LoadCaptureStateType = {
    type: 'LOAD_CAPTURE_STATE'
    state:CaptureState
}

export const loadCaptureState = (state:CaptureState):LoadCaptureStateType => ({
    type: 'LOAD_CAPTURE_STATE',
    state
})

export const captureReducer = (state : CaptureState = initialState, action : CaptureActionTypes) => {
    switch (action.type) {
        case 'ADD_IMAGES':
            return { ...state, 
                blackImage: action.blackImage,
                whiteImage: action.whiteImage,
                images:action.sliceImages
            }
        case 'LOAD_CAPTURE_STATE':
            return action.state
        default:
            return state
    }
}

export type CaptureActionTypes = AddImagesType | LoadCaptureStateType


export type CaptureState = {
    blackImage?: CompressedImage
    whiteImage?:CompressedImage
    images: CompressedImage[]
}

const initialState : CaptureState = 
{
    blackImage: undefined,
    whiteImage: undefined,
    images: [],
}
