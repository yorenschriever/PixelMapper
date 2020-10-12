import useSwitch from '@react-hook/switch'
import React, { ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { ActiveStep, setStep } from '../reducers'
import { DownloadStateButton, UploadStateButton } from './uploadDownloadState'

export const BurgerMenu = ({children}: {children?:ReactNode}) => {
    const dispatch =  useDispatch();
    const [menuOpen, setMenuOpen] = useSwitch(false)

    const btnStyle = {
        width:"100%",
        height:"30px"
    }

    return <div style={{position:"fixed", right: "25px", top:"25px", display:"flex", flexDirection:'column', alignItems:"flex-end"}}>
        <button onClick={setMenuOpen} style={{fontSize:"20px", borderRadius:"50%",width:"40px", height:"40px"}}>☰</button>

        {menuOpen && <>
            
            <button style={btnStyle} onClick={()=>dispatch(setStep(ActiveStep.Devices))}>Capture new</button>
            {/* <button style={btnStyle}>Load state</button> */}
            <UploadStateButton>Load state</UploadStateButton>
            <DownloadStateButton>Save state</DownloadStateButton>
            
            {children}

            {/* <button style={btnStyle}>Interpolate all</button>
            <button style={btnStyle}>Delete conf &lt; 50%</button>
            <button style={btnStyle}>Delete conf &lt; 25%</button>

            <button style={btnStyle}>Export</button>
            <button style={btnStyle}>Export normalized</button> */}
            
        </>}
    </div>
}