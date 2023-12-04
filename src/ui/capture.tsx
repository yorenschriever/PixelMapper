import React, { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux";
import { CompressedImage } from "../entities";
import { ActiveStep, addImages, setStep, State } from "../redux";
import { setPreview } from "../redux/process";
import { useVideo, useDevices } from "../hooks";
import { numPixelsSelector, encoderTypeSelector } from "../redux/selectors"
import { encoderFactory } from "../encoders/encoderFactory"

export const Capture = () => {
    const dispatch = useDispatch()

    const numPixels = useSelector<State, number>(numPixelsSelector)
    const encoderType = useSelector(encoderTypeSelector)
    const encoder = useMemo(() => encoderFactory(encoderType, numPixels), [encoderType, numPixels])
    const numSlices = encoder.GetCodeLength()

    const { setCapturing, setExposure, captureImage, videoRef, cameraReady, capturing } = useVideo()
    const { connectionReady, setAllLeds, sendSlice, setDim } = useDevices()

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const capture = async () => {
        setCapturing(true);

        console.log("Taking preview image")
        await setExposure('auto')
        await setAllLeds(true)
        await sleep(1000)
        const previewCompressed = captureImage();

        console.log("Taking white image")
        await setExposure('dark')
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

    const handleDimChange = (e:React.FormEvent<HTMLInputElement>) => {
        setDim(parseInt(e.currentTarget.value));
    }

    return <>
        <video ref={videoRef} className="videoPreview" />
        <button
            onClick={capture}
            className="captureButton"
            disabled={!cameraReady || !connectionReady || capturing}
        >
            Go
        </button>
        <input type="range" min="1" max="255" onChange={handleDimChange}></input>Dim
    </>
}