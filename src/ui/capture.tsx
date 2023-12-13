import React, { useEffect, useMemo, useRef, useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { CompressedImage } from "../entities";
import { ActiveStep, addImages, setStep, State } from "../redux";
import { setPreview } from "../redux/process";
import { useVideo, useDevices } from "../hooks";
import { numPixelsSelector, encoderTypeSelector } from "../redux/selectors"
import { encoderFactory } from "../encoders/encoderFactory"
import { useWorker } from "../worker/useWorker";
import { useBrowserCapabilities } from "../hooks/useBrowserCapabilities";
import { compressedImageToImageData, imageDataTocanvas } from "../imageUtils";
import { MessageFromWorkerType, MessageToWorkerType } from "../worker/workerMessages";

export const Capture = () => {
    const dispatch = useDispatch()

    const numPixels = useSelector<State, number>(numPixelsSelector)
    const encoderType = useSelector(encoderTypeSelector)
    const encoder = useMemo(() => encoderFactory(encoderType, numPixels), [encoderType, numPixels])
    const numSlices = encoder.GetCodeLength()

    const { setCapturing, setExposure, setExposureCompensation, captureImage, videoRef, cameraReady, capturing } = useVideo()
    const { connectionReady, setAllLeds, setHalf, sendSlice, setDim } = useDevices()

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const [showExposureCanvas, setShowExposureCanvas] = useState(false);
    const [exposureError, setExposureError] = useState<string | null>(null)

    const setExposureAndHandle = useCallback((mode: "auto" | "dark")=>
        setExposure('dark')?.catch(e => setExposureError(`Error setting exposure: ${e.message}`)),
        [setExposure]
    )

    const capture = async () => {
        setCapturing(true);
        setShowExposureCanvas(false);

        console.log("Taking preview image")
        await setExposureAndHandle('auto')
        await setAllLeds(true)
        await sleep(1000)
        const previewCompressed = captureImage();

        console.log("Taking white image")
        await setExposureAndHandle('dark')
        await sleep(1000)
        const white = captureImage()

        console.log("Taking black image")
        await setAllLeds(false)
        await sleep(3 * 150)
        const black = captureImage()

        const slices: CompressedImage[] = []
        for (let i = 0; i < numSlices; i++) {
            await sendSlice(i, encoder)
            await sleep(3 * 150)
            slices.push(captureImage())
        }

        await sleep(150)
        await setAllLeds(false)

        dispatch(addImages(white, black, slices))
        dispatch(setPreview(previewCompressed))
        dispatch(setStep(ActiveStep.Process))

        setCapturing(false);
    }

    const [dimState, setDimState] = useState(255);
    const handleDimChange = (e: React.FormEvent<HTMLInputElement>) => {
        const dim = parseInt(e.currentTarget.value);
        setDim(dim);
        setDimState(dim);
    }

    const [exposureState, setExposureState] = useState(-2);
    const handleExposureChange = (e: React.FormEvent<HTMLInputElement>) => {
        const exposure = parseFloat(e.currentTarget.value);
        setExposureError(null)
        setExposureCompensation(exposure)?.catch(e => setExposureError(`Error setting exposure compensation: ${e.message}`))
        setExposureState(exposure);
    }

    const imageA = useRef<CompressedImage>();
    const imageB = useRef<CompressedImage>();
    const imageAB = useRef(false);
    const worker = useWorker();


    const captureExposure = useCallback(async () => {
        try {
            if (!cameraReady || capturing) return;
            await setHalf(imageAB.current ? 0 : 1)
            await sleep(300)
            if (capturing) return;
            imageA.current = imageB.current;
            imageB.current = captureImage()
            imageAB.current = !imageAB.current;
            if (imageA.current && imageB.current && showExposureCanvas)
            {
                worker?.postMessage({
                    type: 'EXPOSUREIMG',
                    imageA: await compressedImageToImageData(imageA.current),
                    imageB: await compressedImageToImageData(imageB.current),
                } satisfies MessageToWorkerType)
            }
        } catch (e) {
            console.error(e)
        }
    }, [captureImage, setHalf, worker, capturing, cameraReady, showExposureCanvas])

    useEffect(() => {
        setExposureAndHandle('dark')
        const exposureInterval = setInterval(captureExposure, 600);
        return () => clearTimeout(exposureInterval);
    },[setExposureAndHandle, captureExposure])

    const exposureCanvas = useRef<HTMLCanvasElement | null>(null)
    const workerMessageHandler = useCallback(async (event: MessageEvent<MessageFromWorkerType>) => {
        switch (event.data.type) {
            case "EXPOSURERESULT":
                imageDataTocanvas(event.data.img, exposureCanvas.current!)
                break;
            default:
        }
    }, [])

    const capabilities = useBrowserCapabilities();
    const canprocess = capabilities.worker !== false && capabilities.wasm !== false
    useEffect(() => {
        if (!canprocess || !worker) return;
        worker.onmessage = workerMessageHandler
        return () => {
            if (!worker) return;
            worker.onerror = null
            worker.onmessage = null
        }
    }, [workerMessageHandler, worker, canprocess])

    return <>
        <div className="notificationsFloating">
            <div className="info">Adjust camera exposure so the pixels are not over-exposed in the processed images</div>
            {exposureError && <div className="error">{exposureError}</div>}
            <div className="exposureControls">
                <input type="checkbox" checked={showExposureCanvas} onChange={()=>setShowExposureCanvas(!showExposureCanvas)}></input>View processed images<br/>
                <input type="range" min="-3" max="3" step="0.1" value={exposureState} onChange={handleExposureChange}></input>Camera exposure<br/>
                <input type="range" min="1" max="255" value={dimState} onChange={handleDimChange}></input>Dim leds
            </div>
        </div>

        <video ref={videoRef} className="videoPreview" />
        <canvas ref={exposureCanvas} className="exposureCanvas" style={{ display: showExposureCanvas ? "block" : "none" }}/>

        <button
            onClick={capture}
            className="captureButton"
            disabled={!cameraReady || !connectionReady || capturing}
        >
            Start capture
        </button>
    </>
}