import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { store } from '..'
import { loadCaptureState, loadDevicesState, loadNavigationState, resetCaptureState, resetDevicesState, resetNavigationState, State } from '../redux'
import { loadProcessState, resetProcessState } from '../redux/process'
import { nameSelector } from '../redux/selectors'

export const DownloadStateButton = () => {
    const name = useSelector<State,string>(nameSelector)

    const downloadState = () => {
        const result = JSON.stringify(store.getState())

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(
            new Blob([result], {
                type: 'application/binary'
            }
            )
        )
        downloadLink.download = `${name}.json`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return <button onClick={downloadState}>Save state</button>
}

export const UploadStateButton = () => {
    const dispatch = useDispatch()
    const input = useRef<HTMLInputElement | null>(null)

    const uploadState = () => {
        var reader = new FileReader();
        reader.onload = function (e) {

            try {
                const state = JSON.parse(e.target!.result!.toString()) as State

                //test code to load 20x the data for render stresstesting
                //state.processReducer.pixels = Array<Pixel[]>(20).fill(state.processReducer.pixels).flat().map((p,i)=> ({   ...p,index:i,code:i}))

            
                dispatch(loadProcessState(state.processReducer))
                dispatch(loadCaptureState(state.captureReducer))
                dispatch(loadDevicesState(state.devicesReducer))
                dispatch(loadNavigationState(state.navigationReducer))
            } catch (error) {
                console.error('Error loading state', error)
                alert('Could not read this state.')
                dispatch(resetProcessState())
                dispatch(resetCaptureState())
                dispatch(resetDevicesState())
                dispatch(resetNavigationState())
            }

        }
        reader.readAsText(input.current!.files![0]);
    }

    return <>
        <input type="file" ref={input} onChange={uploadState} style={{ display: "none" }} />
        <button onClick={() => input.current!.click()}>Load state</button>
    </>
}

