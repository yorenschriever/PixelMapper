import React, { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { CompressedImage, Device, Pixel, Position } from '../entities'
import { State } from '../redux'
import { CropType } from '../redux/process'
import { nameSelector } from '../redux/selectors'

export const ExportButton = ({ children, normalize }: { children: ReactNode, normalize?: boolean }) => {
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)
    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const crop = useSelector<State, CropType | undefined>(state => state.processReducer.crop)
    const name = useSelector(nameSelector)
    const positionToString = (pos: Position) => `${pos.x},${pos.y}`

    const transformPosition = (pos?: Position): Position => {
        if (!pos) return { x: 0, y: 0, confidence: 0 }

        if (!normalize) return pos

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

    const exportCSV = () => {
        let result = devices.map((device, index) => {
            const pixelStart = devices.slice(0, index).map(d => d.pixelCount).reduce((a, b) => a + b, 0);
            const pixelsInDevice = pixels.slice(pixelStart, pixelStart + device.pixelCount)

            return `host=${device.hostname}:${device.port}\n` +
                pixelsInDevice.map(pixel => positionToString(transformPosition(pixel.position))).join("\n")
        }).join("\n")

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(
            new Blob([result], {
                type: 'application/binary'
            }
            )
        )
        downloadLink.download = `${name}.csv`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return <button onClick={exportCSV}>{children}</button>

}