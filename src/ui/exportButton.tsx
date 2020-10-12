import React, { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { CompressedImage, Device, Pixel, Position } from '../entities'
import { State } from '../reducers'

export const ExportButton = ({children, normalize}:{children:ReactNode, normalize?:boolean}) => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)
    const previewImage = useSelector<State, CompressedImage>(state=>state.processReducer.preview!)


    const transformPosition = (pos?:Position):Position => {
        if (!pos) return {x:0,y:0,confidence:0}
        if (!normalize) return pos

        const scale = Math.max(previewImage.width , previewImage.height)/2
        return {
            x: pos.x/scale -1,
            y: pos.y/scale -1,
            confidence:pos.confidence
        }
    }

    const positionToString = (pos:Position) => `${pos.x},${pos.y}`

    const exportCSV = () => {

        let result = devices.map((device,index) => {
            const pixelStart = devices.slice(0,index).map(d=>d.pixelCount).reduce((a,b)=>a+b,0);
            const pixelsInDevice = pixels.slice(pixelStart,pixelStart+device.pixelCount)
            
            return `device=${device.hostname}:${device.port}\n` + 
            pixelsInDevice.map(pixel=>positionToString(transformPosition(pixel.position))).join("\n")
        }).join("\n")

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(
                new Blob([result], {
                  type: 'application/binary'}
                )
            )
        downloadLink.download = "pixels.csv";
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return <button onClick={exportCSV}>{children}</button>

}