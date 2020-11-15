import { BinaryEncoder } from "./BinaryEncoder"
import { BalancedEncoder } from "./BalancedEncoder"

export enum EncoderType {
    Binary = 'Binary',
    Balanced = 'Balanced'
}

export const encoderFactory = (type: EncoderType, numPixels: number) => {
    switch (type) {
        case EncoderType.Balanced:
            return new BalancedEncoder(numPixels)
        case EncoderType.Binary:
        default:
            return new BinaryEncoder(numPixels)
    }
}