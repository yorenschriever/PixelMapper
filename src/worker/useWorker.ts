let worker: Worker | undefined = undefined;

export const useWorker = () => {
    try {
        if (!worker)
            worker = new Worker(new URL('../worker/pixelMapper.worker.ts', import.meta.url));
        return worker;
    } catch {
        return undefined
    }
}