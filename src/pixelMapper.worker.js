import { PixelMapper } from "./core/pixelMapper";

importScripts("../../opencv.js")

const listener = (body) => {
    if (body.img) {
        body.img = imageDataFromMat(body.img)
        console.log('transformed img data', body)
    }

    postMessage(body)
}

const pixelMapper = new PixelMapper(listener)

addEventListener("message", event => {
    const body = event.data
    switch (body.type) {
        case "RUN":
            pixelMapper.run(
                cv.matFromImageData(body.whiteImage),
                cv.matFromImageData(body.blackImage),
                body.sliceImages.map(image => cv.matFromImageData(image)),
                body.numPixels
            )
            break;
        default:
            break;
    }

});


function imageDataFromMat(mat) {
    // converts the mat type to cv.CV_8U

    if (mat.type === cv.CV_32FC1) {
        console.log('special type:', mat.type(), cv.CV_32FC1)
        const img = new cv.Mat()
        mat.convertTo(img, cv.CV_8U, 255, 0)
        const clampedArray = new ImageData(
            new Uint8ClampedArray(img.data),
            img.cols,
            img.rows
        )
        img.delete()
        return clampedArray
    }


    const img = new cv.Mat()
    const depth = mat.type() % 8
    const scale =
        depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0
    const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0
    mat.convertTo(img, cv.CV_8U, scale, shift)

    // converts the img type to cv.CV_8UC4
    switch (img.type()) {
        case cv.CV_8UC1:
            cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA)
            break
        case cv.CV_8UC3:
            cv.cvtColor(img, img, cv.COLOR_RGB2RGBA)
            break
        case cv.CV_8UC4:
            break
        default:
            throw new Error(
                'Bad number of channels (Source image must have 1, 3 or 4 channels)'
            )
    }
    const clampedArray = new ImageData(
        new Uint8ClampedArray(img.data),
        img.cols,
        img.rows
    )
    img.delete()
    return clampedArray
}
