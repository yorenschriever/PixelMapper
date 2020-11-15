
const worker = new Worker('../worker/pixelMapper.worker.js', { type: 'module' })

export const useWorker = () => worker