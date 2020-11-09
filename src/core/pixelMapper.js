import simpleBlobDetector from "./simpleBlobDetector"

export class PixelMapper {
    codedImage = []
    codedImageNegative = []

    numSlices = 0
    numPixels = 0

    config = {
        blur: 11,
        align: true,
        imgWidth: 1280,
        livePreview: true,
        connectPoints: true,
        labelPoints: true

    }

    listener

    constructor(listener) {
        this.listener = listener
        console.log('test constructor')
    }

    run = (whiteImage, blackImage, sliceImages, numPixels) => {
        this.sendStatus('initializing')

        this.numPixels = numPixels
        this.numSlices = sliceImages.length

        let preparedBlackImage = undefined;
        if (blackImage) {
            this.sendStatus('preparing black image')
            preparedBlackImage = this.prepareImage(blackImage, undefined, false)
        }

        this.sendStatus('preparing start image')
        let startImage = this.prepareImage(whiteImage, preparedBlackImage, true)

        this.sendStatus('processing slice images')
        this.codedImage = []
        this.codedImageNegative = []
        sliceImages.forEach(image => {
            const prepared = this.prepareImage(image, preparedBlackImage, true)
            this.codedImage.push(prepared)
            this.codedImageNegative.push(this.invertColors(prepared))
        })

        //this.debug(this.codedImageNegative[0],'neg 0')

        blackImage.delete()
        whiteImage.delete()
        sliceImages.forEach(i => i.delete())



        this.sendStatus('starting decode')
        this.decodeRecursive(startImage, 0, this.numSlices)

        preparedBlackImage.delete()
        startImage.delete()
        this.codedImage.forEach(i => i.delete())
        this.codedImageNegative.forEach(i => i.delete())



        this.listener({
            type: 'DONE',
        })
    }

    sendStatus = (msg) => {
        console.log(msg)
        this.listener({
            type: 'STATUS',
            msg
        })
    }

    decodeRecursive = (cumuMat, code, depth) => {
        if (depth === 0) {
            //depth counts down, so the last multiplication step was reached
            const index = code //i dont use a fancy coding scheme. TODO add more comments why and how 
            if (index >= 0 && index < this.numPixels)
                this.detectSinglePixel(cumuMat, index)

        } else {
            const pos = new cv.Mat(cumuMat.size(), cv.CV_32F)
            const neg = new cv.Mat(cumuMat.size(), cv.CV_32F)

            cv.multiply(cumuMat, this.codedImage[depth - 1], pos)
            cv.multiply(cumuMat, this.codedImageNegative[depth - 1], neg)

            this.decodeRecursive(neg, code << 1, depth - 1)
            this.decodeRecursive(pos, code << 1 | 1, depth - 1)

            pos.delete()
            neg.delete()
        }
    }

    detectParams = {
        thresholdStep: 64,
        minThreshold: 64,
        maxThreshold: 255,
        minDistBetweenBlobs: 25,
        filterByColor: false,
        filterByArea: false,
        filterByInertia: false,
        filterByConvexity: false,
        minRepeatability: 1,
        minArea: 5,
        maxArea: 500,
        faster: true
    }

    detectSinglePixel = (mat, index) => {


        //if (index==32)
        //    this.debug(mat,'img32')

        const keypoints = simpleBlobDetector(mat, this.detectParams)

        const positions = keypoints.map(kp => ({
            x: kp.pt.x,
            y: kp.pt.y,
            size: kp.size,
            intensity: mat.floatAt(Math.round(kp.pt.y), Math.round(kp.pt.x))
        }))
        positions.sort((a, b) => b.intensity - a.intensity)
        const bestCandidate = positions && positions[0]

        const msg = {
            type: 'PIXELRESULT',
            index,
            isLocated: positions.length > 0,
            position: bestCandidate,
            alternativePositions: positions
        }

        this.listener(msg)
    }

    debug = (img, msg) => {
        this.listener({
            type: 'DEBUGIMG',
            img,
            msg
        })
    }

    invertColors = (pos) => {
        let neg = cv.Mat.ones(pos.size(), cv.CV_32F)
        cv.subtract(neg, pos, neg)
        return neg;
    }

    prepareImage = (input, blackImage, rescale = false) => {
        //create our working matrix mat, and load the input image in the correct color space
        let mat = new cv.Mat(input.size(), cv.CV_32F)
        input.convertTo(mat, cv.CV_32F)
        cv.cvtColor(mat, mat, cv.COLOR_RGB2GRAY)

        mat = this.rescaleSize(mat)

        // if (this.config.align && blackImage)
        //     //align the images to the blackimage to compensate for camera shake.
        //     //this doesnt work well. use a tripod.
        //     mat = this.alignImage(mat,blackImage)

        if (this.config.blur > 0)
            //apply blur to be more resistant against noise
            cv.GaussianBlur(mat, mat, new cv.Size(this.config.blur, this.config.blur), 0, 0)

        if (blackImage)
            //subtract the black image (with all pixels off) to filter noise
            cv.subtract(mat, blackImage, mat)

        if (rescale)
            //resize the pixel values from 0-255 to 0-1, so we can multiply multiple images together
            cv.divide(mat, cv.Mat.ones(mat.size(), cv.CV_32F), mat, 1 / 256)

        if (blackImage) {
            //increase contrast by gamma boost, because otherwise we will have low values after black is subtracted
            mat.convertTo(mat, -1, 2.2, -0.25)

            //constrain new values between 0-1
            cv.max(mat, cv.Mat.zeros(mat.size(), cv.CV_32F), mat)
            cv.min(mat, cv.Mat.ones(mat.size(), cv.CV_32F), mat)
        }

        return mat
    }

    rescaleSize = (input) => {
        const inputsize = input.size()
        if (inputsize.width <= this.config.imgWidth)
            //image is already small enough. use current size
            return input

        const width = this.config.imgWidth
        const height = Math.round(inputsize.height * (this.config.imgWidth / inputsize.width))

        let output = new cv.Mat(height, width, cv.CV_32F)
        cv.resize(input, output, output.size())
        input.delete()
        return output;
    }

    // alignImage = (image : cv.Mat, alignTo: cv.Mat) => {
    //     //TODO
    //     return image
    // }
}
