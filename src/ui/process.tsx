import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
// eslint-disable-next-line import/no-webpack-loader-syntax
import PixelMapperWorker from "worker-loader!../pixelMapper.worker.js"
import { CompressedImage, Pixel, Position } from "../entities"
import { ActiveStep, CaptureState, setStep, State } from "../redux"
import { clearPixels, solvedPixel } from "../redux/process"
import { compressedImageToCanvas, drawPosition, DrawPixelType, compressedImageToImageData, imageDataTocanvas } from "../imageUtils"

export const Process = () => {
    const dispatch = useDispatch()

    const worker = useRef<PixelMapperWorker>()
    const canvas = useRef<HTMLCanvasElement | null>(null)
    const debugCanvas = useRef<HTMLCanvasElement | null>(null)

    const [error, setError] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [debug, setDebug] = useState<string>("")

    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const capture = useSelector<State, CaptureState>(state => state.captureReducer)
    const numPixels = useSelector<State, number>(state => state.devicesReducer.devices.map(d => d.pixelCount).reduce((a, b) => a + b))

    const positionMapper = (data: any): Position | undefined => (data ? { x: data.x, y: data.y, confidence: data.intensity } : undefined)

    const attachWorker = useCallback(async () => {
        worker.current!.onerror = (err) => {
            console.log('error', err)
            setError(JSON.stringify({ error: err.message }))
        }

        worker.current!.onmessage = (event) => {
            console.log('message back from worker', event.data);

            switch (event.data.type) {
                case "DEBUGIMG":
                    console.log('setting debug to canvas', event.data.img)
                    imageDataTocanvas(event.data.img, debugCanvas.current!)
                    setDebug(event.data.msg)
                    break;
                case "PIXELRESULT":
                    const pixel: Pixel = {
                        index: event.data.index,
                        code: event.data.index,
                        position: positionMapper(event.data.position),
                        alternativePositions: event.data.alternativePositions.map(positionMapper)
                    }
                    dispatch(solvedPixel(pixel))
                    if (pixel.position)
                        drawPosition(canvas.current!.getContext('2d')!, pixel.position, pixel.index.toString(), DrawPixelType.Normal)
                    break;
                case "STATUS":
                    setStatus(event.data.msg)
                    break;
                case "DONE":
                    dispatch(setStep(ActiveStep.Review))
                    break;
                default:
            }
        }

        compressedImageToCanvas(previewImage, canvas.current!)

        const runmsg = {
            type: 'RUN',
            whiteImage: await compressedImageToImageData(capture.whiteImage!),
            blackImage: await compressedImageToImageData(capture.blackImage!),
            sliceImages: await Promise.all(capture.images.map(i => compressedImageToImageData(i))),
            numPixels
        }

        dispatch(clearPixels(numPixels))
        worker.current!.postMessage(runmsg)
    }, [dispatch, numPixels, previewImage, capture.whiteImage, capture.blackImage, capture.images])

    useEffect(() => {
        worker.current = new PixelMapperWorker();
        let wrk = worker.current;
        attachWorker()
        return () => {
            console.log('worker terminate')
            wrk.terminate();
        }
    }, [attachWorker])

    return <>
        <canvas ref={canvas} className="processCanvas" />
        <canvas ref={debugCanvas} className="processCanvas" style={{ display: "none" }} />

        <div className="processStatus">
            {status}
            {error}
            {debug}
        </div>
    </>
}