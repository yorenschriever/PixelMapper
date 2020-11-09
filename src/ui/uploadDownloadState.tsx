import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { store } from '..'
import { loadCaptureState, loadDevicesState, loadNavigationState, State } from '../redux'
import { loadProcessState } from '../redux/process'

export const DownloadStateButton = () => {

    const downloadState = () => {
        window.open(URL.createObjectURL(
            new Blob([JSON.stringify(store.getState())], {type: 'application/binary'})
        ))
    }

    return <button onClick={downloadState}>Save state</button>
}

export const UploadStateButton = () => {
    const dispatch = useDispatch()
    const input = useRef<HTMLInputElement | null>(null)

    const uploadState = () => {
        var reader = new FileReader();
        reader.onload = function (e) {

            const state = JSON.parse(e.target!.result!.toString()) as State

            //test code to load 20x the data for render stresstesting
            //state.processReducer.pixels = Array<Pixel[]>(20).fill(state.processReducer.pixels).flat().map((p,i)=> ({   ...p,index:i,code:i}))

            dispatch(loadProcessState(state.processReducer))
            dispatch(loadCaptureState(state.captureReducer))
            dispatch(loadDevicesState(state.devicesReducer))
            dispatch(loadNavigationState(state.navigationReducer))

            //dispatch(setStep(ActiveStep.Process))
        }
        reader.readAsText(input.current!.files![0]);
    }

    return <>
        <input type="file" ref={input} onChange={uploadState} style={{ display: "none" }} />
        <button onClick={() => input.current!.click()}>Load state</button>
    </>
}

