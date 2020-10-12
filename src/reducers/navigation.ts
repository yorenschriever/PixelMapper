
export type SetStepType = {
    type: 'SET_STEP'
    step: ActiveStep
}

export const setStep = (step:ActiveStep):SetStepType => ({
    type: 'SET_STEP',
    step
})

export const navigationReducer = (state : NavigationState = initialState, action : NavigationActionTypes) => {
    switch (action.type) {
        case 'SET_STEP':
            console.log('navigate to ',action.step)
            return { ...state, step:action.step}
        default:
            return state
    }
}

export type NavigationActionTypes = SetStepType


export enum ActiveStep
{
    Devices='Devices',
    LoadTestset='LoadTestset',
    Capture='Capture',
    Process='Process',
    Review='Review',
    //Export='Export'
}

export type NavigationState = {
    step:ActiveStep
}

const initialState : NavigationState = 
{
    step: ActiveStep.Devices,
}