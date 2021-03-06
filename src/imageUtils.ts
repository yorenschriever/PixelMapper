import { CompressedImage, Position } from "./entities";


export const canvasToCompressedImage = (canvas: HTMLCanvasElement): CompressedImage => {
    return {
        width: canvas.width,
        height: canvas.height,
        data: canvas.toDataURL("image/png")
    }
}

export const filenameToCompressedImage = (filename: string): Promise<CompressedImage> => {
    return new Promise(acc => {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d')!;
        var img = new Image();

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height
            ctx.drawImage(img, 0, 0, img.width, img.height)
            acc({
                width: canvas.width,
                height: canvas.height,
                data: canvas.toDataURL("image/png")
            })
        }

        img.src = filename;
    })
}

export const compressedImageToCanvas = (image: CompressedImage, canvas: HTMLCanvasElement): Promise<void> => {
    return new Promise(acc => {

        var ctx = canvas.getContext('2d')!;
        var img = new Image();

        img.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height
            ctx.drawImage(img, 0, 0, image.width, image.height)
            acc()
        }

        img.width = image.width;
        img.height = image.height;
        img.src = image.data;

    })
}

export const imageDataTocanvas = (image: ImageData, canvas: HTMLCanvasElement) => {
    var c = canvas;
    c.width = image.width
    c.height = image.height
    var ctx = c.getContext("2d")!;
    ctx.putImageData(image, 0, 0)
}

export const compressedImageToImageData = (image: CompressedImage): Promise<ImageData> => {
    return new Promise(acc => {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d')!;
        var img = new Image();

        img.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height
            ctx.drawImage(img, 0, 0, image.width, image.height)
            const imageData = ctx.getImageData(0, 0, img.width, img.height)
            acc(imageData)
        }

        img.width = image.width;
        img.height = image.height;
        img.src = image.data;

    })
}

//todo replace with videoToCompressedImage and store compressed images everywhere
export const videoToImageData = (video: HTMLVideoElement, w: number, h: number): ImageData => {
    const canvas = document.createElement("canvas")
    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D

    canvas.width = w
    canvas.height = h

    canvasContext.drawImage(video, 0, 0, w, h);
    return canvasContext.getImageData(0, 0, w, h)
}

export const videoToCompressedImage = (video: HTMLVideoElement, w: number, h: number): CompressedImage => {
    const canvas = document.createElement("canvas")
    const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D

    canvas.width = w
    canvas.height = h

    canvasContext.drawImage(video, 0, 0, w, h);
    return {
        width: canvas.width,
        height: canvas.height,
        data: canvas.toDataURL("image/png")
    }
}

const drawCircle = (context: CanvasRenderingContext2D, position: Position, type: DrawPixelType) => {
    context.beginPath();
    context.arc(position.x, position.y, 15, 0, 2 * Math.PI, false);
    context.lineWidth = [2, 6, 2, 2, 2][type];
    context.setLineDash([]);
    context.strokeStyle = ['#00ff00', '#00ffff', '#0000ff', '#ff0000', '#ffaa00'][type];
    context.stroke();
}

export enum DrawPixelType {
    Normal,
    Highlight,
    Alternative,
    Missing,
    LowConfidence
}

export const drawPosition = (context: CanvasRenderingContext2D, position: Position, label: string, type: DrawPixelType) => {
    if (!position) {
        console.error('cannot draw position:')
        return
    }

    drawCircle(context, position, type)

    const txtx = position.x
    const txty = position.y + 30
    context.textAlign = 'center'
    context.font = '24px Sans-serif';
    context.strokeStyle = 'black';
    context.lineWidth = 6;
    context.strokeText(label, txtx, txty);
    context.fillStyle = 'white';
    context.fillText(label, txtx, txty);
}

export const connectPositions = (context: CanvasRenderingContext2D, position1: Position, position2: Position, type: DrawPixelType) => {
    context.strokeStyle = ['green', 'green', 'blue', 'red', 'green'][type];
    context.lineWidth = [2, 2, 2, 4][type];
    context.setLineDash([[], [], [], [15, 5]][type]);
    context.beginPath();
    context.moveTo(position1.x, position1.y);
    context.lineTo(position2.x, position2.y);
    context.stroke();
}
