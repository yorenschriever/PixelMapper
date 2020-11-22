import useSwitch from '@react-hook/switch'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pixel, CompressedImage } from '../entities'
import { CaptureState, State } from '../redux'
import { changePosition, CropType, deleteLowConfidence, interpolate, interpolateAll, setCrop } from '../redux/process'
import { BurgerMenu } from './burgerMenu'
import { ExportButton } from './exportButton'
import { compressedImageToCanvas, connectPositions, DrawPixelType, drawPosition, imageDataTocanvas } from '../imageUtils'
import { useWorker } from "../worker/useWorker"
import { createRunMessage } from '../utils'
import { EncoderType } from '../encoders/encoderFactory'
import { encoderTypeSelector, numPixelsSelector } from '../redux/selectors'
import { Crop } from './crop'

const getAlternatives = (pixel: Pixel) => pixel.alternativePositions.slice(0, 5).map((pos, index) => ({
    label: String.fromCharCode(index + 65),
    position: pos
}))

export const Review = () => {
    const dispatch = useDispatch()
    const [error, setError] = useState<string>("")
    const canvas = useRef<HTMLCanvasElement | null>(null)
    const debugCanvas = useRef<HTMLCanvasElement | null>(null)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)
    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const [activePixel, setActivePixel] = useState<number>(0)
    const [waitManualPlacement, setWaitManualPlacement] = useState<number | undefined>(undefined)
    const [showingDebugimg, setShowingDebugImg] = useSwitch(false);
    const worker = useWorker();
    const numPixels = useSelector<State, number>(numPixelsSelector)
    const encoderType = useSelector<State, EncoderType>(encoderTypeSelector)
    const captureState = useSelector<State, CaptureState>(i => i.captureReducer)
    const crop = useSelector<State, CropType | undefined>(i => i.processReducer.crop)

    const workerMessageHandler = useCallback(async (event: MessageEvent<any>) => {
        switch (event.data.type) {
            case "RECALCULATEIMG":
                imageDataTocanvas(event.data.img, debugCanvas.current!)
                const context = debugCanvas.current!.getContext('2d')!
                getAlternatives(pixels[event.data.index]).forEach(alt => drawPosition(context, alt.position, alt.label, DrawPixelType.Alternative))
                setShowingDebugImg.on()
                break;
            case "ISINITIALIZEDRESPONSE":
                if (!event.data.initialized) {
                    const runmsg = await createRunMessage(captureState, numPixels, encoderType, 'INITONLY')
                    worker.postMessage(runmsg)
                }
                break;
            default:
        }
    }, [pixels, setShowingDebugImg, worker, captureState, numPixels, encoderType])

    useEffect(() => {
        worker.onerror = (err) => {
            console.log('error', err)
            setError(JSON.stringify({ error: err.message }))
        }
        worker.onmessage = workerMessageHandler
        worker.postMessage({ type: 'ISINITIALIZEDREQUEST' })

        return () => {
            worker.onerror = null
            worker.onmessage = null
            //worker.postMessage({type:"CLEAN"})
            //worker.terminate();
        }
    }, [worker, workerMessageHandler])

    const [baseImage, setBaseImage] = useState<ImageData | null>(null);
    const drawBaseImage = useCallback(async () => {
        if (baseImage) {
            imageDataTocanvas(baseImage, canvas.current!)
            return;
        }

        await compressedImageToCanvas(previewImage, canvas.current!)

        const context = canvas.current!.getContext('2d')!

        const unknownEndpoint = { x: 0, y: 0, confidence: 0 }
        let lastPosition = pixels[0].position || unknownEndpoint
        for (let i = 1; i < pixels.length; i++) {
            let skipped = false
            while (i < pixels.length && !pixels[i].position) { i++; skipped = true }

            const reachedUnlocatedEnd = i === pixels.length && skipped
            const newPosition = reachedUnlocatedEnd ? unknownEndpoint : pixels[i].position!

            connectPositions(context, lastPosition, newPosition, skipped ? DrawPixelType.Missing : DrawPixelType.Normal)

            lastPosition = newPosition
        }

        pixels.forEach(pixel => {
            pixel.position && drawPosition(context, pixel.position, pixel.index.toString(), pixel.position.confidence > 0.1 ? DrawPixelType.Normal : DrawPixelType.LowConfidence)
        })

        setBaseImage(context.getImageData(0, 0, canvas.current!.width, canvas.current!.height));

    }, [baseImage, pixels, previewImage])

    useEffect(() => {
        drawBaseImage().then(() => {
            const context = canvas.current!.getContext('2d')!

            getAlternatives(pixels[activePixel]).forEach(alt => drawPosition(context, alt.position, alt.label, DrawPixelType.Alternative))

            if (pixels[activePixel].position)
                drawPosition(context, pixels[activePixel].position!, pixels[activePixel].index.toString(), DrawPixelType.Highlight)

            if (crop) {
                context.strokeStyle = 'red'
                context.lineWidth = 2
                context.beginPath();
                context.moveTo(crop.x0, crop.y0);
                context.lineTo(crop.x0, crop.y1);
                context.lineTo(crop.x1, crop.y1);
                context.lineTo(crop.x1, crop.y0);
                context.lineTo(crop.x0, crop.y0);
                context.stroke();
            }
        })
    }, [pixels, activePixel, crop, drawBaseImage])

    const handleCanvasClick = (event: any) => {
        //check if we are in manual placement mode
        if (waitManualPlacement === undefined)
            return

        const rect = canvas.current!.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const scalex = canvas.current!.width / parseInt(getComputedStyle(canvas.current!).getPropertyValue('width'))
        const scaley = canvas.current!.height / parseInt(getComputedStyle(canvas.current!).getPropertyValue('height'))

        dispatch(changePosition(waitManualPlacement, { x: x * scalex, y: y * scaley, confidence: 1 }))
        setWaitManualPlacement(undefined)
    }

    const calcCrop = useCallback(() => ({
        x0: pixels.map(i => i.position?.x ?? canvas.current!.width).reduce((a, b) => Math.min(a, b)),
        y0: pixels.map(i => i.position?.y ?? canvas.current!.height).reduce((a, b) => Math.min(a, b)),
        x1: pixels.map(i => i.position?.x ?? 0).reduce((a, b) => Math.max(a, b)),
        y1: pixels.map(i => i.position?.y ?? 0).reduce((a, b) => Math.max(a, b)),
    }), [pixels])

    const logStats = () => {
        console.log('# not found', pixels.filter(i => i.position === undefined).length)
        console.log('total confidence', pixels.map(i => i.position?.confidence || 0).reduce((a, b) => a + b, 0))
    }

    useEffect(logStats, [])

    return <>
        <canvas ref={canvas} className="processCanvas" onClick={handleCanvasClick} />
        <canvas ref={debugCanvas} className="processCanvas" style={{ display: showingDebugimg ? "block" : "none" }} onClick={setShowingDebugImg.off} />

        {crop && !showingDebugimg && <Crop canvas={canvas} baseImage={baseImage} />}

        <div className="processStatus">
            {error}
        </div>

        <PixelCarousel pixels={pixels} activePixel={activePixel} setActivePixel={setActivePixel} setWaitManualPlacement={setWaitManualPlacement} show={waitManualPlacement === undefined} />

        <BurgerMenu>
            <button onClick={() => dispatch(interpolateAll())}>Interpolate all</button>

            <button onClick={() => dispatch(deleteLowConfidence(0.5))}>delete &lt; 50%</button>
            <button onClick={() => dispatch(deleteLowConfidence(0.25))}>delete &lt; 25%</button>
            <button onClick={() => dispatch(deleteLowConfidence(0.1))}>delete &lt; 10%</button>
            <button onClick={() => dispatch(deleteLowConfidence(0.05))}>delete &lt; 5%</button>

            {crop ?
                <button onClick={() => dispatch(setCrop(undefined))}>No crop</button> :
                <button onClick={() => dispatch(setCrop(calcCrop()))}>Crop</button>
            }

            <ExportButton type="csv">Export CSV</ExportButton>
            <ExportButton type="h">Export .h</ExportButton>
        </BurgerMenu>
    </>
}

type PixelCarouselProps = {
    pixels: Pixel[];
    activePixel: number;
    setActivePixel: (index: number) => void
    setWaitManualPlacement: (index: number) => void
    show: boolean
}

const PixelCarousel = ({ pixels, activePixel, setActivePixel, setWaitManualPlacement, show }: PixelCarouselProps) => {
    const pixelPanel = useRef<HTMLDivElement | null>(null)
    const [positionMenuOpen, setPositionMenuOpen] = useSwitch(false)
    const [positionMenuX, setPositionMenuX] = useState<string>("0")

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft: number = e.currentTarget.scrollLeft
        const panelWidth = pixelPanel.current!.offsetWidth + parseInt(window.getComputedStyle(pixelPanel.current!).marginLeft) + parseInt(window.getComputedStyle(pixelPanel.current!).marginRight)

        const centerPixel = Math.round((scrollLeft - panelWidth / 2) / panelWidth)

        if (centerPixel >= 0 && centerPixel < pixels.length) {
            setActivePixel(centerPixel)
            setPositionMenuX("50%")
        }
    }

    return (
        //i switch display to hidden instead of conditionally rendering this component, 
        //so the browser doesnt need to repaint the carousel every time you manually place a pixel
        //this speeds up things a lot when having many pixels (1000+)
        <div className="pixelCarousel" style={{ display: show ? "block" : "none" }}>
            <div className="scroller" onScroll={handleScroll}>

                {positionMenuOpen && <PositionMenu pixel={pixels[activePixel]} setWaitManualPlacement={setWaitManualPlacement} closeMenu={setPositionMenuOpen.off} x={positionMenuX} />}

                <div className="padder"></div>
                {pixels.map(pixel => (
                    <PixelPanel
                        key={pixel.index}
                        ref2={pixel.index === 0 ? pixelPanel : undefined}
                        pixel={pixel}
                        activePixel={activePixel}
                        setActivePixel={setActivePixel}
                        setPositionMenuOpen={setPositionMenuOpen}
                        setPositionMenuX={setPositionMenuX}
                    />
                ))}
                <div className="padder"></div>
            </div>
        </div>)
}

type PixelPanelProps = {
    pixel: Pixel,
    activePixel: number,
    setActivePixel: (index: number) => void
    setPositionMenuOpen: (() => void) & { on: () => void }
    setPositionMenuX: (x: string) => void
    ref2: React.Ref<HTMLDivElement> | undefined
}

const PixelPanel = ({ pixel, activePixel, setActivePixel, ref2, setPositionMenuOpen, setPositionMenuX }: PixelPanelProps) => {

    let className = "pixelPanel"
    if (!pixel.position) className += " red"
    else if (pixel.position?.confidence < 0.1) className += " orange"
    if (pixel.index === activePixel) className += " active"

    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setActivePixel(pixel.index);
        setPositionMenuX(e.currentTarget.offsetLeft - e.currentTarget.offsetParent!.scrollLeft + (75 / 2) + "px")
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //console.log({index:pixel.index,activePixel},pixel.index === activePixel)
        //if (pixel.index === activePixel) setPositionMenuOpen(); //toggle menu open
        //else 
        setPositionMenuOpen.on(); //always open menu when switching to another pixel
        setPositionMenuX(e.currentTarget.offsetLeft - e.currentTarget.offsetParent!.scrollLeft + (75 / 2) + "px")
    }

    return <div
        ref={ref2}
        onMouseOver={handleMouseOver}
        onClick={handleClick}
        className={className}
    >
        {pixel.index.toString()}
        {pixel.position && <div className="confidence">Confidence:<br />{Math.round(pixel.position.confidence * 100)}%</div>}
    </div>
}

type PositionMenuProps = {
    pixel: Pixel,
    setWaitManualPlacement: (index: number) => void
    closeMenu: () => void
    x: string
}

const PositionMenu = ({ pixel, setWaitManualPlacement, closeMenu, x }: PositionMenuProps) => {
    const dispatch = useDispatch()
    const worker = useWorker();

    return (
        <div className="positionMenu" style={{ left: x }}>
            {pixel.position && <button onClick={() => dispatch(changePosition(pixel.index, undefined))}>Clear point {pixel.index.toString()}</button>}

            {getAlternatives(pixel).map(alt => <button key={alt.label} onClick={() => dispatch(changePosition(pixel.index, { ...alt.position, confidence: 1 }))}>Alt {alt.label} ({Math.round(alt.position.confidence * 100)}%)</button>)}

            <button onClick={() => { setWaitManualPlacement(pixel.index); closeMenu() }}>Manual placement</button>

            {!pixel.position && <button onClick={() => dispatch(interpolate(pixel.index))}>Interpolate</button>}

            <button onClick={() => worker.postMessage({ type: "RECALCULATE", code: pixel.code, index: pixel.index })}>Show calculated</button>

            <button onClick={closeMenu}>Close menu</button>
        </div>
    )
}