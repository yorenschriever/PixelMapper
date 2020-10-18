import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
// eslint-disable-next-line import/no-webpack-loader-syntax
import PixelMapperWorker from "worker-loader!../pixelMapper.worker.js"
import { CompressedImage, Pixel,Position } from "../entities"
import { ActiveStep, CaptureState, setStep, State } from "../reducers"
import { clearPixels, solvedPixel } from "../reducers/process"
import { BurgerMenu } from "./burgerMenu"
import { compressedImageToCanvas, drawPosition, DrawPixelType } from "./imageUtils"

export const Process = () => {
    const dispatch = useDispatch()

    const worker = useRef<PixelMapperWorker>()
    const canvas = useRef<HTMLCanvasElement|null>(null)

    const [error, setError] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [debug, setDebug] = useState<string>("")
    
    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const capture = useSelector<State, CaptureState>(state => state.captureReducer)
    const numPixels = useSelector<State, number>(state => state.devicesReducer.devices.map(d => d.pixelCount).reduce((a, b) => a + b))
    
    const test = useCallback(() => {
        worker.current!.onerror = (err) => {
            console.log('error', err)
            setError(JSON.stringify({ message: err.message }))
        }

        worker.current!.onmessage = (event) => {
            console.log('message back from worker', event.data);

            if (event.data.type === 'DEBUGIMG') {
                console.log('setting debug to canvas', event.data.img)
                var c = document.getElementById("canvas2")! as HTMLCanvasElement;
                c.width = event.data.img.width
                c.height = event.data.img.height
                var ctx = c.getContext("2d")!;
                ctx.putImageData(event.data.img, 0, 0)
                setDebug(event.data.msg)
            }

            const positionMapper = (data:any):Position|undefined => (data?{
                x:data.x,
                y:data.y,
                confidence:data.intensity
            }:undefined)

            if (event.data.type === "PIXELRESULT") {
                const pixel:Pixel = {
                    index:event.data.index,
                    code:event.data.index,
                    //isLocated:event.data.isLocated,
                    position: positionMapper(event.data.position),
                    alternativePositions:event.data.alternativePositions.map(positionMapper)
                }

                dispatch(solvedPixel(pixel))
                if (pixel.position)
                    drawPosition(canvas.current!.getContext('2d')!,pixel.position,pixel.index.toString(), DrawPixelType.Normal)
            }

            if (event.data.type === "STATUS") {
                setStatus(event.data.msg)
            }

            if (event.data.type === "DONE") {
                dispatch(setStep(ActiveStep.Review))
            }
        }

        compressedImageToCanvas(previewImage,canvas.current!)

        const msg = {
            type: 'RUN',
            whiteImage: capture.whiteImage,
            blackImage: capture.blackImage,
            sliceImages: capture.images,
            numPixels
        }

        dispatch(clearPixels(numPixels))
        worker.current!.postMessage(msg)
    },[dispatch,numPixels,previewImage,capture.whiteImage, capture.blackImage, capture.images])

    useEffect(() => {
        worker.current = new PixelMapperWorker();
        let wrk = worker.current;
        test()
        return () => {
            console.log('worker terminate')
            wrk.terminate();
        }
    },[test])

    return <>
        <canvas ref={canvas} style={{ 
            maxWidth: "100vw", 
            maxHeight: "100vh",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        }} />
        <canvas id="canvas2" style={{ maxWidth:"100vw", maxHeight:"100vh", border: "1px solid blue", display:"none" }} />
        {status}
        {error}
        {debug}
        {/* <DownloadStateButton>Download</DownloadStateButton> */}
        {/* <BurgerMenu/> */}
    </>
}