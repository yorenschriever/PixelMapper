declare namespace cv {

  // Scalar, Point, Rect, etc are defined by opencv.js (helpers.js) and we need to  them manually:

  class Range {
    public start: number
    public end: number
    public constructor(start: number, end: number)
  }

  class Scalar extends Array<number> {
    public static all(...v: number[]): Scalar;
  }
  // // Hack: expose Mat super classes like Mat_, InputArray, Vector, OutputArray we make them alias of Mat to simplify and make it work
  //  { Mat as InputArray, Mat as InputArrayOfArrays, Mat as InputOutputArray, Mat as InputOutputArrayOfArrays, Mat as MatVector, Mat as OutputArray, Mat as OutputArrayOfArrays } from './Mat'
  //  { Scalar as GScalar }
  //  { Point as Point2f }
  //  { Point as KeyPoint }
  //  { Point as Point2l }
  //  { Size as Point2d }
  //  { Size as Size2d }
  //  { Size as Size2f }
  //  { Size as Size2l }
  //  { Rect as Rect_ }

  type InputArray = Mat
  type InputArrayOfArrays = Mat
  type InputOutputArray = Mat
  type InputOutputArrayOfArrays = Mat
  //type MatVector = Mat
  type OutputArray = Mat
  type OutputArrayOfArra = Matys


  type GScalar = Scalar;
  type Point2f = Point;
  type KeyPoint = Point;
  type Point2l = Point;
  type Point2d = Size;
  type Size2d = Size;
  type Size2f = Size;
  type Size2l = Size;
  type Rect_ = Rect;


  class MatVector{
    delete(): void
    get(i: number): T
    get(i: number, j: number, data: any): T
    set(i: number, t: T): void
    put(i: number, j: number, data: any): any
    size(): number
    push_back(n: T): any
    resize(count: number, value?: T): void
    delete(): void
  }

  class Point {
    public constructor(x: number, y: number);
    public x: number;
    public y: number;
  }

  class Size {
    public constructor(width: number, height: number);
    public width: number;
    public height: number;
  }


  class Rect {
    public constructor();
    public constructor(point: Point, size: Size);
    public constructor(x: number, y: number, width: number, height: number);
    public x: number;
    public y: number;
    public width: number;
    public height: number;
  }


  class TermCriteria {
    public type: number
    public maxCount: number
    public epsilon: number
    public constructor()
    public constructor(type: number, maxCount: number, epsilon: number)
  }
  const TermCriteria_EPS: any
  const TermCriteria_COUNT: any
  const TermCriteria_MAX_ITER: any

  class MinMaxLoc {
    public minVal: number
    public maxVal: number
    public minLoc: Point
    public maxLoc: Point
    public constructor()
    public constructor(minVal: number, maxVal: number, minLoc: Point, maxLoc: Point)
  }

  function minMaxLoc(mat:Mat): MinMaxLoc
  function merge(channels: MatVector, result:Mat): void

  // expose emscripten / opencv.js specifics

  function exceptionFromPtr(err: number): any
  function onRuntimeInitialized(): any
  function FS_createDataFile(arg0: string, path: string, data: Uint8Array, arg3: boolean, arg4: boolean, arg5: boolean): any

  //import { Algorithm, LineTypes, Mat, NormTypes, RotatedRect } from '.'
  //import '../_cv'

  /**
   * Base class for Contrast Limited Adaptive Histogram Equalization.
   */
  class CLAHE extends Algorithm {
    /**
     * @param clipLimit Threshold for contrast limiting. Default.  40.0,
     * @param totalGridSize Size of grid for histogram equalization. Input image will be divided into equally sized rectangular tiles. tileGridSize defines the number of tiles in row and column. Default: Size(8, 8) 
     */
    constructor(clipLimit?: double, totalGridSize?: Size)
    /**
     * Equalizes the histogram of a grayscale image using Contrast Limited Adaptive Histogram Equalization.
     * @param src Source image of type CV_8UC1 or CV_16UC1.
     * @param dst Destination image.
     */
    apply(src: Mat, dst: Mat): void
    collectGarbage(): void
    /**
     * Returns threshold value for contrast limiting.
     */
    getClipLimit(): double
    /**
     * Returns Size defines the number of tiles in row and column.
     */
    getTilesGridSize(): Size
    /**
     * Sets threshold for contrast limiting.
     */
    setClipLimit(clipLimit: double): void
    /**
     * Sets size of grid for histogram equalization. Input image will be divided into equally sized rectangular tiles.
     * @param tileGridSize defines the number of tiles in row and column.
     */
    setTilesGridSize(tileGridSize: Size): void

  }


  // emscripten embind internals
  function getInheritedInstanceCount(...a: any[]): any
  function getLiveInheritedInstances(...a: any[]): any
  function flushPendingDeletes(...a: any[]): any
  function setDelayFunction(...a: any[]): any
  class EmscriptenEmbindInstance {
    isAliasOf(...a: any[]): any
    clone(...a: any[]): any
    delete(...a: any[]): any
    isDeleted(...a: any[]): any
    deleteLater(...a: any[]): any
  }
  class InternalError extends Error { }
  class BindingError extends Error { }
  class UnboundTypeError extends Error { }
  class PureVirtualError extends Error { }
  class Vector<T> extends EmscriptenEmbindInstance {
    delete(): void
    get(i: number): T
    get(i: number, j: number, data: any): T
    set(i: number, t: T): void
    put(i: number, j: number, data: any): any
    // size(): number
    push_back(n: T): any
    resize(count: number, value?: T): void
    delete(): void
  }

  class Vec3d extends Vector<any> { }
  class IntVector extends Vector<number> { }
  class FloatVector extends Vector<number> { }
  class DoubleVector extends Vector<number>{ }
  class PointVector extends Vector<Point> { }
  class KeyPointVector extends Vector<any> { }
  class DMatchVector extends Vector<any> { }
  class DMatchVectorVector extends Vector<Vector<any>> { }
  
  class RectVector extends Rect implements Vector<Rect>{
    get(i: number): Rect
    isAliasOf(...a: any[]): any
    clone(...a: any[]): any
    delete(...a: any[]): any
    isDeleted(...a: any[]): any
    deleteLater(...a: any[]): any
    set(i: number, t: Rect): void
    put(i: number, j: number, data: any): any
    size(): number
    push_back(n: Rect): void
    resize(count: number, value?: Rect | undefined): void
    delete(): void
  }

  class VideoCapture {
    public constructor(videoSource: HTMLVideoElement | string)
    public read(m: Mat): any
    public video: HTMLVideoElement
  }

  type MatSize = () => Size




  function matFromImageData(imageData: ImageData): Mat
  function matFromArray(rows: number, cols: number, type: any, array: number[] | ArrayBufferView): Mat


  /** since we don't support inheritance yet we force Mat to extend Mat_ which type defined here: */
  class Mat_ extends Vector<Mat> {
    public data: Uint8Array
    public data8S: Int8Array
    public data8U: Uint8Array
    public data16U: Uint16Array
    public data16S: Int16Array
    public data32U: Uint32Array
    public data32S: Int32Array
    public data32F: Float32Array
    public data64F: Float64Array
    public ucharPtr(i: any, j: any): any
    public charPtr(i: any, j: any): any
    public shortPtr(i: any, j: any): any
    public ushortPtr(i: any, j: any): any
    public intPtr(i: any, j: any): any
    public intPtr(i: any): any
    public ucharAt(i: any): any
    public ucharAt(i: any, j:any): any
    public charAt(i: any): any
    public floatPtr(i: any, j: any): any
    public doublePtr(i: any, j: any): any
    public intPtr(i: any, j: any): any
    public setTo(value: Mat_ | Scalar, mask?: Mat_): Mat_;
    /**
     * Sometimes, you will have to play with certain region of images. 
     * For eye detection in images, first face detection is done all 
     * over the image and when face is obtained, we select the face region alone and search for eyes inside it instead of searching whole image. 
     * It improves accuracy (because eyes are always on faces) and performance (because we search for a small area). 
     * 
     * Heads up : in JS seems only one argument is expected.
     */
    public roi(expr: Rect | Mat_): Mat

    public floatAt(i:number,j:number):number
    public floatAt(i:number):number

    
  }


  class ImageData {
    data: ArrayBufferView
    width: number
    height: number
  }

  // TODO this types should be exposed by the tool - want to make it work:
  const CV_8U: CVDataType
  const CV_8UC1: CVDataType
  const CV_8UC2: CVDataType
  const CV_8UC3: CVDataType
  const CV_8UC4: CVDataType
  const CV_8S: CVDataType
  const CV_8SC1: CVDataType
  const CV_8SC2: CVDataType
  const CV_8SC3: CVDataType
  const CV_8SC4: CVDataType
  const CV_16U: CVDataType
  const CV_16UC1: CVDataType
  const CV_16UC2: CVDataType
  const CV_16UC3: CVDataType
  const CV_16UC4: CVDataType
  const CV_16S: CVDataType
  const CV_16SC1: CVDataType
  const CV_16SC2: CVDataType
  const CV_16SC3: CVDataType
  const CV_16SC4: CVDataType
  const CV_32S: CVDataType
  const CV_32SC1: CVDataType
  const CV_32SC2: CVDataType
  const CV_32SC3: CVDataType
  const CV_32SC4: CVDataType
  const CV_32F: CVDataType
  const CV_32FC1: CVDataType
  const CV_32FC2: CVDataType
  const CV_32FC3: CVDataType
  const CV_32FC4: CVDataType
  const CV_64F: CVDataType
  const CV_64FC1: CVDataType
  const CV_64FC2: CVDataType
  const CV_64FC3: CVDataType
  const CV_64FC4: CVDataType

  const CV_PI: number;

  type CVDataType = any

  function ellipse1(dst: Mat, rotatedRect: RotatedRect, ellipseColor: Scalar, arg0: number, line: LineTypes): void
  function imread(canvasOrImageHtmlElement: HTMLElement | string): Mat
  function norm1(a: Mat, b: Mat, type: NormTypes): number
  function imshow(canvasSource: HTMLElement | string, mat: Mat): void
  function matFromArray(rows: number, cols: number, type: any, array: any): Mat


  // Missing imports: 
  type Mat4 = any
  type Mat3 = any
  type Vec3 = any
  type float_type = any
  type int = number
  type bool = boolean
  type FileNode = any
  type FileStorage = any
  type Ptr = any
  type size_t = any
  type double = number
  type float = number
  type UMat = any
  type Matrix = any
  type BucketKey = any
  type Bucket = any
  type LshStats = any
  type MatAllocator = any
  type uchar = any
  type MatStep = any
  type UMatData = any
  type typename = any
  type Vec = any
  type Point_ = any
  type Point3_ = any
  type MatCommaInitializer_ = any
  type MatIterator_ = any
  type MatConstIterator_ = any
  type AccessFlag = any
  type UMatUsageFlags = any
  type _Tp = any
  type Matx_AddOp = any
  type Matx_SubOp = any
  type _T2 = any
  type Matx_ScaleOp = any
  type Matx_MulOp = any
  type Matx_DivOp = any
  type Matx_MatMulOp = any
  type Matx_TOp = any
  type diag_type = any
  type _EqPredicate = any
  type cvhalDFT = any
  type schar = any
  type ushort = any
  type short = any
  type int64 = any
  type ErrorCallback = any
  type unsigned = any
  type uint64 = any
  type float16_t = any
  type AsyncArray = any
  type Net = any
  type Moments = any
  type uint64_t = any
  type uint32_t = any
  type int32_t = any
  type int64_t = any

}