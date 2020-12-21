import { BinaryEncoder } from "./BinaryEncoder"
import { BalancedEncoder } from "./BalancedEncoder"
import { RGBEncoder } from "./RGBEncoder"

export enum EncoderType {
    Binary = 'Binary',
    Balanced = 'Balanced',
    RGB = 'RGB'
}

export const encoderFactory = (type: EncoderType, numPixels: number) => {
    switch (type) {
        case EncoderType.Balanced:
            return new BalancedEncoder(numPixels)
        case EncoderType.RGB:
            return new RGBEncoder(numPixels)
        case EncoderType.Binary:
        default:
            return new BinaryEncoder(numPixels)
    }
}