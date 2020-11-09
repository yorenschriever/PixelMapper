
import { Pixel, Position } from "../entities"
import { CompressedImage } from "../entities/compressedImage"

export type ClearPixelsType = {
    type: 'CLEAR_PIXELS'
    pixelCount: number
}

export const clearPixels = (pixelCount: number):ClearPixelsType => ({
    type: 'CLEAR_PIXELS',
    pixelCount
})

export type SolvedPixelType = {
    type: 'SOLVED_PIXEL'
    pixel:Pixel
}

export const solvedPixel = (
    pixel:Pixel
):SolvedPixelType => ({
    type: 'SOLVED_PIXEL',
    pixel
})

export type SetPreviewType = {
    type: 'SET_PREVIEW'
    preview:CompressedImage,
}

export const setPreview = (preview:CompressedImage):SetPreviewType => ({
    type: 'SET_PREVIEW',
    preview
})

export type LoadProcessStateType = {
    type: 'LOAD_PROCESS_STATE'
    state:ProcessState
}

export const loadProcessState = (state:ProcessState):LoadProcessStateType => ({
    type: 'LOAD_PROCESS_STATE',
    state
})

export type ChangePositionType = {
    type: 'CHANGE_POSITION'
    index: number
    position?:Position
}

export const changePosition = (index:number,position?:Position):ChangePositionType => ({
    type: 'CHANGE_POSITION',
    index,position
})

export type InterpolateType = {
    type: 'INTERPOLATE'
    index: number
}

export const interpolate = (index:number):InterpolateType => ({
    type: 'INTERPOLATE',
    index
})

export type InterpolateAllType = {
    type: 'INTERPOLATE_ALL'
}

export const interpolateAll = ():InterpolateAllType => ({
    type: 'INTERPOLATE_ALL',
})

export type DeleteLowConfidenceType = {
    type: 'DELETE_LOW_CONFIDENCE'
    threshold: number
}

export const deleteLowConfidence = (threshold:number):DeleteLowConfidenceType => ({
    type: 'DELETE_LOW_CONFIDENCE',
    threshold
})

export const processReducer = (state : ProcessState = initialState, action : ProcessActionTypes) => {
    switch (action.type) {
        case 'CLEAR_PIXELS':
            return { ...state, pixels: new Array<Pixel>(action.pixelCount) }
        case 'SET_PREVIEW':
            return { ...state, preview:action.preview }
        case 'LOAD_PROCESS_STATE':
            return action.state
        case 'SOLVED_PIXEL':
            let newPixels = [...state.pixels]
            newPixels[action.pixel.index] = action.pixel
            return { ...state, pixels: newPixels}
        case 'CHANGE_POSITION':
            let newPixels2 = [...state.pixels]
            newPixels2[action.index] = {...newPixels2[action.index], position:action.position}
            return { ...state, pixels: newPixels2}
        case 'INTERPOLATE':
            return { ...state, pixels: interpolateProcessor(state.pixels,action.index)}
        case 'INTERPOLATE_ALL':
            let newPixels3 = state.pixels
            for(let i=0;i<newPixels3.length; i++) newPixels3 = interpolateProcessor(newPixels3,i)
            return { ...state, pixels: newPixels3}
        case 'DELETE_LOW_CONFIDENCE':
            const newPixels4 = state.pixels.map(pixel => ({...pixel, position: pixel.position && pixel.position.confidence>action.threshold ? pixel.position : undefined}))
            return { ...state, pixels: newPixels4}
        default:
            return state
    }
}

export type ProcessActionTypes = ClearPixelsType | SolvedPixelType | SetPreviewType | LoadProcessStateType | ChangePositionType | InterpolateType | InterpolateAllType | DeleteLowConfidenceType


export type ProcessState = {
    pixels: Pixel[]
    preview?:CompressedImage
}

const initialState : ProcessState = 
{
    pixels: [],
    preview:undefined
}

const interpolateProcessor = (pixels:Pixel[], index:number) =>
{
    if (pixels[index].position) //position is known. nothing to interpolate
        return pixels

    let newPixels = [...pixels]

    //find last know positionon the left
    let starti = index
    while(starti>0 && !pixels[starti].position) {starti--}
    let startpos = pixels[starti].position
    //if we reached the start of the string, use (0,0)
    if (!startpos) startpos = {x:0,y:0,confidence:0}

    //find the first known position on the right
    let endi = index
    while(endi<pixels.length-1 && !pixels[endi].position) {endi++}
    let endpos = pixels[endi].position
    //if we reached the end of the string, use (0,0)
    if (!endpos) endpos = {x:0,y:0,confidence:0}

    for(let i=starti;i<=endi;i++){
        const frac = (i-starti)/(endi-starti)
        const x = startpos.x + (endpos.x - startpos.x)*frac
        const y = startpos.y + (endpos.y - startpos.y)*frac
        const confidence = pixels[i].position?.confidence || 0
        newPixels[i] = {...pixels[i], position: {x,y,confidence}}
    }

    return newPixels
}