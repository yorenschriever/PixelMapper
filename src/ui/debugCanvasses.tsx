import React, { useEffect, useRef, useState } from 'react'
import { imageDataTocanvas } from '../imageUtils'

export type DebugCanvassesProps = {
    data: DebugCanvasProps[]
}

export const DebugCanvasses = ({data}: DebugCanvassesProps) => {
    const [zoom,setzoom] = useState<number|undefined>()
    return <div className="debugCanvasses">
        {data.map((canvas,index) => <DebugCanvas {...canvas} zoom={index===zoom} onClick={()=>index===zoom?setzoom(undefined):setzoom(index)} key={index}/>)}
    </div>
}

export type DebugCanvasProps = {
    msg:string 
    img: ImageData
}

const DebugCanvas = ({img,msg,onClick,zoom}:DebugCanvasProps & {onClick:()=>void, zoom:boolean}) => {
    const debugCanvas = useRef<HTMLCanvasElement | null>(null)
    useEffect(() => {
        imageDataTocanvas(img, debugCanvas.current!)
    })
    return <div className={zoom?"debugCanvasZoomed":"debugCanvas"} onClick={onClick}>
        <span><pre>{msg}</pre></span>
        <canvas ref={debugCanvas} />
    </div>
}