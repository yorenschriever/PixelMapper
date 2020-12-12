import useSwitch from "@react-hook/switch"
import { useEffect, useState } from "react"

const useSensor = (type: "LinearAccelerationSensor"|"Gyroscope", thresold: number) => {
    const [sensorAvailable , setSensorAvailable] = useState<boolean>()
    const [isMovingNow,setIsMovingNow] = useState<boolean>()
    const [hasMoved,setHasMoved] = useSwitch()

    useEffect(() => {
        let sensor : Gyroscope | LinearAccelerationSensor | undefined
        switch (type){
            case "LinearAccelerationSensor":
                sensor = new LinearAccelerationSensor({frequency: 60});
                break;
            case "Gyroscope":
                sensor = new Gyroscope({frequency:60})
                break;
            default:
        }
        if (!sensor){
            setSensorAvailable(false)
            return
        }

        const listener = () => {
            const moving = (sensor?.x ??0) > thresold || (sensor?.y??0) > thresold || (sensor?.z??0) > thresold
            setSensorAvailable(true)
            setIsMovingNow(moving)
            if (moving) setHasMoved.on();
        }

        sensor.addEventListener('reading', listener)
        sensor.start()
        return () => {
            sensor?.stop()
            sensor?.removeEventListener('reading',listener)
        }
    },[setSensorAvailable, setIsMovingNow, setHasMoved, thresold, type])

    return {
        sensorAvailable,
        isMovingNow,
        hasMoved,
        resetHasMoved: setHasMoved.off
    }
}

const useDebounce = (value:boolean, delay: number, debounceRisingEdge = true, debounceFallingEdge=true) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    if (debounceRisingEdge === false && value && !debouncedValue) setDebouncedValue(true)
    if (debounceFallingEdge === false && !value && debouncedValue) setDebouncedValue(false)

    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler);};
      },
      [value, delay])
    return debouncedValue
}

export const useMovementDetection = () => {

    const acc = useSensor("LinearAccelerationSensor",0.15)
    const gyro = useSensor("Gyroscope",0.15)

    const isMovingNow = useDebounce(Boolean(acc.isMovingNow || gyro.isMovingNow), 1000, false)

    return {
        sensorAvailable: acc.sensorAvailable || gyro.sensorAvailable,
        isMovingNow,
        hasMoved: acc.hasMoved || gyro.hasMoved,
        resetHasMoved: () => {
            acc.resetHasMoved();
            gyro.resetHasMoved();
        }
    }
}