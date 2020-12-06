import useSwitch from '@react-hook/switch'
import React, { RefObject, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../redux'
import { CropType, setCrop } from '../redux/process'

type CropProps = {
    canvas: RefObject<HTMLCanvasElement>

    //Baseimage prop is here because i want this component to rerender if the baseimage changes.
    //(ie. the scale factor becomes available)
    //The image data itself is not used
    baseImage: ImageData | null
}

export const Crop = ({ canvas }: CropProps) => {
    const dispatch = useDispatch();
    const currentlyDragging = useRef<HTMLDivElement | null>(null)
    const topleft = useRef<HTMLDivElement>(null)
    const topright = useRef<HTMLDivElement>(null)
    const bottomleft = useRef<HTMLDivElement>(null)
    const bottomright = useRef<HTMLDivElement>(null)
    const cropState = useSelector<State, CropType>(i => i.processReducer.crop!)
    //this switch changes value when the window resizes. Changing state triggers a rerender of the croppoints in their new position
    const [, setWindowSized] = useSwitch(); 

    const toPageCoordinate = useCallback((x: number, y: number) => {
        if (!canvas.current) return { left: 0, top: 0 };
        const scale = canvas.current!.height / canvas.current!.clientHeight
        const xcorrection = canvas.current!.offsetLeft - canvas.current!.offsetWidth / 2
        const ycorrection = canvas.current!.offsetTop - canvas.current!.offsetHeight / 2
        return { left: x / scale + xcorrection, top: (y / scale + ycorrection) }
    }, [canvas])

    const toImageCoordinate = useCallback((left: number, top: number) => {
        if (!canvas.current) return { x: 0, y: 0 }
        const scale = canvas.current!.height / canvas.current!.clientHeight
        const xcorrection = canvas.current!.offsetLeft - canvas.current!.offsetWidth / 2
        const ycorrection = canvas.current!.offsetTop - canvas.current!.offsetHeight / 2
        return { x: (left - xcorrection) * scale, y: (top - ycorrection) * scale }
    }, [canvas])

    const elementDrag = useCallback((e: MouseEvent | TouchEvent) => {
        e = e || window.event;
        e.preventDefault();
        const elmnt = currentlyDragging.current
        if (!elmnt)
            return

        const isTouch = (e: MouseEvent | TouchEvent): e is TouchEvent => (e as any).clientX === undefined

        const coordinates = toImageCoordinate(
            (isTouch(e) ? e.touches[0].clientX : e.clientX),
            (isTouch(e) ? e.touches[0].clientY : e.clientY)
        )

        const newState = { ...cropState }
        newState[(elmnt.dataset.x as "x0" | "x1")] = coordinates.x
        newState[(elmnt.dataset.y as "y0" | "y1")] = coordinates.y
        dispatch(setCrop(newState));

    }, [cropState, dispatch, toImageCoordinate]);

    const closeDragElement = useCallback(() => {
        document.onmouseup = null;
        document.onmousemove = null;
        currentlyDragging.current = null;
    }, [])

    const dragMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
        e = e || window.event;
        e.preventDefault();
        currentlyDragging.current = e.target as HTMLDivElement
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        document.ontouchcancel = closeDragElement;
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDrag;
    }, [closeDragElement, elementDrag])

    useEffect(() => {
        topleft.current!.onmousedown = dragMouseDown
        topleft.current!.ontouchstart = dragMouseDown

        topright.current!.onmousedown = dragMouseDown
        topright.current!.ontouchstart = dragMouseDown

        bottomleft.current!.onmousedown = dragMouseDown
        bottomleft.current!.ontouchstart = dragMouseDown

        bottomright.current!.onmousedown = dragMouseDown
        bottomright.current!.ontouchstart = dragMouseDown
    }, [dragMouseDown])

    useEffect(() => {
        window.addEventListener('resize', setWindowSized);
        return () => { window.removeEventListener('resize', setWindowSized); }
    },[setWindowSized])

    return <div>
        <div className="cropPoint" data-x="x0" data-y="y0" style={toPageCoordinate(cropState.x0, cropState.y0)} ref={topleft}></div>
        <div className="cropPoint" data-x="x1" data-y="y0" style={toPageCoordinate(cropState.x1, cropState.y0)} ref={topright}></div>
        <div className="cropPoint" data-x="x0" data-y="y1" style={toPageCoordinate(cropState.x0, cropState.y1)} ref={bottomleft}></div>
        <div className="cropPoint" data-x="x1" data-y="y1" style={toPageCoordinate(cropState.x1, cropState.y1)} ref={bottomright}></div>
    </div>
}