import { EncoderType } from "./encoders/encoderFactory";
import { Device } from "./entities";
import { compressedImageToImageData } from "./imageUtils";
import { CaptureState } from "./redux";
import { MessageToWorkerType } from "./worker/workerMessages";

export const deviceHash = (device:Device) => device.hostname //+device.port

export const createRunMessage = async (
    capture: CaptureState,
    numPixels: number,
    encoderType: EncoderType,
    align: boolean,
    type: "RUN" | "INITONLY") =>  {

    let result : MessageToWorkerType = {
        type,
        whiteImage: await compressedImageToImageData(capture.whiteImage!),
        blackImage: await compressedImageToImageData(capture.blackImage!),
        sliceImages: await Promise.all(capture.images.map(i => compressedImageToImageData(i))),
        numPixels,
        encoderType,
        align
    } 
    return result;
}