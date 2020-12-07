

export const imageDataFromMat = (mat:cv.Mat) => {
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