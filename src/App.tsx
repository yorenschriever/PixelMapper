import React from 'react';
import { useSelector } from "react-redux"
import { ActiveStep, State } from './redux';
import { Process } from './ui/process';
import { Capture } from './ui/capture';
import { Devices } from './ui/devices';
import { Review } from './ui/review';
import { Concept } from './concept/concept';

function App() {
    const step = useSelector<State, ActiveStep>(state => state.navigationReducer.step)
    
    //const state = useSelector<State, State>(s => s)
    //console.log({ state })

    if (window.location.href.indexOf("concept")>=0)
        return <Concept/>

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
