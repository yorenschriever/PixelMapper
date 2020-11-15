import { EncoderType } from "./encoders/encoderFactory";
import { Device } from "./entities";
import { compressedImageToImageData } from "./imageUtils";
import { CaptureState } from "./redux";

export const deviceHash = (device:Device) => device.hostname //+device.port

export const createRunMessage = async (
    capture: CaptureState,
    numPixels: number,
    encoderType: EncoderType,
    type: "RUN" | "INITONLY") =>  {

    return {
        type,
        whiteImage: await compressedImageToImageData(capture.whiteImage!),
        blackImage: await compressedImageToImageData(capture.blackImage!),
        sliceImages: await Promise.all(capture.images.map(i => compressedImageToImageData(i))),
        numPixels,
        encoderType
    }   
}