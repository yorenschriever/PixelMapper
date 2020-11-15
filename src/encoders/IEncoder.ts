
export interface IEncoder {
    Encode(index: number): number
    Decode(code: number): number | undefined
    GetCodeLength(): number //get the length (in bits) if the codes
    GetHighestCode(): number //the highest code it will ever generate. this is user for early exit of the decode worker
}