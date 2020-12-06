import useSwitch from '@react-hook/switch'
import React, { ReactNode, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHandleOutsideClick } from '../hooks/useHandleOutsideClick'
import { ActiveStep, setStep } from '../redux'
import { DownloadStateButton } from './uploadDownloadState'

export const BurgerMenu = ({ children }: { children?: ReactNode }) => {
    const dispatch = useDispatch();
    const [menuOpen, setMenuOpen] = useSwitch(false)
    const menuRef = useRef<HTMLDivElement>(null);
    useHandleOutsideClick(menuRef,setMenuOpen.off);

    return <div className="burgerMenu" ref={menuRef}>
        <button onClick={setMenuOpen} className="burgerMenuButton">☰</button>

        {menuOpen && <>

            <button onClick={() => dispatch(setStep(ActiveStep.Devices))}>Start over</button>
            <DownloadStateButton />

            {children}

        </>}
    </div>
}