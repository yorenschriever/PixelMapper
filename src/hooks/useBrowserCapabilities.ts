import { useEffect, useMemo, useState } from "react";

export const useBrowserCapabilities = () => {

    const [camera, setCamera] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        try {
            navigator.mediaDevices.enumerateDevices().then(
                devices => setCamera(devices.some(
                    device => device.kind === "videoinput")
                )
            ).catch(()=>setCamera(false))
        } catch {
            setCamera(false)
        }
    }, [])


    const [ble, setBle] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        try {
            navigator.bluetooth.getAvailability().then(setBle);
            if ('onavailabilitychanged' in navigator.bluetooth)
                navigator.bluetooth.addEventListener('availabilitychanged', (event: any) => setBle(event.value));
        } catch {
            setBle(false)
        }
    }, [])

    const websocket = 'WebSocket' in window || 'MozWebSocket' in window;

    let wasm = useMemo(() => {
        try {
            if (typeof WebAssembly === "object"
                && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {
            return false
        }
    }, []);

    const worker = !!window.Worker;

    return { camera, ble, websocket, worker, wasm }
}
