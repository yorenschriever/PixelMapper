import React, { ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { store } from '..'
import { Pixel } from '../entities'
import { ActiveStep, setStep } from '../reducers'
import { loadState, ProcessState } from '../reducers/process'

export const DownloadStateButton = ({children}:{children:ReactNode}) => {

    const downloadState=()=>{
        window.open(URL.createObjectURL(
            new Blob([JSON.stringify(store.getState().processReducer)], {
              type: 'application/binary'}
            )
        ))
    }

    return <button onClick={downloadState}>{children}</button>
}

export const UploadStateButton = ({children}:{children:ReactNode}) => {
    const dispatch=  useDispatch()

    const uploadState=()=>{
        var fileUpload = document.getElementById("fileUpload")! as HTMLInputElement;
        var reader = new FileReader();
        reader.onload = function (e) {

            const state = JSON.parse(e.target!.result!.toString()) as ProcessState

            //test code to load 20x the data
            //state.pixels = Array<Pixel[]>(20).fill(state.pixels).flat().map((p,i)=> ({   ...p,index:i,code:i}))

            dispatch(loadState(state))
            dispatch(setStep(ActiveStep.Review))
        }
        reader.readAsText(fileUpload.files![0]);
    }
    

    return <>
        <input type="file" id="fileUpload" onChange={uploadState} />
        </>
}