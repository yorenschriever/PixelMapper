import React, { ReactNode, useRef } from 'react'
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
    const input = useRef<HTMLInputElement|null>(null)

    const uploadState=()=>{
        var reader = new FileReader();
        reader.onload = function (e) {

            const state = JSON.parse(e.target!.result!.toString()) as ProcessState

            //test code to load 20x the data
            //state.pixels = Array<Pixel[]>(20).fill(state.pixels).flat().map((p,i)=> ({   ...p,index:i,code:i}))

            dispatch(loadState(state))
            dispatch(setStep(ActiveStep.Review))
        }
        reader.readAsText(input.current!.files![0]);
    }
    
    return <>
        <input type="file" ref={input} onChange={uploadState} style={{display:"none"}}/>
        <button onClick={()=>input.current!.click()}>{children}</button>
    </>
}