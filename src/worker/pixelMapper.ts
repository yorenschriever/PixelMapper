
import { encoderFactory, EncoderType } from "../encoders/encoderFactory"
import { IEncoder } from "../encoders/IEncoder"
import { imageDataFromMat } from "./imageDataFromMat";
import simpleBlobDetector from "./simpleBlobDetector";
import { MessageFromWorkerType } from "./workerMessages";

export class PixelMapper {
    codedImage: cv.Mat[] = []
    codedImageNegative: cv.Mat[] = []
    startImage?: cv.Mat
    encoder?: IEncoder
    initialized: boolean = false

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

    constructor(private callback: ((msg: MessageFromWorkerType) => void)) {
        console.log('Pixelmapper constructor')
    }

    init = (whiteImage: cv.Mat, blackImage: cv.Mat, sliceImages: cv.Mat[], numPixels: number, encoderType: EncoderType, align: boolean) => {
        this.initialized = true

        console.log('initializing mapper', { numPixels, encoderType, align })
        this.sendStatus('Initializing')

        this.encoder = encoderFactory(encoderType, numPixels)

        this.numPixels = numPixels
        this.numSlices = sliceImages.length

        if (this.numSlices !== this.encoder.GetCodeLength())
            throw Error('number of images does not match encoder code length')

        let newSlices : cv.Mat[] = []
        const rgb = true;
        if (rgb) {
            sliceImages.forEach(slice => {
                let channels:cv.Mat[] = [new cv.Mat(), new cv.Mat(), new cv.Mat()]
                cv.split(slice, channels); 
                let minimum = new cv.Mat();
                cv.min(channels[0],channels[1], minimum)
                cv.min(channels[2],minimum,minimum)

                cv.subtract(channels[0],minimum,channels[0])
                cv.subtract(channels[1],minimum,channels[1])
                cv.subtract(channels[2],minimum,channels[2])
                newSlices.push(channels[0])
                newSlices.push(channels[1])
                newSlices.push(channels[2])
                slice.delete();
            })
        } else {
            newSlices = sliceImages
        }


        this.config.align = align || true
        const alignTo = this.config.align ? this.convertColorAndResize(whiteImage) : undefined

        let preparedBlackImage: cv.Mat | undefined = undefined;
        if (blackImage) {
            this.sendStatus('Preparing black image')
            preparedBlackImage = this.prepareImage(blackImage, undefined, alignTo, false)
        }

        this.sendStatus('Preparing start image')
        this.startImage = this.prepareImage(whiteImage, preparedBlackImage, alignTo, true)

        this.sendStatus('Processing slice images')
        this.codedImage = []
        this.codedImageNegative = []
        sliceImages.forEach(image => {
            const prepared = this.prepareImage(image, preparedBlackImage, alignTo, true)
            this.codedImage.push(prepared)
            this.codedImageNegative.push(this.invertColors(prepared))
        })

        //this.debug(whiteImage,'neg 0')

        blackImage.delete()
        whiteImage.delete()
        sliceImages.forEach(i => i.delete())
        preparedBlackImage?.delete()
        alignTo?.delete()

    }

    run = () => {
        if (!this.initialized || !this.startImage)
            throw Error('Must initialize before decoding')

        this.sendStatus('Decoding positions')
        this.decodeRecursive(this.startImage, 0, this.numSlices)

        this.callback({
            type: 'DONE',
        })
    }

    clean = () => {
        this.startImage?.delete()
        this.codedImage.forEach(i => i.delete())
        this.codedImageNegative.forEach(i => i.delete())
        this.initialized = false;
    }

    sendStatus = (msg: string) => {
        console.log(msg)
        this.callback({
            type: 'STATUS',
            msg
        })
    }

    decodeRecursive = (cumuMat: cv.Mat, code: number, depth: number) => {
        if (depth === 0) {
            //depth counts down, so the last multiplication step was reached
            const index = this.encoder!.Decode(code)
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
            if (code << 1 <= this.encoder!.GetHighestCode()) {
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

    detectSinglePixel = (mat: cv.Mat, index: number, code: number) => {
        const maxBrightness = cv.minMaxLoc(mat).maxVal
        //use converTo te rescale the result to a 0-1 range
        mat.convertTo(mat, cv.CV_32FC1, 1.0 / maxBrightness);

        const keypoints = simpleBlobDetector(mat, this.detectParams)
        const positions = keypoints.map(kp => ({
            x: kp.pt.x,
            y: kp.pt.y,
            size: kp.size,
            confidence: mat.floatAt(Math.round(kp.pt.y), Math.round(kp.pt.x)) * maxBrightness
        }))
        positions.sort((a, b) => b.confidence - a.confidence)

        //images with fewer matches turn out to be higher quality. increate the confidence a bit
        if (positions.length <= 3) positions.forEach(i => i.confidence = Math.min(1, i.confidence * 2));
        //images with one 1 match are likely a valid match, but at low intensity lighting. increase the confidence again
        if (positions.length == 1) positions.forEach(i => i.confidence = Math.min(1, i.confidence * 2));

        const bestCandidate = (positions && positions[0] && positions[0].confidence >= 0.01) ? positions[0] : undefined

        this.callback({
            type: 'PIXELRESULT',
            index,
            code,
            position: bestCandidate,
            alternativePositions: positions
        })
    }

    recalculate = (code: number, index: number) => {
        if (!this.initialized || !this.startImage)
            return;

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

        this.callback({
            type: 'RECALCULATEIMG',
            img: imageDataFromMat(cumuMat),
            code,
            index
        })

        cumuMat.delete();
    }

    debug = (img: cv.Mat, msg: string) => {
        this.callback({
            type: 'DEBUGIMG',
            img: imageDataFromMat(img),
            msg
        })
    }

    invertColors = (pos: cv.Mat) => {
        let neg = cv.Mat.ones(pos.size(), cv.CV_32F)
        cv.subtract(neg, pos, neg)
        return neg;
    }

    convertColor = (input: cv.Mat) => {
        let mat = new cv.Mat(input.size(), cv.CV_32F)
        input.convertTo(mat, cv.CV_32F)
        cv.cvtColor(mat, mat, cv.COLOR_RGB2GRAY)
        return mat
    }

    rescaleSize = (input: cv.Mat) => {
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

    convertColorAndResize = (alignTo: cv.Mat) => this.rescaleSize(this.convertColor(alignTo))

    prepareImage = (input: cv.Mat, blackImage?: cv.Mat, alignTo?: cv.Mat, rescale = false) => {
        //create our working matrix mat, and load the input image in the correct color space
        let mat = this.convertColorAndResize(input)

        if (this.config.align && alignTo)
            //align the images to the blackimage to compensate for camera shake.
            //this doesnt work well. use a tripod.
            mat = this.alignImage(mat, alignTo)

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
            //increase contrast, because otherwise we will have low values after black is subtracted
            mat.convertTo(mat, -1, 2.2, -0.25)

            //constrain new values between 0-1
            cv.max(mat, cv.Mat.zeros(mat.size(), cv.CV_32F), mat)
            cv.min(mat, cv.Mat.ones(mat.size(), cv.CV_32F), mat)
        }

        return mat
    }

    convertColorForAlign = (input: cv.Mat) => {
        let mat = new cv.Mat(input.size(), cv.CV_8U)
        input.convertTo(mat, cv.CV_8U)
        return mat
    }

    teller:number = 0;
    alignImage = (slice: cv.Mat, white: cv.Mat) => {

        const sliceImg = this.convertColorForAlign(slice)
        const whiteImg = this.convertColorForAlign(white)

        //look for good feates to track in the slice image.
        //Try to track the position relative to the white image
        //I do it this way around, because if lit leds are 
        //tracked as feature, i know that all slice leds will be on
        //on the white image as well. The other way round that is
        //not guaranteed
        let slicePts = new cv.Mat();
        let mask = new cv.Mat()
        //cv.goodFeaturesToTrack(sliceImg, slicePts, 400, 0.0001, 15, mask, 3, 0.05);
        cv.goodFeaturesToTrack(sliceImg, slicePts, 200, 0.01, 30, mask, 3, 3);

        //Look for the same features in the white image
        let whitePts = new cv.Mat()
        let status = new cv.Mat()
        let err = new cv.Mat()
        cv.calcOpticalFlowPyrLK(sliceImg, whiteImg, slicePts, whitePts, status, err, new cv.Size(21,21), 3) //,3, new cv.TermCriteria(),cv.OPTFLOW_LK_GET_MIN_EIGENVALS, 1)

        let filteredlength = status.data8S.reduce((a,b)=>a+b,0)
        console.log({filteredlength}, status.rows)

        //let fwhitePts = whitePts
        //let fslicePts = slicePts     
        //status.data8S[0] = 1

        let features : FeatureMatch[] = []
        for (let i=0; i<status.rows; i++)
        {
            const wp = new cv.Point(whitePts.data32F[i*2],whitePts.data32F[i*2+1])
            const sp  = new cv.Point(slicePts.data32F[i*2],slicePts.data32F[i*2+1])
            features.push({
                whitePoint: wp,
                slicePoint: sp,
                status: status.data8S[i] === 1,
                error: err.data32F[i],
                distance: Math.sqrt(Math.pow(wp.x-sp.x,2) + Math.pow(wp.y-sp.y,2) )
            })
        }

        const calcmean = (n:number[]) => n.reduce((a,b) => a+b,0) / n.length
        const calcstd = (n:number[], mean:number) => Math.sqrt( n.reduce((acc,m) => acc + Math.pow(m-mean,2),0) / n.length )

        const prefiltered = features.filter(i=>i.status)
        const meanDistance = calcmean(prefiltered.map(i=>i.distance))
        const stdDistance = calcstd(prefiltered.map(i=>i.distance),meanDistance)

        const meanError = calcmean(prefiltered.map(i=>i.error))
        const stdError = calcstd(prefiltered.map(i=>i.error),meanDistance)

        const minAllowedDistance = meanDistance-stdDistance
        const maxAllowedDistance = meanDistance+2*stdDistance

        console.log({meanDistance,stdDistance, minAllowedDistance,maxAllowedDistance})
        console.log({prefiltered})

        //let filteredFeatures = prefiltered.filter(ft => ft.distance >= minAllowedDistance && ft.distance <= maxAllowedDistance)
        //let filteredFeatures = prefiltered.filter(ft => ft.distance <= maxAllowedDistance)
        //let filteredFeatures = prefiltered.filter(ft => ft.distance <= meanDistance)
        //let filteredFeatures = prefiltered
        //let filteredFeatures = prefiltered.filter(ft => ft.error <= meanError)
        //let filteredFeatures = prefiltered.filter(ft => ft.error <= meanError) // && ft.distance <= maxAllowedDistance)
        
        //throw out outliers, keep the best 75%
        let filteredFeatures = prefiltered.sort((a,b)=>a.error-b.error).slice(0,prefiltered.length * 0.75)
        //throuw out ones with an unlikely distance
        filteredFeatures = filteredFeatures.filter(ft => ft.distance <= maxAllowedDistance)

        console.log({features,filteredFeatures, meanError})

        if (filteredFeatures.length==0)
            return slice

        const fwhitePts = new cv.Mat(filteredFeatures.length,1,whitePts.type())
        const fslicePts = new cv.Mat(filteredFeatures.length,1,slicePts.type())        
        filteredFeatures.forEach((fft,index) => {
            fwhitePts.data32F[index*2] = fft.whitePoint.x;
            fwhitePts.data32F[index*2+1] = fft.whitePoint.y;

            fslicePts.data32F[index*2] = fft.slicePoint.x;
            fslicePts.data32F[index*2+1] = fft.slicePoint.y;
        })


        // let jsSlicePts : cv.Point[]=[]
        // let jsWhitePts : cv.Point[]=[]

        // const fwhitePts = new cv.Mat(filteredlength,1,whitePts.type())
        // const fslicePts = new cv.Mat(filteredlength,1,slicePts.type())
        // for (let i=0; i<status.rows; i++)
        // {
        //     const copyFromIndex = i
        //     const copyToIndex = status.data8S.slice(0,i).reduce((a,b)=>a+b,0)

        //     if (status.data8S[copyFromIndex] !== 1)
        //         continue;

        //     jsSlicePts.push(new cv.Point(slicePts.data32F[copyFromIndex*2],slicePts.data32F[copyFromIndex*2+1]))
        //     jsWhitePts.push(new cv.Point(whitePts.data32F[copyFromIndex*2],whitePts.data32F[copyFromIndex*2+1]))

        //     fwhitePts.data32F[copyToIndex*2] = whitePts.data32F[copyFromIndex*2];
        //     fwhitePts.data32F[copyToIndex*2+1] = whitePts.data32F[copyFromIndex*2+1];

        //     fslicePts.data32F[copyToIndex*2] = slicePts.data32F[copyFromIndex*2];
        //     fslicePts.data32F[copyToIndex*2+1] = slicePts.data32F[copyFromIndex*2+1];
        // }

        
        console.log({fwhitePts,fslicePts,whitePts,slicePts}, this.teller+1)

        if (this.teller+1 == 4){
        console.log('status',status.data8S)
        console.log('error',err.data32F)
        console.log('white',whitePts.data32F, fwhitePts.data32F)
        console.log('slice',slicePts.data32F, fslicePts.data32F)
        }


        //calculate the required transformation
        const M = cv.estimateRigidTransform(fslicePts, fwhitePts, false) //true?

        if (M.empty()) {
            console.error("unable to align image")
            return slice
        }

        //Apply the transformation to the slice image
        let result = new cv.Mat()
        cv.warpAffine(slice, result, M, slice.size(), 0, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 1))

        console.log('Aligned image',M)
        //this.debugAlignment(slice,white,result, features, filteredFeatures)

        mask.delete()
        status.delete()
        //err.delete()
        //whitePts.delete()
        //fwhitePts.delete()
        //slicePts.delete()
        //fslicePts.delete()
        sliceImg.delete()
        whiteImg.delete()
        slice.delete()
        M.delete()

        return result;
    }

    debugAlignment = (slice: cv.Mat, white: cv.Mat, result: cv.Mat, features:FeatureMatch[], filteredFeatures:FeatureMatch[]) => {
        let testImg = new cv.Mat(slice.size(), slice.type())
        
        const col = [255,255,255,255]
        let whiteclone = white.clone()
        let sliceclone = slice.clone();
        filteredFeatures.forEach(ft => cv.circle(sliceclone,ft.slicePoint,5,col,2,1))
        filteredFeatures.forEach(ft => cv.circle(whiteclone,ft.whitePoint,5,col,2,1))
        filteredFeatures.forEach(ft => cv.line(sliceclone,ft.whitePoint,ft.slicePoint,col,2))
        filteredFeatures.forEach(ft => cv.putText(whiteclone,Math.round(ft.error*10).toString(),ft.slicePoint,0,0.5,col,1))

        let vec = new cv.MatVector()
        vec.push_back(result)
        vec.push_back(whiteclone)
        vec.push_back(sliceclone)
        
        
        cv.merge(vec, testImg)
        const img = new cv.Mat()
        testImg.convertTo(img, cv.CV_8U, 1, 0)
        //this.debug(img, "aligned image: R = input, G = align target, B = aligned")
        this.debug(img, `R = aligned result, G = align target white, B = input slice\npoints:${filteredFeatures.length}`)
        whiteclone.delete();
        sliceclone.delete();

    }
}

type FeatureMatch = {
    whitePoint: cv.Point
    slicePoint: cv.Point
    distance: number
    status: boolean
    error: number
}