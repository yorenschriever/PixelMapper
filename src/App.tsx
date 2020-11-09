import React from 'react';
import { useSelector } from "react-redux"
import { ActiveStep, State } from './redux';
import { Process } from './ui/process';
import { Capture } from './ui/capture';
import { Devices } from './ui/devices';
import { Review } from './ui/review';

function App() {
    const step = useSelector<State, ActiveStep>(state => state.navigationReducer.step)
    const state = useSelector<State, State>(s => s)

    console.log({ state })

    switch (step) {
        case ActiveStep.Devices:
            return <Devices />
        case ActiveStep.Capture:
            return <Capture />
        case ActiveStep.Process:
            return <Process />
        case ActiveStep.Review:
            return <Review />
        default:
            return <>Unknown step</>;
    }
}

export default App;
