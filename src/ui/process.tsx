import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CompressedImage, Pixel, Position } from "../entities"
import { ActiveStep, CaptureState, setStep, State } from "../redux"
import { initPixels, solvedPixel } from "../redux/process"
import { compressedImageToCanvas, drawPosition, DrawPixelType, imageDataTocanvas } from "../imageUtils"
import { BurgerMenu } from "./burgerMenu"
import useSwitch from "@react-hook/switch"
import { useWorker } from "../worker/useWorker"
import { encoderTypeSelector, numPixelsSelector } from "../redux/selectors"
import { createRunMessage } from "../utils"
import { EncoderType } from "../encoders/encoderFactory"
import { useBrowserCapabilities } from "../hooks/useBrowserCapabilities"

export const Process = () => {
    const dispatch = useDispatch()

    const worker = useWorker();

    const canvas = useRef<HTMLCanvasElement | null>(null)
    const debugCanvas = useRef<HTMLCanvasElement | null>(null)

    const [error, setError] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [debug, setDebug] = useState<string>("")
    const [showingDebugimg, setShowingDebugImg] = useSwitch(false);
    const [processing, setProcessing] = useSwitch(false);

    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const numPixels = useSelector<State, number>(numPixelsSelector)
    const encoderType = useSelector<State, EncoderType>(encoderTypeSelector)
    const captureState = useSelector<State, CaptureState>(i => i.captureReducer)

    const capabilities = useBrowserCapabilities();
    const canprocess = capabilities.worker !== false && capabilities.wasm !== false

    const positionMapper = (data: any): Position | undefined => (data ? { x: data.x, y: data.y, confidence: data.intensity } : undefined)

    const workerMessageHandler = useCallback(async (event: MessageEvent<any>) => {
        switch (event.data.type) {
            case "DEBUGIMG":
                console.log('setting debug to canvas', event.data.img)
                imageDataTocanvas(event.data.img, debugCanvas.current!)
                setDebug(event.data.msg)
                setShowingDebugImg.on()
                break;
            case "PIXELRESULT":
                const pixel: Pixel = {
                    index: event.data.index,
                    code: event.data.code,
                    position: positionMapper(event.data.position),
                    alternativePositions: event.data.alternativePositions.map(positionMapper)
                }
                console.log('pixel result', pixel)
                dispatch(solvedPixel(pixel))
                if (pixel.position)
                    drawPosition(canvas.current!.getContext('2d')!, pixel.position, pixel.index.toString(), pixel.position.confidence > 0.1 ? DrawPixelType.Normal : DrawPixelType.LowConfidence)
                break;
            case "STATUS":
                setStatus(event.data.msg)
                break;
            case "DONE":
                if (!showingDebugimg)
                    dispatch(setStep(ActiveStep.Review))
                break;
            default:
        }
    }, [dispatch, setShowingDebugImg, showingDebugimg])

    const attachWorker = useCallback(async () => {
        if (!worker) return;
        worker.onerror = (err) => {
            console.error('Processing error', err)
            setError("Something went wrong when trying to process the images. You can save your state and try again at a later time or on another device.")
        }
        worker.onmessage = workerMessageHandler

        if (!processing)
            worker.postMessage(await createRunMessage(captureState, numPixels, encoderType, 'RUN'))
        setProcessing.on()

    }, [setError, workerMessageHandler, processing, setProcessing, captureState, numPixels, encoderType, worker])

    useEffect(() => {
        if (!canprocess) return;
        attachWorker()
        return () => {
            if (!worker) return;
            worker.onerror = null
            worker.onmessage = null
            //wrk.postMessage({type:"CLEAN"})
            //wrk?.terminate();
        }
    }, [attachWorker, dispatch, numPixels, previewImage, worker, canprocess])

    useEffect(() => { canvas.current && compressedImageToCanvas(previewImage, canvas.current!) }, [previewImage])
    useEffect(() => { dispatch(initPixels(numPixels)) }, [numPixels, dispatch])

    if (!canprocess)
        return <>
            <div className="supportWarnings">
                <div className="supportWarning">Processing is not possible on this device. You can save the state now, and continue on another device.</div>
            </div>
            <BurgerMenu />
        </>

    return <>
        <canvas ref={canvas} className="processCanvas" />
        <canvas ref={debugCanvas} className="processCanvas" style={{ display: showingDebugimg ? "block" : "none" }} />

        <div className="notificationsFloating">
            {status && <div className="info">{status}</div>}
            {error && <div className="error">{error}</div>}
            {debug && <div className="info">{debug}</div>}
        </div>

        <BurgerMenu />
    </>
}