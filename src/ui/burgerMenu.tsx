import useSwitch from '@react-hook/switch'
import React, { ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { ActiveStep, setStep } from '../redux'
import { DownloadStateButton } from './uploadDownloadState'

export const BurgerMenu = ({ children }: { children?: ReactNode }) => {
    const dispatch = useDispatch();
    const [menuOpen, setMenuOpen] = useSwitch(false)

    return <div className="burgerMenu">
        <button onClick={setMenuOpen} className="burgerMenuButton">☰</button>

        {menuOpen && <>

            <button onClick={() => dispatch(setStep(ActiveStep.Devices))}>Start over</button>
            <DownloadStateButton />

            {children}

        </>}
    </div>
}