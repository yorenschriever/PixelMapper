import React, { } from "react"
import { useDispatch, useSelector } from "react-redux";
import { CompressedImage } from "../entities";
import { ActiveStep, addImages, setStep, State } from "../redux";
import { setPreview } from "../redux/process";
import { useVideo, useDevices } from "../hooks";

export const Capture = () => {
    const dispatch = useDispatch()

    const numSlices = useSelector<State, number>(state => Math.ceil(Math.log(state.devicesReducer.devices.map(d => d.pixelCount).reduce((a, b) => a + b)) / Math.log(2)))

    const { setCapturing, setExposure, captureImage, videoRef, cameraReady, capturing } = useVideo()
    const { connectionReady, setAllLeds, sendSlice } = useDevices()

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
        await sleep(2 * 150)
        const black = captureImage()

        const slices: CompressedImage[] = []
        for (let i = 0; i < numSlices; i++) {
            await sendSlice(i)
            await sleep(2 * 150)
            slices.push(captureImage())
        }

        await sleep(150)
        await setAllLeds(false)

        dispatch(addImages(white, black, slices))
        dispatch(setPreview(previewCompressed))
        dispatch(setStep(ActiveStep.Process))

        setCapturing(false);
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
    </>
}