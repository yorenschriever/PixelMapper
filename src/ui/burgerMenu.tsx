import useSwitch from '@react-hook/switch'
import React, { ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { ActiveStep, setStep } from '../reducers'
import { DownloadStateButton } from './uploadDownloadState'

export const BurgerMenu = ({children}: {children?:ReactNode}) => {
    const dispatch =  useDispatch();
    const [menuOpen, setMenuOpen] = useSwitch(false)

    return <div style={{position:"fixed", right: "25px", top:"25px", display:"flex", flexDirection:'column', alignItems:"flex-end"}}>
        <button onClick={setMenuOpen} style={{fontSize:"20px", borderRadius:"50%",width:"40px", height:"40px"}}>☰</button>

        {menuOpen && <>
            
            <button onClick={()=>dispatch(setStep(ActiveStep.Devices))}>Start over</button>
            <DownloadStateButton/>

            {children}
        </>}
    </div>
}