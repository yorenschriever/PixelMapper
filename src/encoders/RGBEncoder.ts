import { IEncoder } from "./IEncoder"

/*

*/
export class RGBEncoder implements IEncoder {
    codeLength: number
    codes: Record<number, number> = {}
    decodes: Record<number, number> = {}

    constructor(private numPixels: number) {
        this.generateCodes()
        this.codeLength = Math.ceil(Math.ceil(Math.log(this.codes[this.numPixels - 1]) / Math.log(2)) / 3) * 3 + 3;
    }

    Encode = (i: number) => this.codes[i]
    GetCodeLength = () => this.codeLength
    GetHighestCode = () => this.codes[this.numPixels - 1]

    Decode = (inCode: number) => {
        let code = inCode.toString(2).padStart(this.codeLength,"0")
        console.log('incode ',code)

        let maxRot = this.codeLength/3
        let rot=0;
        while (!code.startsWith("000") && rot < maxRot){
            code = code.substring(-3) + code.substr(0,-3)
            console.log('rotcode', code)
            rot++;
        }

        console.log('after  ', code, rot)
        if (!code.startsWith("000")){
            console.log('no code')
            return -1;
        }
        
        console.log('outcode',code, parseInt(code,2))
        return parseInt(code,2);
    }

    isValidCode = (code: number) => {
        //a bit primitive for now, but will work for codes < 50 
        if ((code & 7) === 0 || (code & 7) === 7) return false;
        if ((code & (7 << 3)) === 0 || (code & (7 << 3)) === (7 << 3)) return false;
        if ((code & (7 << 6)) === 0 || (code & (7 << 6)) === (7 << 6)) return false;
        return true;
    }

    generateCodes = () => {
        let found = 0;
        let code = 0;
        while (found < this.numPixels) {
            do {
                code++;
            } while (!this.isValidCode(code))

            this.codes[found] = code
            this.decodes[code] = found
            found++
        }
    }
}