import { IEncoder } from "./IEncoder"
/*

This encoder is the most trivial one: it used the index as the code

*/
export class BinaryEncoder implements IEncoder {
    codeLength: number

    constructor(private numPixels: number) {
        this.codeLength = Math.ceil(Math.log(this.numPixels) / Math.log(2))
    }

    Encode = (i: number) => i
    Decode = (i: number) => {
        if (i < 0 || i >= this.numPixels)
            return undefined
        return i
    }

    GetCodeLength = () => this.codeLength
    GetHighestCode = () => this.numPixels
}