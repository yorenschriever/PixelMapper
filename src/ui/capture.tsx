import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { connectionFactory } from "../core/connectionFactory";
import { DevicesController } from "../core/devicesController";
import { States } from "../core/IConnection";
import { CompressedImage, Device } from "../entities";
import { ActiveStep, addImages, setStep, State } from "../reducers";
import { setPreview } from "../reducers/process";
import { videoToCompressedImage } from "./imageUtils";

export const Capture = () => {
    const dispatch = useDispatch()
    const imagedimension = useRef<{ w: number, h: number } | null>(null)
    const video = useRef<HTMLVideoElement|null>(null)
    const track = useRef<MediaStreamTrack | null>(null)
    const devices = useSelector<State, Device[]>(state => state.devicesReducer.devices)
    const numSlices = useSelector<State, number>(state => Math.ceil(Math.log(state.devicesReducer.devices.map(d => d.pixelCount).reduce((a, b) => a + b)) / Math.log(2)))
    
    //todo cleanup all this ready stuff
    const [capturing, setCapturing] = useState(false)
    const [cameraReady, setCameraReady] = useState(!!track.current)
    const calcAllConnected = useCallback(() => devices.every(device => connectionFactory.getConnection(device).getState() === States.Connected), [devices])
    const [connectionReady, setConnectionReady] = useState(calcAllConnected());
    const handleConnectionStateChange = useCallback(() => { 
        const allConnected = calcAllConnected()
        setConnectionReady(allConnected) 
        if (allConnected) 
            controller.current.setAll(true)//set all leds on to frame the camera //TODO one by one, all connected
    }, [calcAllConnected])
    useEffect(() => {
        devices.forEach(device => connectionFactory.getConnection(device).addStateListener(handleConnectionStateChange))
        return () => {
            devices.forEach(device => connectionFactory.getConnection(device).removeStateListener(handleConnectionStateChange))
        }
    })

    useEffect(() => {
        const idealDimensions = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
        }

        if (!video.current) {
            console.log('video element not found')
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                ...idealDimensions
            }, audio: false,
        }).then(function (stream) {
            video.current!.srcObject = stream;
            video.current!.play();

            video.current!.addEventListener('loadedmetadata', e => {


                track.current = stream.getVideoTracks()[0]
                const settings = track.current.getSettings()
                imagedimension.current = {
                    w: settings.width!,
                    h: settings.height!
                }

                setCameraReady(true)
            })
        })

        return () => {
            track.current?.stop();
        }
    }, [])

    const controller = useRef(new DevicesController(devices))

    const captureImage = () => {
        return videoToCompressedImage(video.current!,imagedimension.current!.w,imagedimension.current!.h) 
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const capture = async () => {
        setCapturing(true);

        await track.current!.applyConstraints({ advanced: [{ exposureMode: "continuous", exposureCompensation: 0 }] })
        await controller.current.setAll(true)
        await sleep(1000)
        console.log("Taking preview image")
        const previewCompressed = videoToCompressedImage(video.current!,imagedimension.current!.w,imagedimension.current!.h) 
        
        await track.current!.applyConstraints({ advanced: [{ exposureMode: "manual", exposureCompensation: -2 }] })

        await sleep(1000)
        console.log("Taking white image")
        const white = await captureImage()

        await controller.current.setAll(false)
        await sleep(2 * 150)
        console.log("Taking black image")
        const black = await captureImage()

        const slices: CompressedImage[] = []
        for (let i = 0; i < numSlices; i++) {
            await controller.current.sendSlice(i)
            await sleep(2 * 150)
            slices.push(await captureImage())
        }

        await sleep(150)
        await controller.current.setAll(false)

        dispatch(addImages(white, black, slices))
        dispatch(setPreview(previewCompressed))
        dispatch(setStep(ActiveStep.Process))

        setCapturing(false);
    }

    return <>
        <video ref={video} style={{ 
            maxWidth: "100vw", 
            maxHeight: "100vh",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
         }} />
        <button 
            onClick={capture} 
            style={{ position: "absolute", left: "25px", top: "25px", borderRadius: "50%", height: "50px", width: "50px" }}
            disabled={!cameraReady || !connectionReady || capturing}
        >
            Go
        </button>
    </>
}