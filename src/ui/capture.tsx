import React, { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux";
import { CompressedImage } from "../entities";
import { ActiveStep, addImages, setAlign, setStep, State } from "../redux";
import { setPreview } from "../redux/process";
import { useVideo, useDevices } from "../hooks";
import { numPixelsSelector, encoderTypeSelector } from "../redux/selectors"
import { encoderFactory } from "../encoders/encoderFactory"
import { useMovementDetection } from "../hooks/useMovementDetection";

export const Capture = () => {
    const dispatch = useDispatch()

    const numPixels = useSelector<State, number>(numPixelsSelector)
    const encoderType = useSelector(encoderTypeSelector)
    const encoder = useMemo(() => encoderFactory(encoderType, numPixels), [encoderType, numPixels])
    const numSlices = encoder.GetCodeLength()

    const { setCapturing, setExposure, captureImage, videoRef, cameraReady, capturing } = useVideo()
    const { connectionReady, setAllLeds, sendSlice } = useDevices()
    const { isMovingNow, hasMoved, resetHasMoved} = useMovementDetection();

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const capture = async () => {
        setCapturing(true);

        console.log("Taking preview image")
        await setExposure('auto')
        //await setAllLeds(true)
        await sleep(1000)
        resetHasMoved();
        const previewCompressed = captureImage();

        console.log("Taking white image")
        await setExposure('dark')
        //await sleep(1000)
        await sleep(333)
        const white = captureImage()

        // console.log("Taking black image")
        // await setAllLeds(false)
        // await sleep(3 * 150)
        const black = captureImage()

        const slices: CompressedImage[] = []
        for (let i = 0; i < Math.ceil(numSlices/3); i++) {
            //await sendSlice(i, encoder)
            //await sleep(3 * 150)
            await sleep(333)
            slices.push(captureImage())
        }

        //await sleep(150)
        //await setAllLeds(false)

        //if (hasMoved)
        //    dispatch(setAlign(true))
        dispatch(addImages(white, black, slices))
        dispatch(setPreview(previewCompressed))
        dispatch(setStep(ActiveStep.Process))

        setCapturing(false);
    }

    return <>
        <video ref={videoRef} className="videoPreview" />
        <div className="notificationsFloating">
            {isMovingNow && <div className="warning">Camera movement detected. An effort will be made to align the images. For better results use a tripod</div>}

        </div> 
        <button
            onClick={capture}
            className="captureButton"
            //disabled={!cameraReady || !connectionReady || capturing}
        >
            Go
        </button>
    </>
}