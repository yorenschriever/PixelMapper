#ifndef PRIVATE_KEY_H_
#define PRIVATE_KEY_H_
unsigned char example_key_DER[] = {
  0x30, 0x82, 0x02, 0x5d, 0x02, 0x01, 0x00, 0x02, 0x81, 0x81, 0x00, 0xc2,
  0xcd, 0xd7, 0x60, 0x12, 0xb6, 0x3c, 0x1e, 0xd0, 0x3c, 0xb3, 0x25, 0x12,
  0x45, 0x42, 0xde, 0x7e, 0x16, 0x53, 0xda, 0x9c, 0xa0, 0x90, 0xd4, 0xec,
  0xa5, 0xf9, 0xf1, 0xe0, 0x0a, 0xd3, 0x31, 0x62, 0xe9, 0xff, 0xb8, 0x47,
  0x18, 0xe0, 0x83, 0xc4, 0x7f, 0x93, 0xc8, 0xba, 0x78, 0x7e, 0x1c, 0x45,
  0x1a, 0xa4, 0x07, 0xdc, 0x50, 0xc7, 0x8a, 0x9c, 0xb6, 0xac, 0x03, 0xd2,
  0x4c, 0x62, 0x74, 0xa3, 0xe5, 0x24, 0xf1, 0x25, 0x0f, 0x50, 0xb0, 0x47,
  0x66, 0xda, 0x04, 0xc9, 0x8b, 0x84, 0xf2, 0x26, 0x26, 0x77, 0x78, 0x5b,
  0x71, 0x0a, 0xbd, 0xb9, 0x7a, 0xdc, 0x44, 0x19, 0x2e, 0x79, 0xdc, 0x9b,
  0xae, 0x1d, 0x71, 0xf8, 0xf6, 0xf5, 0x17, 0x74, 0x99, 0xa3, 0xa1, 0x82,
  0xd9, 0xdd, 0x01, 0xe3, 0xa3, 0xab, 0x3e, 0x76, 0x9b, 0x56, 0xfc, 0x7a,
  0x13, 0xa9, 0x01, 0x53, 0xe0, 0x6b, 0x2f, 0x02, 0x03, 0x01, 0x00, 0x01,
  0x02, 0x81, 0x81, 0x00, 0xbb, 0xa5, 0x7e, 0x56, 0x8c, 0x0f, 0xc0, 0x9f,
  0xc9, 0xe4, 0xfe, 0x87, 0xb2, 0x2e, 0xc7, 0x77, 0xfc, 0xaa, 0xd3, 0x41,
  0x5c, 0xe8, 0x8a, 0x3a, 0xa0, 0x6e, 0x4c, 0xf2, 0x81, 0xe6, 0xcb, 0x82,
  0xe2, 0x0e, 0x17, 0x86, 0xd1, 0xed, 0x93, 0xaf, 0x39, 0xe3, 0xce, 0x5e,
  0x67, 0xc8, 0xd3, 0x69, 0xb5, 0xe3, 0x30, 0xa8, 0x65, 0xbf, 0xe6, 0x46,
  0x8e, 0x28, 0xa4, 0x4f, 0xd6, 0x0e, 0x40, 0x32, 0xfe, 0xc5, 0x03, 0xed,
  0x1f, 0xb1, 0x2c, 0x65, 0xd4, 0xa3, 0xf0, 0x86, 0x7f, 0x0f, 0x27, 0x95,
  0x95, 0xb4, 0x4a, 0x52, 0x55, 0xf9, 0x16, 0x9c, 0x74, 0x53, 0xc2, 0xa2,
  0x61, 0x42, 0x6e, 0x6e, 0xd2, 0x56, 0xf6, 0xb4, 0x68, 0x9b, 0xd4, 0xcc,
  0xa1, 0x8d, 0xde, 0x96, 0xf5, 0x57, 0x61, 0x8a, 0x0a, 0x2a, 0x25, 0x4d,
  0xfd, 0xb7, 0xc9, 0x60, 0x8c, 0x22, 0xe2, 0x90, 0xf3, 0x8c, 0xf3, 0x69,
  0x02, 0x41, 0x00, 0xe0, 0xa5, 0xa7, 0x27, 0x7c, 0xc0, 0x3d, 0x69, 0x1e,
  0xe3, 0xb9, 0xdf, 0xb8, 0xdf, 0x82, 0xfb, 0x86, 0x67, 0x47, 0x90, 0x27,
  0xdd, 0xa8, 0x2a, 0xfc, 0x03, 0xa8, 0x78, 0xef, 0x01, 0x4d, 0x19, 0x02,
  0x83, 0x23, 0xc0, 0x96, 0x6e, 0xe0, 0x53, 0xe5, 0xd2, 0x49, 0xc7, 0xeb,
  0x24, 0x76, 0x33, 0xa4, 0xcb, 0x5c, 0xb3, 0x41, 0x2a, 0x69, 0x6e, 0xce,
  0xad, 0xdc, 0xd0, 0xd7, 0xc1, 0x30, 0xd3, 0x02, 0x41, 0x00, 0xdd, 0xfd,
  0xef, 0xb8, 0xc3, 0xdc, 0xd9, 0x2f, 0xf7, 0x6a, 0xbe, 0xbe, 0xd9, 0x00,
  0xf1, 0xee, 0x22, 0xa5, 0x0f, 0x38, 0x3c, 0xce, 0xc3, 0x47, 0x75, 0xb7,
  0x60, 0x36, 0xad, 0x24, 0xc2, 0xf7, 0x9b, 0x66, 0x2b, 0x34, 0x8b, 0x6d,
  0x5b, 0x13, 0x2f, 0x19, 0x3b, 0x96, 0x38, 0x51, 0x28, 0x66, 0x0d, 0x7c,
  0x04, 0x55, 0x51, 0xbb, 0x24, 0x3d, 0x85, 0x4c, 0x22, 0x2f, 0x33, 0xf3,
  0xc2, 0xb5, 0x02, 0x41, 0x00, 0xd4, 0xad, 0x5f, 0x83, 0xad, 0xc2, 0x5e,
  0x21, 0x50, 0x42, 0x2e, 0x2d, 0xd4, 0xdb, 0x9e, 0x28, 0xbc, 0x44, 0xb8,
  0xe6, 0x8c, 0x27, 0x78, 0x57, 0x41, 0x81, 0xc1, 0x14, 0xc4, 0xc9, 0x49,
  0x91, 0x5c, 0xe4, 0x84, 0x8b, 0x86, 0x9f, 0xef, 0xb6, 0xde, 0x04, 0x69,
  0x1f, 0x60, 0xc9, 0x83, 0x32, 0x3f, 0x58, 0xdc, 0x29, 0x44, 0x8f, 0x7f,
  0x83, 0x8d, 0x1d, 0xe2, 0xc8, 0xc1, 0x0a, 0x40, 0x4b, 0x02, 0x40, 0x3b,
  0xc1, 0x44, 0x0a, 0xff, 0x25, 0xee, 0x8c, 0x7b, 0xd4, 0x0e, 0xfe, 0x3e,
  0x59, 0x83, 0xc5, 0xef, 0x2b, 0x71, 0x1a, 0x59, 0x3b, 0xea, 0xd2, 0xcc,
  0x7c, 0x0c, 0xf9, 0x0a, 0xc8, 0x4f, 0x76, 0xe9, 0x2c, 0xaa, 0x4a, 0x9d,
  0x91, 0x55, 0x27, 0xa7, 0xd0, 0xe9, 0xfa, 0x38, 0xb4, 0x97, 0xe4, 0x48,
  0x92, 0xee, 0x73, 0xac, 0xe9, 0x6c, 0x0a, 0xe7, 0x5b, 0xa4, 0x04, 0x02,
  0xbf, 0x05, 0xd5, 0x02, 0x40, 0x7f, 0xea, 0xd2, 0xd7, 0x33, 0xb2, 0x30,
  0x55, 0x09, 0xcc, 0x50, 0xed, 0x20, 0x08, 0x1c, 0x27, 0x18, 0x05, 0xc3,
  0x15, 0x18, 0x63, 0x56, 0x26, 0x54, 0xea, 0x6d, 0xfd, 0x28, 0x7a, 0xd5,
  0xb1, 0xae, 0x39, 0x8c, 0xd8, 0xad, 0x91, 0x59, 0x87, 0x21, 0x21, 0x53,
  0x40, 0x8f, 0x01, 0x0a, 0xaa, 0x93, 0xef, 0xb6, 0xed, 0xb1, 0xfe, 0x17,
  0x26, 0xaf, 0xb1, 0xa8, 0xe4, 0xc8, 0x7a, 0x11, 0x49
};
unsigned int example_key_DER_len = 609;
#endif
