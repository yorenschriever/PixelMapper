export type AddImagesType = {
    type: 'ADD_IMAGES'
    whiteImage: ImageData
    blackImage: ImageData
    sliceImages: ImageData[]
}

export const addImages = (whiteImage:ImageData,blackImage:ImageData,sliceImages:ImageData[]):AddImagesType => ({
    type: 'ADD_IMAGES',
    whiteImage,
    blackImage,
    sliceImages
})

export const captureReducer = (state : CaptureState = initialState, action : CaptureActionTypes) => {
    switch (action.type) {
        case 'ADD_IMAGES':
            return { ...state, 
                blackImage: action.blackImage,
                whiteImage: action.whiteImage,
                images:action.sliceImages
            }
        default:
            return state
    }
}

export type CaptureActionTypes = AddImagesType


export type CaptureState = {
    blackImage?: ImageData
    whiteImage?:ImageData
    images: ImageData[]
}

const initialState : CaptureState = 
{
    blackImage: undefined,
    whiteImage: undefined,
    images: [],
}
