
#include "neoPixelOutput.h"
#include <math.h>

//Connect your ledstrip to GPIO 2

NeopixelOutput<Kpbs800> *pixels;

uint8_t on = 255;
uint8_t off = 0;

const int pixelcount = 50;
int codes[pixelcount];
int codeLength=0;
int numImg=0;

bool isValidCode(int code)
{
  //a bit primitive for now, but will work for codes < 50 
  if ((code & 7) == 0 || (code & 7) == 7) return false;
  if ((code & (7<<3)) == 0 || (code & (7<<3)) == (7<<3)) return false;
  if ((code & (7<<6)) == 0 || (code & (7<<6)) == (7<<6)) return false;
  return true;
}

void setup()
{
    Serial.begin(115200);
    Serial.println("Starting BLE work!");

    pixels = new NeopixelOutput<Kpbs800>(4); //RMT is connected to GPIO 2. see neoPixelOutput.h for the pin mapping.
    pixels->Begin();
    pixels->Clear();
    pixels->Show();

    int found=0;
    int code=0;
    while(found < pixelcount)
    {
      do {
        code++;
      } while (!isValidCode(code));
      codes[found++] = code;
    }

    codeLength = ceil(log(codes[49])/log(2));
    numImg = ceil((float)codeLength/3.)+1;
    Serial.printf("max code = %d, code len = %d. images = %d", codes[49], codeLength, numImg);

    pixels->SetLength(pixelcount * 3);
}


void loop()
{
  uint8_t rgb[3];
  for (int img=0; img<numImg; img++)
  {
    for (int pixel = 0; pixel < pixelcount; pixel++)
    {
      int code = codes[pixel];
      int shift = 3*((img + pixel) % numImg);
      rgb[0] = (code & (1 << shift)) > 0 ? 255:0;
      rgb[1] = (code & (2 << shift)) > 0 ? 255:0;
      rgb[2] = (code & (4 << shift)) > 0 ? 255:0;
      pixels->SetData(rgb, 3, pixel*3);
    }
    pixels->Show();
    delay(333);
  }
}
