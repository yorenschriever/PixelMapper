import { IEncoder } from "./IEncoder"

/*

This encoder generates codes that are balanced: i.e.: they contain an equal number of
ones and zeroes (on/off leds)

This greatly increases reliability, because:
 - depending on the ligting conditions, a positive image can have a more profound 
effect than a negative, or vice versa. This means that images with a lot of zeros
(or ones) would be weaker, and would easily be confused with mixed codes.

- when using the binary encoding scheme i saw that some pixels had 'number neighbours'
that were also highlighting. say, if 53 was decoded, 61 was also visible in the 
image, and the same was then visible for 54 and 62, and 55 and 63 etc. in other words:
there was a one bit that turned out to be hard to decode. with tihs encoding it is
guaranteed that all codes differ by at least 1 bits (because if you change one bit, 
 another has to change as well to keep things balanced)

*/
export class BalancedEncoder implements IEncoder {
    codeLength: number
    codes: Record<number, number> = {}
    decodes: Record<number, number> = {}

    constructor(private numPixels: number) {
        this.codeLength = this.calcCodeLength()
        this.generateCodes()
    }

    Encode = (i: number) => this.codes[i]
    Decode = (i: number) => this.decodes[i]
    GetCodeLength = () => this.codeLength
    GetHighestCode = () => this.codes[this.numPixels - 1]

    calcCodeLength = () => {
        let length = 2
        while (this.nCr(length, length / 2) < this.numPixels)
            length += 2

        return length
    }

    nCr = (n: number, r: number) => {
        if (n === r)
            return 1;

        r = (r < n - r) ? n - r : r;
        return this.factorialRange(r + 1, n) / this.factorialRange(1, n - r);
    }

    factorialRange = (a: number, b: number) => {
        let prd = a
        let i = a;

        while (i++ < b) {
            prd *= i;
        }

        return prd;
    }

    isBalanced = (n: number) => this.bitCount(n) === this.codeLength / 2

    //count the number of 1 bits
    bitCount = (n: number) => {
        n = n - ((n >> 1) & 0x55555555)
        n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
        return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
    }

    generateCodes = () => {
        let index = 0;
        let code = 0;
        while (index < this.numPixels) {
            if (this.isBalanced(code)) {
                this.codes[index] = code
                this.decodes[code] = index
                index++
            }
            code++;
        }
    }
}