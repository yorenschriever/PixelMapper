import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { applyMiddleware } from 'redux'
import { Pixel, CompressedImage } from '../entities'
import { State } from '../reducers'
import { changePosition, deleteLowConfidence, interpolate, interpolateAll } from '../reducers/process'
import { compressedImageToCanvas, connectPositions, DrawPixelType, drawPosition } from './imageUtils'
import { DownloadStateButton } from './uploadDownloadState'

const getAlternatives = (pixel:Pixel) => pixel.alternativePositions.slice(0,5).map((pos,index)=> ({
    label: String.fromCharCode(index+65),
    position:pos
}))

export const Review = () => {
    const dispatch = useDispatch()
    const canvas = useRef<HTMLCanvasElement | null>(null)
    const pixels = useSelector<State, Pixel[]>(state => state.processReducer.pixels)
    const previewImage = useSelector<State, CompressedImage>(state => state.processReducer.preview!)
    const [activePixel, setActivePixel] = useState<number>(0)
    const [waitManualPlacement, setWaitManualPlacement] = useState<number|undefined>(undefined)

    useEffect(() => {
        compressedImageToCanvas(previewImage, canvas.current!).then(() => {
            const context = canvas.current!.getContext('2d')!

            const unknownEndpoint = {x:0,y:0,confidence:0}
            let lastPosition = pixels[0].position || unknownEndpoint
            for (let i = 1; i < pixels.length; i++) {
                let skipped=false
                while (i<pixels.length && !pixels[i].position) { i++; skipped=true }

                const reachedUnlocatedEnd = i === pixels.length && skipped
                const newPosition = reachedUnlocatedEnd ? unknownEndpoint : pixels[i].position!

                connectPositions(context,lastPosition, newPosition , skipped ? DrawPixelType.Missing:DrawPixelType.Normal)
                
                lastPosition = newPosition
            }

            pixels.forEach(pixel => {
                pixel.position && drawPosition(context, pixel.position, pixel.index.toString(), DrawPixelType.Normal)
            })
            
            //pixels[activePixel].alternativePositions.forEach((pos,index) => drawPosition(context,pos,String.fromCharCode(index+65),DrawPixelType.Alternative))
            getAlternatives(pixels[activePixel]).forEach(alt => drawPosition(context,alt.position,alt.label,DrawPixelType.Alternative))

            if (pixels[activePixel].position)
                drawPosition(context, pixels[activePixel].position!, pixels[activePixel].index.toString(), DrawPixelType.Highlight)


        })
    }, [pixels, previewImage, activePixel])

    // const setActivePixel = (index:number) => {
    //     setActivePixelState(index)
    //     //TODO devicesController.highlight
    // }

    const logPos = (event: any) => {
        const rect = canvas.current!.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const scalex = canvas.current!.width / parseInt(getComputedStyle(canvas.current!).getPropertyValue('width'))
        const scaley = canvas.current!.height / parseInt(getComputedStyle(canvas.current!).getPropertyValue('height'))

        console.log({x,y}, {scalex, scaley},{xcomp: x*scalex, ycomp:y*scaley})

        if (waitManualPlacement!==undefined){
            dispatch(changePosition(waitManualPlacement,{x:x*scalex, y:y*scaley,confidence:1}))
            setWaitManualPlacement(undefined)
        }
    }

    return <>
        <canvas 
            ref={canvas} 
            style={{ 
                    maxWidth: "100vw", 
                    maxHeight: "100vh",
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
            }} 
            onClick={logPos}
        />
        <PixelCarousel pixels={pixels} activePixel={activePixel} setActivePixel={setActivePixel} setWaitManualPlacement={setWaitManualPlacement} show={waitManualPlacement===undefined}/>
        <DownloadStateButton>Download state</DownloadStateButton>
        <button onClick={()=>dispatch(interpolateAll())}>Interpolate all</button>
        
        <button onClick={()=>dispatch(deleteLowConfidence(0.5))}>delete &lt; 50%</button>
        <button onClick={()=>dispatch(deleteLowConfidence(0.25))}>delete &lt; 25%</button>
    </>
}

type PixelCarouselProps = {
    pixels: Pixel[];
    activePixel: number;
    setActivePixel: (index: number) => void
    setWaitManualPlacement: (index: number) => void
    show:boolean
}

const PixelCarousel = ({ pixels, activePixel, setActivePixel, setWaitManualPlacement,show }: PixelCarouselProps) => {
    const pixelPanel = useRef<HTMLDivElement | null>(null)
    const [positionMenuOpen,setPositionMenuOpen] = useState<boolean>(false)
    const [positionMenuX,setPositionMenuX] = useState<string>("0")

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft: number = e.currentTarget.scrollLeft
        const panelWidth = pixelPanel.current!.offsetWidth + parseInt(window.getComputedStyle(pixelPanel.current!).marginLeft) + parseInt(window.getComputedStyle(pixelPanel.current!).marginRight)

        const centerPixel = Math.round((scrollLeft - panelWidth / 2) / panelWidth)

        if (centerPixel >= 0 && centerPixel < pixels.length){
            setActivePixel(centerPixel)
            setPositionMenuX("50%")
        }
    }

    // const openPixelMenu = (x:number,index:number) =>{
    //     setPositionMenuOpen(true)
    //     setPositionMenuX(x)
    // }

    return (
        <div style={{position:"fixed", bottom:"25px", width:"100vw", display: show?"block":"none"}}>
        
            <div
                style={{ width: "100%", overflowX: "scroll", display: "flex", position: "relative"}}
                onScroll={handleScroll}
            >

                {positionMenuOpen && <PositionMenu pixel={pixels[activePixel]} setWaitManualPlacement={setWaitManualPlacement} closeMenu={()=>setPositionMenuOpen(false)} x={positionMenuX}/>}
                
                <div style={{ flex: "0 0 50%", }} ></div>
                {pixels.map(pixel => (
                    <PixelPanel
                        key={pixel.index}
                        ref2={pixel.index === 0 ? pixelPanel : undefined}
                        pixel={pixel}
                        activePixel={activePixel}
                        setActivePixel={setActivePixel}
                        openPixelMenu={()=>setPositionMenuOpen(true)}
                        setPositionMenuX={setPositionMenuX}
                    />
                ))}
                <div style={{ flex: "0 0 50%", }}></div>
            </div>
        </div>)
}

type PixelPanelProps = {
    pixel:Pixel,
    activePixel: number,
    setActivePixel: (index: number) => void
    openPixelMenu: (index:number) => void
    setPositionMenuX: (x:string)=> void
    ref2: React.Ref<HTMLDivElement>|undefined
}

const PixelPanel = ({pixel, activePixel,setActivePixel,ref2, openPixelMenu, setPositionMenuX}:PixelPanelProps) => {

    // let backgroundColor="rgba(255,255,255,0.4)"
    // if (!pixel.position) backgroundColor="rgba(255,0,0,0.5)"
    // else if (pixel.position?.confidence < 0.5) backgroundColor="rgba(255,127,0,0.5)"
    // if (pixel.index === activePixel) backgroundColor="rgba(255,255,255,0.7)"
    // if (pixel.index === activePixel && !pixel.position) backgroundColor="rgba(255,0,0,0.7)"

    let rgb = "255,255,255"
    if (!pixel.position) rgb= "255,0,0"
    else if (pixel.position?.confidence < 0.5) rgb="255,127,0"
    const alpha = pixel.index === activePixel ? "0.8" : "0.4"

    const backgroundColor = `rgba(${rgb},${alpha})`
    const borderColor = `rgba(${rgb},1)`

    return <div
        ref={ref2}
        onMouseOver={e => {
            setActivePixel(pixel.index); 
            setPositionMenuX(e.currentTarget.offsetLeft - e.currentTarget.offsetParent!.scrollLeft + (75/2) + "px")
        }}
        onClick={e => {
            openPixelMenu(pixel.index); 
            setPositionMenuX(e.currentTarget.offsetLeft - e.currentTarget.offsetParent!.scrollLeft + (75/2) + "px")
        }}
        style={{
            width: "75px",
            height: "75px",
            flex: "0 0 75px",
            border: "1px solid",
            borderRadius: "8px",
            backgroundColor,
            borderColor,
            margin:"5px",
            marginBottom:"20px",
            textAlign:"center",
            color:"rgba(255,255,255,0.8)",
            fontSize: "32px",
            paddingTop:"20px",
            cursor:"pointer"
        }}
    >
        {pixel.index.toString()}
        {pixel.position && <div style={{fontSize:"12px"}}>Confidence:<br/>{Math.round(pixel.position.confidence*100)}%</div>}
    </div>
}

type PositionMenuProps = {
    pixel:Pixel,
    setWaitManualPlacement:(index: number) => void
    closeMenu: ()=>void
    x:string
    // activePixel: number,
    // setActivePixel: (index: number) => void
    // openPixelMenu: (x:number,index:number) => void
    // ref2: React.Ref<HTMLDivElement>|undefined
}

const PositionMenu = ({pixel, setWaitManualPlacement, closeMenu,x}:PositionMenuProps)=> {
    const dispatch = useDispatch()

    const buttonStyle = {
        width:"100%",
        height:"40px"
    }

    return (
    <div
        style={{
            position:"fixed",
            //left:"50%",
            left:x,
            width:"125px",
            bottom:"150px",
            transform: "translate(-50%, 0)"
        }}
    >
        
    {pixel.position && <button style={buttonStyle} onClick={()=>dispatch(changePosition(pixel.index,undefined))}>Clear point {pixel.index.toString()}</button>}
        {getAlternatives(pixel).map(alt=> <button key={alt.label} style={buttonStyle} onClick={()=>dispatch(changePosition(pixel.index,{...alt.position,confidence:1}))}>Alt {alt.label} ({Math.round(alt.position.confidence*100)}%)</button>)}
        <button style={buttonStyle} onClick={()=>{setWaitManualPlacement(pixel.index); closeMenu()}}>Manual placement</button>
        {!pixel.position && <button style={buttonStyle} onClick={()=>dispatch(interpolate(pixel.index))}>Interpolate</button>}
        <button style={buttonStyle} onClick={closeMenu}>Close menu</button>
    </div>)
}