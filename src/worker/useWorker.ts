let worker: Worker | undefined = undefined;

export const useWorker = () => {
    try {
        if (!worker)
            worker = new Worker('../worker/pixelMapper.worker.ts', { type: 'module' })
        return worker;
    } catch {
        return undefined
    }
}