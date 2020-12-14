
/* eslint-disable no-restricted-globals */

import { PixelMapper } from "./pixelMapper";
import { MessageFromWorkerType, MessageToWorkerType } from "./workerMessages";

const ctx = self as any;
ctx.importScripts(`${process.env.PUBLIC_URL}/opencv.js`);
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
                body.encoderType,
                body.align
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
                body.encoderType,
                body.align
            )
            break;
        default:
            break;
    }

});
