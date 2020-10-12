import React from 'react'
import { useSelector } from 'react-redux'
import { Device, Pixel } from '../entities'
import { State } from '../reducers'

export const Export = () => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)

    console.log({devices,pixels})

    return <pre>{devices.map((device,index) => {
        const pixelStart = devices.slice(0,index).map(d=>d.pixelCount).reduce((a,b)=>a+b,0);

        return <React.Fragment key={index}>
            <div>device={device.hostname}:{device.port}</div>
            {pixels.slice(pixelStart,pixelStart+device.pixelCount).map(pixel=>(
                <div key={pixel.index}>{pixel.position?.x||0}:{pixel.position?.y||0}</div>)
            )}
            </React.Fragment>}
    )}</pre>
}