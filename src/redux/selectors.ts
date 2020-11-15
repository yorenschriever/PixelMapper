import { State } from "./"
import { EncoderType } from "../encoders/encoderFactory"

export const numPixelsSelector = (state: State) => state.devicesReducer.devices.map(d => d.pixelCount).reduce((a, b) => a + b)

export const encoderTypeSelector: ((state: State) => EncoderType) = state => (state.captureReducer.encoderType || EncoderType.Binary) as EncoderType