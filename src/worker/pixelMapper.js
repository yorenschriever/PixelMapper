import simpleBlobDetector from "./simpleBlobDetector"
import cv from "./opencv"
import { encoderFactory } from "../encoders/encoderFactory"
export class PixelMapper {
    codedImage = []
    codedImageNegative = []
    startImage
    encoder
    initialized = false

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
        console.log('Pixelmapper constructor')
    }

    init = (whiteImage, blackImage, sliceImages, numPixels, encoderType) => {
        this.initialized = true

        console.log('initializing mapper', { numPixels, encoderType })
        this.sendStatus('Initializing')

        this.encoder = encoderFactory(encoderType, numPixels)

        this.numPixels = numPixels
        this.numSlices = sliceImages.length

        if (this.numSlices !== this.encoder.GetCodeLength())
            throw Error('number of images does not match encoder code length')

        let preparedBlackImage = undefined;
        if (blackImage) {
            this.sendStatus('Preparing black image')
            preparedBlackImage = this.prepareImage(blackImage, undefined, undefined, false)
        }

        this.sendStatus('Preparing start image')
        this.startImage = this.prepareImage(whiteImage, preparedBlackImage, undefined, true)

        this.sendStatus('Processing slice images')
        this.codedImage = []
        this.codedImageNegative = []
        sliceImages.forEach(image => {
            const prepared = this.prepareImage(image, preparedBlackImage, this.startImage, true)
            this.codedImage.push(prepared)
            this.codedImageNegative.push(this.invertColors(prepared))
        })

        //this.debug(whiteImage,'neg 0')

        blackImage.delete()
        whiteImage.delete()
        sliceImages.forEach(i => i.delete())
        preparedBlackImage.delete()

    }

    run = () => {
        this.sendStatus('Decoding positions')
        this.decodeRecursive(this.startImage, 0, this.numSlices)

        this.listener({
            type: 'DONE',
        })
    }

    clean = () => {
        this.startImage.delete()
        this.codedImage.forEach(i => i.delete())
        this.codedImageNegative.forEach(i => i.delete())
        this.initialized = false;
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
            const index = this.encoder.Decode(code)
            if (index !== undefined && index >= 0 && index < this.numPixels)
                this.detectSinglePixel(cumuMat, index, code)

        } else {
            const pos = new cv.Mat(cumuMat.size(), cv.CV_32F)
            const neg = new cv.Mat(cumuMat.size(), cv.CV_32F)

            cv.multiply(cumuMat, this.codedImage[depth - 1], pos)
            cv.multiply(cumuMat, this.codedImageNegative[depth - 1], neg)

            //We know the highest code we are looking for, and this recursive
            //mechanism work in such a way that it solves  all 
            //codes from low to high. If we are already past the highest code 
            //we dont have to look further
            if (code << 1 <= this.encoder.GetHighestCode()) {
                this.decodeRecursive(neg, code << 1, depth - 1)
                this.decodeRecursive(pos, code << 1 | 1, depth - 1)
            }

            pos.delete()
            neg.delete()
        }
    }

    detectParams = {
        thresholdStep: 64,
        minThreshold: 64,
        maxThreshold: 255,
        minDistBetweenBlobs: 10,
        filterByColor: false,
        filterByArea: false,
        filterByInertia: false,
        filterByConvexity: false,
        minRepeatability: 1,
        minArea: 2,
        maxArea: 500,
        faster: true
    }

    detectSinglePixel = (mat, index, code) => {

        const maxBrightness = cv.minMaxLoc(mat).maxVal
        //use converTo te rescale the result to a 0-1 range
        mat.convertTo(mat, cv.CV_32FC1, 1.0 / maxBrightness);

        const keypoints = simpleBlobDetector(mat, this.detectParams)

        const positions = keypoints.map(kp => ({
            x: kp.pt.x,
            y: kp.pt.y,
            size: kp.size,
            intensity: mat.floatAt(Math.round(kp.pt.y), Math.round(kp.pt.x)) * maxBrightness
        }))
        positions.sort((a, b) => b.intensity - a.intensity)

        //images with fewer matches turn out to be higher quality. increate the confidence a bit
        if (positions.length <= 3) positions.forEach(i=>i.intensity = Math.min(1, i.intensity*2));
        //images with one 1 match are likely a valid match, but at low intensity lighting. increase the confidence again
        if (positions.length == 1) positions.forEach(i=>i.intensity = Math.min(1, i.intensity*2));

        const bestCandidate = (positions && positions[0] && positions[0].intensity >= 0.01) ? positions[0] : undefined

        const msg = {
            type: 'PIXELRESULT',
            index,
            code,
            isLocated: positions.length > 0,
            position: bestCandidate,
            alternativePositions: positions
        }

        this.listener(msg)
    }

    recalculate = (code, index) => {
        const cumuMat = this.startImage.clone()
        for (let i = 0; i < this.numSlices; i++) {
            const sliceValue = (code >> i) & 1;
            if (sliceValue)
                cv.multiply(cumuMat, this.codedImage[i], cumuMat)
            else
                cv.multiply(cumuMat, this.codedImageNegative[i], cumuMat)
        }

        const maxBrightness = cv.minMaxLoc(cumuMat).maxVal
        //use convertTo te rescale the result to a 0-1 range
        cumuMat.convertTo(cumuMat, cv.CV_32FC1, 1.0 / maxBrightness);

        this.listener({
            type: 'RECALCULATEIMG',
            img: cumuMat,
            code,
            index
        })

        cumuMat.delete();
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

    prepareImage = (input, blackImage, startImage, rescale = false) => {
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
            //if (startImage==undefined)
            cv.divide(mat, cv.Mat.ones(mat.size(), cv.CV_32F), mat, 1 / 256)
        //else
        //we divide the coded images by the white image, so all pixels are now individually scaled
        //in on a range 0-1 where 0 is the blackimage value and 1 the whiteimage value.
        //this helps when pixels are partly hidden or facing the other way
        //    cv.divide(mat, startImage, mat, 1 / 256)

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
