
//import { InputArray, int, OutputArray } from './_types'
declare namespace cv {
/*
 * # Color Space Conversions
 * 
 */
/**
 * The function converts an input image from one color space to another. In case of a transformation
 * to-from RGB color space, the order of the channels should be specified explicitly (RGB or BGR). Note
 * that the default color format in OpenCV is often referred to as RGB but it is actually BGR (the
 * bytes are reversed). So the first byte in a standard (24-bit) color image will be an 8-bit Blue
 * component, the second byte will be Green, and the third byte will be Red. The fourth, fifth, and
 * sixth bytes would then be the second pixel (Blue, then Green, then Red), and so on.
 * 
 * The conventional ranges for R, G, and B channel values are:
 * 
 * 0 to 255 for CV_8U images
 * 0 to 65535 for CV_16U images
 * 0 to 1 for CV_32F images
 * 
 * In case of linear transformations, the range does not matter. But in case of a non-linear
 * transformation, an input RGB image should be normalized to the proper value range to get the correct
 * results, for example, for RGB `$\\rightarrow$` L*u*v* transformation. For example, if you have a
 * 32-bit floating-point image directly converted from an 8-bit image without any scaling, then it will
 * have the 0..255 value range instead of 0..1 assumed by the function. So, before calling [cvtColor] ,
 * you need first to scale the image down: 
 * 
 * ```cpp
 * img *= 1./255;
 * cvtColor(img, img, COLOR_BGR2Luv);
 * ```
 * 
 *  If you use [cvtColor] with 8-bit images, the conversion will have some information lost. For many
 * applications, this will not be noticeable but it is recommended to use 32-bit images in applications
 * that need the full range of colors or that convert an image before an operation and then convert
 * back.
 * 
 * If conversion adds the alpha channel, its value will set to the maximum of corresponding channel
 * range: 255 for CV_8U, 65535 for CV_16U, 1 for CV_32F.
 * 
 * [Color conversions]
 * 
 * @param src input image: 8-bit unsigned, 16-bit unsigned ( CV_16UC... ), or single-precision
 * floating-point.
 * 
 * @param dst output image of the same size and depth as src.
 * 
 * @param code color space conversion code (see ColorConversionCodes).
 * 
 * @param dstCn number of channels in the destination image; if the parameter is 0, the number of the
 * channels is derived automatically from src and code.
 */
  function cvtColor(src: InputArray, dst: OutputArray, code: int, dstCn?: int): void

/**
 * This function only supports YUV420 to RGB conversion as of now.
 * 
 * @param src1 8-bit image (CV_8U) of the Y plane.
 * 
 * @param src2 image containing interleaved U/V plane.
 * 
 * @param dst output image.
 * 
 * @param code Specifies the type of conversion. It can take any of the following values:
 * COLOR_YUV2BGR_NV12COLOR_YUV2RGB_NV12COLOR_YUV2BGRA_NV12COLOR_YUV2RGBA_NV12COLOR_YUV2BGR_NV21COLOR_YUV2RGB_NV21COLOR_YUV2BGRA_NV21COLOR_YUV2RGBA_NV21
 */
  function cvtColorTwoPlane(src1: InputArray, src2: InputArray, dst: OutputArray, code: int): void

/**
 * The function can do the following transformations:
 * 
 * Demosaicing using bilinear interpolation[COLOR_BayerBG2BGR] , [COLOR_BayerGB2BGR] ,
 * [COLOR_BayerRG2BGR] , [COLOR_BayerGR2BGR][COLOR_BayerBG2GRAY] , [COLOR_BayerGB2GRAY] ,
 * [COLOR_BayerRG2GRAY] , [COLOR_BayerGR2GRAY]
 * Demosaicing using Variable Number of Gradients.[COLOR_BayerBG2BGR_VNG] , [COLOR_BayerGB2BGR_VNG] ,
 * [COLOR_BayerRG2BGR_VNG] , [COLOR_BayerGR2BGR_VNG]
 * Edge-Aware Demosaicing.[COLOR_BayerBG2BGR_EA] , [COLOR_BayerGB2BGR_EA] , [COLOR_BayerRG2BGR_EA] ,
 * [COLOR_BayerGR2BGR_EA]
 * Demosaicing with alpha channel[COLOR_BayerBG2BGRA] , [COLOR_BayerGB2BGRA] , [COLOR_BayerRG2BGRA] ,
 * [COLOR_BayerGR2BGRA]
 * 
 * [cvtColor]
 * 
 * @param src input image: 8-bit unsigned or 16-bit unsigned.
 * 
 * @param dst output image of the same size and depth as src.
 * 
 * @param code Color space conversion code (see the description below).
 * 
 * @param dstCn number of channels in the destination image; if the parameter is 0, the number of the
 * channels is derived automatically from src and code.
 */
  function demosaicing(src: InputArray, dst: OutputArray, code: int, dstCn?: int): void

  const COLOR_BGR2BGRA: ColorConversionCodes // initializer: = 0

  const COLOR_RGB2RGBA: ColorConversionCodes // initializer: = COLOR_BGR2BGRA

  const COLOR_BGRA2BGR: ColorConversionCodes // initializer: = 1

  const COLOR_RGBA2RGB: ColorConversionCodes // initializer: = COLOR_BGRA2BGR

  const COLOR_BGR2RGBA: ColorConversionCodes // initializer: = 2

  const COLOR_RGB2BGRA: ColorConversionCodes // initializer: = COLOR_BGR2RGBA

  const COLOR_RGBA2BGR: ColorConversionCodes // initializer: = 3

  const COLOR_BGRA2RGB: ColorConversionCodes // initializer: = COLOR_RGBA2BGR

  const COLOR_BGR2RGB: ColorConversionCodes // initializer: = 4

  const COLOR_RGB2BGR: ColorConversionCodes // initializer: = COLOR_BGR2RGB

  const COLOR_BGRA2RGBA: ColorConversionCodes // initializer: = 5

  const COLOR_RGBA2BGRA: ColorConversionCodes // initializer: = COLOR_BGRA2RGBA

  const COLOR_BGR2GRAY: ColorConversionCodes // initializer: = 6

  const COLOR_RGB2GRAY: ColorConversionCodes // initializer: = 7

  const COLOR_GRAY2BGR: ColorConversionCodes // initializer: = 8

  const COLOR_GRAY2RGB: ColorConversionCodes // initializer: = COLOR_GRAY2BGR

  const COLOR_GRAY2BGRA: ColorConversionCodes // initializer: = 9

  const COLOR_GRAY2RGBA: ColorConversionCodes // initializer: = COLOR_GRAY2BGRA

  const COLOR_BGRA2GRAY: ColorConversionCodes // initializer: = 10

  const COLOR_RGBA2GRAY: ColorConversionCodes // initializer: = 11

  const COLOR_BGR2BGR565: ColorConversionCodes // initializer: = 12

  const COLOR_RGB2BGR565: ColorConversionCodes // initializer: = 13

  const COLOR_BGR5652BGR: ColorConversionCodes // initializer: = 14

  const COLOR_BGR5652RGB: ColorConversionCodes // initializer: = 15

  const COLOR_BGRA2BGR565: ColorConversionCodes // initializer: = 16

  const COLOR_RGBA2BGR565: ColorConversionCodes // initializer: = 17

  const COLOR_BGR5652BGRA: ColorConversionCodes // initializer: = 18

  const COLOR_BGR5652RGBA: ColorConversionCodes // initializer: = 19

  const COLOR_GRAY2BGR565: ColorConversionCodes // initializer: = 20

  const COLOR_BGR5652GRAY: ColorConversionCodes // initializer: = 21

  const COLOR_BGR2BGR555: ColorConversionCodes // initializer: = 22

  const COLOR_RGB2BGR555: ColorConversionCodes // initializer: = 23

  const COLOR_BGR5552BGR: ColorConversionCodes // initializer: = 24

  const COLOR_BGR5552RGB: ColorConversionCodes // initializer: = 25

  const COLOR_BGRA2BGR555: ColorConversionCodes // initializer: = 26

  const COLOR_RGBA2BGR555: ColorConversionCodes // initializer: = 27

  const COLOR_BGR5552BGRA: ColorConversionCodes // initializer: = 28

  const COLOR_BGR5552RGBA: ColorConversionCodes // initializer: = 29

  const COLOR_GRAY2BGR555: ColorConversionCodes // initializer: = 30

  const COLOR_BGR5552GRAY: ColorConversionCodes // initializer: = 31

  const COLOR_BGR2XYZ: ColorConversionCodes // initializer: = 32

  const COLOR_RGB2XYZ: ColorConversionCodes // initializer: = 33

  const COLOR_XYZ2BGR: ColorConversionCodes // initializer: = 34

  const COLOR_XYZ2RGB: ColorConversionCodes // initializer: = 35

  const COLOR_BGR2YCrCb: ColorConversionCodes // initializer: = 36

  const COLOR_RGB2YCrCb: ColorConversionCodes // initializer: = 37

  const COLOR_YCrCb2BGR: ColorConversionCodes // initializer: = 38

  const COLOR_YCrCb2RGB: ColorConversionCodes // initializer: = 39

  const COLOR_BGR2HSV: ColorConversionCodes // initializer: = 40

  const COLOR_RGB2HSV: ColorConversionCodes // initializer: = 41

  const COLOR_BGR2Lab: ColorConversionCodes // initializer: = 44

  const COLOR_RGB2Lab: ColorConversionCodes // initializer: = 45

  const COLOR_BGR2Luv: ColorConversionCodes // initializer: = 50

  const COLOR_RGB2Luv: ColorConversionCodes // initializer: = 51

  const COLOR_BGR2HLS: ColorConversionCodes // initializer: = 52

  const COLOR_RGB2HLS: ColorConversionCodes // initializer: = 53

  const COLOR_HSV2BGR: ColorConversionCodes // initializer: = 54

  const COLOR_HSV2RGB: ColorConversionCodes // initializer: = 55

  const COLOR_Lab2BGR: ColorConversionCodes // initializer: = 56

  const COLOR_Lab2RGB: ColorConversionCodes // initializer: = 57

  const COLOR_Luv2BGR: ColorConversionCodes // initializer: = 58

  const COLOR_Luv2RGB: ColorConversionCodes // initializer: = 59

  const COLOR_HLS2BGR: ColorConversionCodes // initializer: = 60

  const COLOR_HLS2RGB: ColorConversionCodes // initializer: = 61

  const COLOR_BGR2HSV_FULL: ColorConversionCodes // initializer: = 66

  const COLOR_RGB2HSV_FULL: ColorConversionCodes // initializer: = 67

  const COLOR_BGR2HLS_FULL: ColorConversionCodes // initializer: = 68

  const COLOR_RGB2HLS_FULL: ColorConversionCodes // initializer: = 69

  const COLOR_HSV2BGR_FULL: ColorConversionCodes // initializer: = 70

  const COLOR_HSV2RGB_FULL: ColorConversionCodes // initializer: = 71

  const COLOR_HLS2BGR_FULL: ColorConversionCodes // initializer: = 72

  const COLOR_HLS2RGB_FULL: ColorConversionCodes // initializer: = 73

  const COLOR_LBGR2Lab: ColorConversionCodes // initializer: = 74

  const COLOR_LRGB2Lab: ColorConversionCodes // initializer: = 75

  const COLOR_LBGR2Luv: ColorConversionCodes // initializer: = 76

  const COLOR_LRGB2Luv: ColorConversionCodes // initializer: = 77

  const COLOR_Lab2LBGR: ColorConversionCodes // initializer: = 78

  const COLOR_Lab2LRGB: ColorConversionCodes // initializer: = 79

  const COLOR_Luv2LBGR: ColorConversionCodes // initializer: = 80

  const COLOR_Luv2LRGB: ColorConversionCodes // initializer: = 81

  const COLOR_BGR2YUV: ColorConversionCodes // initializer: = 82

  const COLOR_RGB2YUV: ColorConversionCodes // initializer: = 83

  const COLOR_YUV2BGR: ColorConversionCodes // initializer: = 84

  const COLOR_YUV2RGB: ColorConversionCodes // initializer: = 85

  const COLOR_YUV2RGB_NV12: ColorConversionCodes // initializer: = 90

  const COLOR_YUV2BGR_NV12: ColorConversionCodes // initializer: = 91

  const COLOR_YUV2RGB_NV21: ColorConversionCodes // initializer: = 92

  const COLOR_YUV2BGR_NV21: ColorConversionCodes // initializer: = 93

  const COLOR_YUV420sp2RGB: ColorConversionCodes // initializer: = COLOR_YUV2RGB_NV21

  const COLOR_YUV420sp2BGR: ColorConversionCodes // initializer: = COLOR_YUV2BGR_NV21

  const COLOR_YUV2RGBA_NV12: ColorConversionCodes // initializer: = 94

  const COLOR_YUV2BGRA_NV12: ColorConversionCodes // initializer: = 95

  const COLOR_YUV2RGBA_NV21: ColorConversionCodes // initializer: = 96

  const COLOR_YUV2BGRA_NV21: ColorConversionCodes // initializer: = 97

  const COLOR_YUV420sp2RGBA: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_NV21

  const COLOR_YUV420sp2BGRA: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_NV21

  const COLOR_YUV2RGB_YV12: ColorConversionCodes // initializer: = 98

  const COLOR_YUV2BGR_YV12: ColorConversionCodes // initializer: = 99

  const COLOR_YUV2RGB_IYUV: ColorConversionCodes // initializer: = 100

  const COLOR_YUV2BGR_IYUV: ColorConversionCodes // initializer: = 101

  const COLOR_YUV2RGB_I420: ColorConversionCodes // initializer: = COLOR_YUV2RGB_IYUV

  const COLOR_YUV2BGR_I420: ColorConversionCodes // initializer: = COLOR_YUV2BGR_IYUV

  const COLOR_YUV420p2RGB: ColorConversionCodes // initializer: = COLOR_YUV2RGB_YV12

  const COLOR_YUV420p2BGR: ColorConversionCodes // initializer: = COLOR_YUV2BGR_YV12

  const COLOR_YUV2RGBA_YV12: ColorConversionCodes // initializer: = 102

  const COLOR_YUV2BGRA_YV12: ColorConversionCodes // initializer: = 103

  const COLOR_YUV2RGBA_IYUV: ColorConversionCodes // initializer: = 104

  const COLOR_YUV2BGRA_IYUV: ColorConversionCodes // initializer: = 105

  const COLOR_YUV2RGBA_I420: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_IYUV

  const COLOR_YUV2BGRA_I420: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_IYUV

  const COLOR_YUV420p2RGBA: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_YV12

  const COLOR_YUV420p2BGRA: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_YV12

  const COLOR_YUV2GRAY_420: ColorConversionCodes // initializer: = 106

  const COLOR_YUV2GRAY_NV21: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV2GRAY_NV12: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV2GRAY_YV12: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV2GRAY_IYUV: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV2GRAY_I420: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV420sp2GRAY: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV420p2GRAY: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_420

  const COLOR_YUV2RGB_UYVY: ColorConversionCodes // initializer: = 107

  const COLOR_YUV2BGR_UYVY: ColorConversionCodes // initializer: = 108

  const COLOR_YUV2RGB_Y422: ColorConversionCodes // initializer: = COLOR_YUV2RGB_UYVY

  const COLOR_YUV2BGR_Y422: ColorConversionCodes // initializer: = COLOR_YUV2BGR_UYVY

  const COLOR_YUV2RGB_UYNV: ColorConversionCodes // initializer: = COLOR_YUV2RGB_UYVY

  const COLOR_YUV2BGR_UYNV: ColorConversionCodes // initializer: = COLOR_YUV2BGR_UYVY

  const COLOR_YUV2RGBA_UYVY: ColorConversionCodes // initializer: = 111

  const COLOR_YUV2BGRA_UYVY: ColorConversionCodes // initializer: = 112

  const COLOR_YUV2RGBA_Y422: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_UYVY

  const COLOR_YUV2BGRA_Y422: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_UYVY

  const COLOR_YUV2RGBA_UYNV: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_UYVY

  const COLOR_YUV2BGRA_UYNV: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_UYVY

  const COLOR_YUV2RGB_YUY2: ColorConversionCodes // initializer: = 115

  const COLOR_YUV2BGR_YUY2: ColorConversionCodes // initializer: = 116

  const COLOR_YUV2RGB_YVYU: ColorConversionCodes // initializer: = 117

  const COLOR_YUV2BGR_YVYU: ColorConversionCodes // initializer: = 118

  const COLOR_YUV2RGB_YUYV: ColorConversionCodes // initializer: = COLOR_YUV2RGB_YUY2

  const COLOR_YUV2BGR_YUYV: ColorConversionCodes // initializer: = COLOR_YUV2BGR_YUY2

  const COLOR_YUV2RGB_YUNV: ColorConversionCodes // initializer: = COLOR_YUV2RGB_YUY2

  const COLOR_YUV2BGR_YUNV: ColorConversionCodes // initializer: = COLOR_YUV2BGR_YUY2

  const COLOR_YUV2RGBA_YUY2: ColorConversionCodes // initializer: = 119

  const COLOR_YUV2BGRA_YUY2: ColorConversionCodes // initializer: = 120

  const COLOR_YUV2RGBA_YVYU: ColorConversionCodes // initializer: = 121

  const COLOR_YUV2BGRA_YVYU: ColorConversionCodes // initializer: = 122

  const COLOR_YUV2RGBA_YUYV: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_YUY2

  const COLOR_YUV2BGRA_YUYV: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_YUY2

  const COLOR_YUV2RGBA_YUNV: ColorConversionCodes // initializer: = COLOR_YUV2RGBA_YUY2

  const COLOR_YUV2BGRA_YUNV: ColorConversionCodes // initializer: = COLOR_YUV2BGRA_YUY2

  const COLOR_YUV2GRAY_UYVY: ColorConversionCodes // initializer: = 123

  const COLOR_YUV2GRAY_YUY2: ColorConversionCodes // initializer: = 124

  const COLOR_YUV2GRAY_Y422: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_UYVY

  const COLOR_YUV2GRAY_UYNV: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_UYVY

  const COLOR_YUV2GRAY_YVYU: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_YUY2

  const COLOR_YUV2GRAY_YUYV: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_YUY2

  const COLOR_YUV2GRAY_YUNV: ColorConversionCodes // initializer: = COLOR_YUV2GRAY_YUY2

  const COLOR_RGBA2mRGBA: ColorConversionCodes // initializer: = 125

  const COLOR_mRGBA2RGBA: ColorConversionCodes // initializer: = 126

  const COLOR_RGB2YUV_I420: ColorConversionCodes // initializer: = 127

  const COLOR_BGR2YUV_I420: ColorConversionCodes // initializer: = 128

  const COLOR_RGB2YUV_IYUV: ColorConversionCodes // initializer: = COLOR_RGB2YUV_I420

  const COLOR_BGR2YUV_IYUV: ColorConversionCodes // initializer: = COLOR_BGR2YUV_I420

  const COLOR_RGBA2YUV_I420: ColorConversionCodes // initializer: = 129

  const COLOR_BGRA2YUV_I420: ColorConversionCodes // initializer: = 130

  const COLOR_RGBA2YUV_IYUV: ColorConversionCodes // initializer: = COLOR_RGBA2YUV_I420

  const COLOR_BGRA2YUV_IYUV: ColorConversionCodes // initializer: = COLOR_BGRA2YUV_I420

  const COLOR_RGB2YUV_YV12: ColorConversionCodes // initializer: = 131

  const COLOR_BGR2YUV_YV12: ColorConversionCodes // initializer: = 132

  const COLOR_RGBA2YUV_YV12: ColorConversionCodes // initializer: = 133

  const COLOR_BGRA2YUV_YV12: ColorConversionCodes // initializer: = 134

  const COLOR_BayerBG2BGR: ColorConversionCodes // initializer: = 46

  const COLOR_BayerGB2BGR: ColorConversionCodes // initializer: = 47

  const COLOR_BayerRG2BGR: ColorConversionCodes // initializer: = 48

  const COLOR_BayerGR2BGR: ColorConversionCodes // initializer: = 49

  const COLOR_BayerBG2RGB: ColorConversionCodes // initializer: = COLOR_BayerRG2BGR

  const COLOR_BayerGB2RGB: ColorConversionCodes // initializer: = COLOR_BayerGR2BGR

  const COLOR_BayerRG2RGB: ColorConversionCodes // initializer: = COLOR_BayerBG2BGR

  const COLOR_BayerGR2RGB: ColorConversionCodes // initializer: = COLOR_BayerGB2BGR

  const COLOR_BayerBG2GRAY: ColorConversionCodes // initializer: = 86

  const COLOR_BayerGB2GRAY: ColorConversionCodes // initializer: = 87

  const COLOR_BayerRG2GRAY: ColorConversionCodes // initializer: = 88

  const COLOR_BayerGR2GRAY: ColorConversionCodes // initializer: = 89

  const COLOR_BayerBG2BGR_VNG: ColorConversionCodes // initializer: = 62

  const COLOR_BayerGB2BGR_VNG: ColorConversionCodes // initializer: = 63

  const COLOR_BayerRG2BGR_VNG: ColorConversionCodes // initializer: = 64

  const COLOR_BayerGR2BGR_VNG: ColorConversionCodes // initializer: = 65

  const COLOR_BayerBG2RGB_VNG: ColorConversionCodes // initializer: = COLOR_BayerRG2BGR_VNG

  const COLOR_BayerGB2RGB_VNG: ColorConversionCodes // initializer: = COLOR_BayerGR2BGR_VNG

  const COLOR_BayerRG2RGB_VNG: ColorConversionCodes // initializer: = COLOR_BayerBG2BGR_VNG

  const COLOR_BayerGR2RGB_VNG: ColorConversionCodes // initializer: = COLOR_BayerGB2BGR_VNG

  const COLOR_BayerBG2BGR_EA: ColorConversionCodes // initializer: = 135

  const COLOR_BayerGB2BGR_EA: ColorConversionCodes // initializer: = 136

  const COLOR_BayerRG2BGR_EA: ColorConversionCodes // initializer: = 137

  const COLOR_BayerGR2BGR_EA: ColorConversionCodes // initializer: = 138

  const COLOR_BayerBG2RGB_EA: ColorConversionCodes // initializer: = COLOR_BayerRG2BGR_EA

  const COLOR_BayerGB2RGB_EA: ColorConversionCodes // initializer: = COLOR_BayerGR2BGR_EA

  const COLOR_BayerRG2RGB_EA: ColorConversionCodes // initializer: = COLOR_BayerBG2BGR_EA

  const COLOR_BayerGR2RGB_EA: ColorConversionCodes // initializer: = COLOR_BayerGB2BGR_EA

  const COLOR_BayerBG2BGRA: ColorConversionCodes // initializer: = 139

  const COLOR_BayerGB2BGRA: ColorConversionCodes // initializer: = 140

  const COLOR_BayerRG2BGRA: ColorConversionCodes // initializer: = 141

  const COLOR_BayerGR2BGRA: ColorConversionCodes // initializer: = 142

  const COLOR_BayerBG2RGBA: ColorConversionCodes // initializer: = COLOR_BayerRG2BGRA

  const COLOR_BayerGB2RGBA: ColorConversionCodes // initializer: = COLOR_BayerGR2BGRA

  const COLOR_BayerRG2RGBA: ColorConversionCodes // initializer: = COLOR_BayerBG2BGRA

  const COLOR_BayerGR2RGBA: ColorConversionCodes // initializer: = COLOR_BayerGB2BGRA

  const COLOR_COLORCVT_MAX: ColorConversionCodes // initializer: = 143

/**
 * the color conversion codes 
 * 
 * [Color conversions]
 * 
 */
 type ColorConversionCodes = any

 }