import { useEffect, useRef, useState } from "react";
import { videoToCompressedImage } from "../imageUtils";

export const useVideo = () => {

    const imagedimension = useRef<{ w: number, h: number } | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const track = useRef<MediaStreamTrack | null>(null)
    const capture = useRef<ImageCapture | null>(null)

    const [capturing, setCapturing] = useState(false)
    const [cameraReady, setCameraReady] = useState(!!track.current)

    useEffect(() => {
        const idealDimensions = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
        }

        if (!videoRef.current) {
            console.log('video element not found')
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                ...idealDimensions
            }, audio: false,
        }).then(function (stream) {
            videoRef.current!.srcObject = stream;
            videoRef.current!.play();

            videoRef.current!.addEventListener('loadedmetadata', e => {

                track.current = stream.getVideoTracks()[0]
                const settings = track.current.getSettings()
                imagedimension.current = {
                    w: settings.width!,
                    h: settings.height!
                }

                capture.current = new ImageCapture(track.current)

                setCameraReady(true)
                setExposure("dark") //test mode
            })
        })

        return () => {
            track.current?.stop();
        }
    }, [])

    const captureImage = () => videoToCompressedImage(videoRef.current!, imagedimension.current!.w, imagedimension.current!.h);
    const setExposure = (mode: "auto" | "dark") => {
        if (mode === "auto")
            track.current!.applyConstraints({ advanced: [{ exposureMode: "continuous", exposureCompensation: 0 }] })
        else if (mode === "dark")

            console.log('dark',track.current!.getConstraints(), track.current?.getCapabilities())

            //track.current?.applyConstraints

            const constraints = {
                exposureMode: "manual", 
                iso: 50,
                //exposureTime: 10,
                
            }

            track.current!.applyConstraints({ 
                ...constraints,
                advanced: [constraints]
            })

            // track.current!.applyConstraints({ 
            //     //whiteBalanceMode:

            //     // exposureMode: "manual", 
            //     // exposureCompensation: -2,
            //     // iso: 50,
            //     // colorTemperature: 9100,
            //     // autoGainControl: false,
            //     // frameRate: 30,
            //     // focusDistance: 3,
            //     // whiteBalanceMode: "manual",

            //     // exposureMode: "manual", 
            //     // //exposureCompensation: -2,
            //     // iso: 50,
            //     // colorTemperature: 7000,
            //     // // autoGainControl: false,
            //     // //frameRate: 30,
            //     // focusDistance: .5,
            //     // whiteBalanceMode: "manual",
            //     // exposureTime: 30,

            //     // exposureMode: "continuous", 
            //     // // // //exposureCompensation: -2,
            //     // iso: 500,
            //     // // // colorTemperature: 7000,
            //     // // // //autoGainControl: false,
            //     // // // //frameRate: 30,
            //     // // // focusDistance: .5,
            //     // // // whiteBalanceMode: "manual",
            //     // exposureTime: 400,
            //     // // pointsOfInterest: [{x:0,y:0}],

            //     advanced: [{ 
            //         //exposureMode: "continuous",
            //         exposureMode: "manual", 
            //         //exposureCompensation: +2,
            //         //iso: 100,
            //         //colorTemperature: 7000,
            //         //autoGainControl: true,
            //         //frameRate: 30,
            //         //focusDistance: .5,
            //         //whiteBalanceMode: "manual",
            //         exposureTime: 1000,
            //         //pointsOfInterest: [{x:0,y:0}]
            //     }] 
            //} as any)
            .then(
                () => console.log('set values',
                navigator.mediaDevices.getSupportedConstraints(),
                track.current!.getConstraints(), 
                track.current?.getCapabilities()
                )
            )
    }

    const takePhoto = () => capture.current!.takePhoto()

    return {
        setCapturing,
        setExposure,
        captureImage,
        videoRef,
        cameraReady,
        capturing,
        takePhoto
    }
}
