
export type SetStepType = {
    type: 'SET_STEP'
    step: ActiveStep
}

export const setStep = (step:ActiveStep):SetStepType => ({
    type: 'SET_STEP',
    step
})

export type LoadNavigationStateType = {
    type: 'LOAD_NAVIGATION_STATE'
    state: NavigationState
}

export const loadNavigationState = (state:NavigationState):LoadNavigationStateType => ({
    type: 'LOAD_NAVIGATION_STATE',
    state
})

export const resetNavigationState = ():LoadNavigationStateType => ({
    type: 'LOAD_NAVIGATION_STATE',
    state: initialState
})

export const navigationReducer = (state : NavigationState = initialState, action : NavigationActionTypes) => {
    switch (action.type) {
        case 'SET_STEP':
            console.log('navigate to ',action.step)
            return { ...state, step:action.step}
        case 'LOAD_NAVIGATION_STATE':
            return action.state
        default:
            return state
    }
}

export type NavigationActionTypes = SetStepType | LoadNavigationStateType


export enum ActiveStep
{
    Devices='Devices',
    Capture='Capture',
    Process='Process',
    Review='Review'
}

export type NavigationState = {
    step:ActiveStep
}

const initialState : NavigationState = 
{
    step: ActiveStep.Devices,
}