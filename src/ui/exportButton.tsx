import React, { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { CompressedImage, Device, Pixel, Position } from '../entities'
import { State } from '../redux'
import { CropType } from '../redux/process'
import { nameSelector, numPixelsSelector } from '../redux/selectors'

export type ExportButtonProps = {
    children: ReactNode
    type: "csv" | "h"
}

export const ExportButton = ({ children, type='csv'}: ExportButtonProps) => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)
    const pixelCount = useSelector(numPixelsSelector)
    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const crop = useSelector<State, CropType | undefined>(state => state.processReducer.crop)
    const name = useSelector(nameSelector)

    const transformPosition = (pos?: Position): Position => {
        if (!pos) return { x: 0, y: 0, confidence: 0 }

        const constrain = (a: number) => Math.min(1, Math.max(-1, a))

        const w = crop ? (crop.x1 - crop.x0) : previewImage.width
        const h = crop ? (crop.y1 - crop.y0) : previewImage.height
        const scale = Math.max(w, h) / 2
        return {
            x: constrain((pos.x - (crop?.x0 ?? 0) - w / 2) / scale),
            y: constrain((pos.y - (crop?.y0 ?? 0) - h / 2) / scale),
            confidence: pos.confidence
        }
    }

    const CSVContent = () => {
        const positionToString = (pos: Position) => `${pos.x},${pos.y}`
        return devices.map((device, index) => {
            const pixelStart = devices.slice(0, index).map(d => d.pixelCount).reduce((a, b) => a + b, 0);
            const pixelsInDevice = pixels.slice(pixelStart, pixelStart + device.pixelCount)

            return `host=${device.hostname}:${device.port}\n` +
                pixelsInDevice.map(pixel => positionToString(transformPosition(pixel.position))).join("\n")
        }).join("\n")
    }

    const HeaderContent = () => {
        const scale = 1000;
        const positionToString = (pos: Position) => `${Math.round(pos.x*scale)},${Math.round(pos.y*scale)}`
        return `
        #pragma once
        #include <inttypes.h>

        namespace pixelmapper
        {
        
            const int pixelCount = ${pixelCount};
            const int deviceCount = ${devices.length};

            //coordinate system:
            //(0,0) = center
            //(-${scale},-${scale}) = top left
            //(${scale},${scale}) = bottom right
            const int16_t scale = ${scale};
        
            ${devices.map((device, index) => {
                const pixelStart = devices.slice(0, index).map(d => d.pixelCount).reduce((a, b) => a + b, 0);
                const pixelsInDevice = pixels.slice(pixelStart, pixelStart + device.pixelCount)
    
                return `
                //device${index} = ${device.hostname}:${device.port}
                const int device${index}Count = ${device.pixelCount};
                //x0,y0,  x1,y1,  x2,y2,  etc
                const int16_t device${index}Positions[${device.pixelCount * 2}] = { ${pixelsInDevice.map(pixel => positionToString(transformPosition(pixel.position))).join(",  ") } };
                \n`
            })}  
        } 
        \n`
    }

    const handleExportClick = () => {
        const content = type==='csv'?CSVContent():HeaderContent();
        const filename = type==='csv'?`${name}.csv`:`${name}.h`;

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(
            new Blob([content], {
                type: 'application/binary'
            }
            )
        )
        downloadLink.download = filename;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return <button onClick={handleExportClick}>{children}</button>

}