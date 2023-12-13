import { useCallback, useEffect, useRef, useState } from "react";
import { videoToCompressedImage } from "../imageUtils";

export const useVideo = () => {

    const imagedimension = useRef<{ w: number, h: number } | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const track = useRef<MediaStreamTrack | null>(null)

    const [capturing, setCapturing] = useState(false)
    const [cameraReady, setCameraReady] = useState(!!track.current)

    const exposureCompensation = useRef(-2);

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
                ...idealDimensions,
                iso: 100,
                exposureCompensation: -2
            }, audio: false,
        }).then(function (stream) {
            videoRef.current!.srcObject = stream;
            videoRef.current!.play().catch(
                err => console.error('Error playing video', err)
            );

            videoRef.current!.addEventListener('loadedmetadata', e => {

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

    const captureImage = useCallback(() => videoToCompressedImage(videoRef.current!, imagedimension.current!.w, imagedimension.current!.h), []);
    const setExposure = useCallback((mode: "auto" | "dark") => {
        let constraints;
        if (mode === "auto")
            constraints = { advanced: [{ exposureMode: "continuous", exposureCompensation: 0 }] }
        else if (mode === "dark")
            constraints = { advanced: [{ exposureMode: "manual", exposureCompensation: exposureCompensation.current, }] }
        return track.current?.applyConstraints(constraints);
    }, [])

    const setExposureCompensation = useCallback((compensation: number) => {
        exposureCompensation.current = compensation
        return track.current?.applyConstraints({ advanced: [{ exposureMode: "continuous", exposureCompensation: compensation }] })
    }, [])

    return {
        setCapturing,
        setExposure,
        setExposureCompensation,

        captureImage,
        videoRef,
        cameraReady,
        capturing
    }
}
