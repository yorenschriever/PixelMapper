import React, { ReactNode } from "react"
import { ActiveStep, addImages, setStep } from "../redux"
import { useDispatch } from 'react-redux'
import { setPreview } from "../redux/process"
import { filenameToCompressedImage } from "../imageUtils"

export const LoadTestsetButton = ({ children }: { children: ReactNode }) => {
    const dispatch = useDispatch()

    const loadTestSet = async () => {
        dispatch(addImages(
            await filenameToCompressedImage("testset/img9749.jpg"),
            await filenameToCompressedImage("testset/img9750.jpg"),
            await Promise.all([
                filenameToCompressedImage("testset/img9751.jpg"),
                filenameToCompressedImage("testset/img9752.jpg"),
                filenameToCompressedImage("testset/img9753.jpg"),
                filenameToCompressedImage("testset/img9754.jpg"),
                filenameToCompressedImage("testset/img9755.jpg"),
                filenameToCompressedImage("testset/img9756.jpg"),
            ])
        ))

        dispatch(setPreview(await filenameToCompressedImage("testset/img9749.jpg")))
        dispatch(setStep(ActiveStep.Process))
    }

    return <button onClick={loadTestSet}>{children}</button>
}
