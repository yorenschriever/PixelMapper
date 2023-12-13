
/* eslint-disable no-restricted-globals */

import { PixelMapper } from "./pixelMapper";
import { imageDataFromMat } from "./imageDataFromMat";
import { MessageFromWorkerType, MessageToWorkerType } from "./workerMessages";

const ctx = self as any;
ctx.importScripts(`opencv_js.js`);

//@ts-ignore
cv = (await cv());

const postMessage = (msg: MessageFromWorkerType) => ctx.postMessage(msg);

const pixelMapper = new PixelMapper(postMessage)

ctx.addEventListener("message", (event:MessageEvent<MessageToWorkerType>) => { 
    const body = event.data
    switch (body.type) {
        case "RUN":
            pixelMapper.init(
                cv.matFromImageData(body.whiteImage),
                cv.matFromImageData(body.blackImage),
                body.sliceImages.map((image:ImageData) => cv.matFromImageData(image)),
                body.numPixels,
                body.encoderType
            )
            pixelMapper.run()
            break;
        case "RECALCULATE":
            pixelMapper.recalculate(body.code, body.index)
            break;
        case "CLEAN":
            pixelMapper.clean()
            break;
        case "ISINITIALIZEDREQUEST":
            postMessage({ type: 'ISINITIALIZEDRESPONSE', initialized: pixelMapper.initialized })
            break;
        case "INITONLY":
            pixelMapper.init(
                cv.matFromImageData(body.whiteImage),
                cv.matFromImageData(body.blackImage),
                body.sliceImages.map((image:ImageData) => cv.matFromImageData(image)),
                body.numPixels,
                body.encoderType
            )
            break;
        case "EXPOSUREIMG":
            const img = 
                pixelMapper.calculateDifference(
                    cv.matFromImageData(body.imageA), 
                    cv.matFromImageData(body.imageB)
                )
            postMessage({
                type: 'EXPOSURERESULT',
                img: imageDataFromMat(img)
            })
            img.delete();
            break;
        default:
            break;
    }

});
