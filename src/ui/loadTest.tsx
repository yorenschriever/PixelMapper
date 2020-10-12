import React from "react"
import { ActiveStep, addImages, setStep} from "../reducers"
import { useDispatch} from 'react-redux'
import { setPreview } from "../reducers/process"
import { canvasToCompressedImage } from "./imageUtils"

export const LoadTest = () => {
    const dispatch = useDispatch()

    const loadImageData = (imgName:string):ImageData => {
        const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;

        var img = document.getElementById(imgName)! as HTMLImageElement;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0,img.width, img.height );
        return ctx.getImageData(0, 0, img.width, img.height);
    }

    const loadTestSet = () =>
    {
        const white = loadImageData('white')
        const previewCompressed = canvasToCompressedImage(document.getElementById("canvas")! as HTMLCanvasElement)
        
        dispatch(addImages(
            white,
            loadImageData('black'),
            [
                loadImageData('img0'),
                loadImageData('img1'),
                loadImageData('img2'),
                loadImageData('img3'),
                loadImageData('img4'),
                loadImageData('img5'),
            ]

        ))

        dispatch(setPreview(previewCompressed))

        dispatch(setStep(ActiveStep.Process))
    }

    const style = {
        display:"none",
    }

    return <>
        <img alt="" src="testset/img9749.jpg" id="white" style={style}/>
        <img alt="" src="testset/img9750.jpg" id="black" style={style}/>

        <img alt="" src="testset/img9751.jpg" id="img0" style={style}/>
        <img alt="" src="testset/img9752.jpg" id="img1" style={style}/>
        <img alt="" src="testset/img9753.jpg" id="img2" style={style}/>
        <img alt="" src="testset/img9754.jpg" id="img3" style={style}/>
        <img alt="" src="testset/img9755.jpg" id="img4" style={style}/>
        <img alt="" src="testset/img9756.jpg" id="img5" style={style}/>

        <button onClick={loadTestSet}>load test set</button>

        <canvas id="canvas" style={style}/>
    </>
}
