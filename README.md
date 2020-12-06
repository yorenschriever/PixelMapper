
# Pixelmapper
Pixelmapper finds the positions of leds from a series of photos it takes. You can use these positions to display animations on objects wrapped in led strings, like this Christmas tree. You can see this project as an open source alternative to [Twinkly](https://www.twinkly.com/).

![Example application](https://github.com/yorenschriever/PixelMapper/raw/master/public/snow.gif)

  
## What does is do?
It is basically a website that opens a websocket connection to an ESP32 that is connected to a string of leds. Then, it triggers these leds in a special pattern and takes photos of them. From these photos it can calculate the position of each led. PixelMapper is a browser based application that runs client-side using OpenCV in WebAssembly. This means you can run it on any platform (mobile/desktop), without the need to install anything.
  
##  See it in action 
If you don't want to solder leds or program a microcontroller yet, you can get an impression by loading some example states. You can download one of these files, go to https://yorenschriever.github.io/pixelmapper/ and choose 'load state'. The example states are taken after the capture phase, right before the analysis starts. This is where you continue.

[Pixel strip state](https://github.com/yorenschriever/PixelMapper/blob/master/public/testset/state.json?raw=true) 

[Neopixels strip state](https://github.com/yorenschriever/PixelMapper/blob/master/public/testset/balanced-occluded.json?raw=true)

[Christmas tree state](https://github.com/yorenschriever/PixelMapper/blob/master/public/testset/balanced-tree.json?raw=true)

The first one is an example under optimal conditions: Every led will be solved. The one with the Neopixel strip is more advanced. It contains reflections, leds facing away from the camera, and leds that are covered. The third example is a real world example where a lot of leds are at the back of the tree or behind branches. A lot of leds will not be found. Because the leds are wrapped in a spiral pattern around the tree, interpolation will do a good job approximating their positions.

![](https://github.com/yorenschriever/PixelMapper/raw/master/public/collage.jpg)

## Map your own leds

### Hardware  
- **ESP32.** I work with a [ESP32-POE](https://www.olimex.com/Products/IoT/ESP32/ESP32-POE/open-source-hardware) with ethernet connectivity, but a NodeMCU or any other board will do fine.
- **Ledstrip.** The example sketch drives Neopixels. I really like these ones from [AliExpress](https://nl.aliexpress.com/item/4000242860388.html). ([Adafruit](https://www.adafruit.com/product/4560) and [Sparkfun](https://www.sparkfun.com/products/16792) sell similar strings.) Any other type of Neopixels will also work. You can also change the sketch to use another library if you want to use leds with a different protocol. The mapper algorithm doesn't care.
- **Power supply.** As always you need a decent power supply and proper wiring. If you don't know where to start, Adafruit has a [great guide](https://learn.adafruit.com/adafruit-neopixel-uberguide/powering-neopixels). 
- **Phone.** Or any other device with a camera, browser and a screen.

In the example pictures above I used 800 leds for a tree that is roughly conical with a radius of 0.5m and a height of 1.5m. That comes down to 322 leds/m2 if you need a reference for the led density. The total price for the hardware for that project was about 150 euro. 

### Firmware  
- Install [Arduino IDE](https://www.arduino.cc/en/software)  
- Get the [ESP32 core](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/) 
- Depending on your board and os you might need [CH340 drivers](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all#drivers-if-you-need-them)
- Now you are ready to upload the [Pixelmapper BLE sketch](https://github.com/yorenschriever/PixelMapper/tree/master/tools/pixelmapper_esp32_neopixels_ble) to you ESP32. 

This sketch will use bluetooth low energy to receive data from the pixelmapper. This is the easiest way to get started, but your phone needs to have BLE, and your browser needs to implement the web bluetooth API. BLE also becomes less reliable when using larger number of leds (> 1000). If you do not want to use BLE you can try the [Pixelmapper Websocket sketch](https://github.com/yorenschriever/PixelMapper/tree/master/tools/pixelmapper_esp32_neopixels). It is a bit more complicated, but more powerful and reliable.

### Start mapping
1. Open [Pixelmapper](https://yorenschriever.github.io/pixelmapper/). Click 'Add BLE device', select your pixelmapper, fill in the number of leds, and wait for a connection. When connected, all leds should flash at a stable 1Hz to indicate a good connection.
2. Put your phone in a tripod (Mapping will not work without it. Really) and press 'Capture' to start capturing. This will take a few seconds. 
3. After capturing the mapping will start automatically. You will see the positions appear on the screen one by one. When all pixels are mapped you can browse through all matches, tweak them and export them as CSV.

The CSV file contains the positions in a coordinate system [-1,1] x [-1,1]. How you can use these positions to display patterns is out of scope of this project. If you are familiar with quartz composer (macos), I got a plugin that will send out your composition to the leds. Let me know if you are interested. You can also export a header (*.h) file if you want to use the positions in one of your Arduino projects directly (still experimental, the format might change)

Pro tip: At any point in the process you can download the current state from the hamburger menu. This is useful if you want to create a backup, continue at a later time, or continue on another device. I found it convenient to download the state after capturing, send it to my desktop and do the review and export on a large monitor. 
  
## How does it work?
It is an old project that I have ported a few times over the years. It started out as a dedicated hardware device based on a Raspberry pi and a camera module. The code was written in cpp and not very flexible. As phones became more powerful, about 5 years ago, i realised that this would be the ideal platform, because they are smaller and easy available. I rewrote it in java in Android studio and created an app out of it. It worked, but was now only available on android, and because i wasn't too familiar with writing native apps, the ui was spartan. Now technology has advanced, I realised it would be possible to do it all in the browser. This would make Pixelmapper available on Android, ios and desktop, without bothering about app stores or installers. 

### Algorithm
If you are interested in the algorithm, have a look at [pixelMapper.js](https://github.com/yorenschriever/PixelMapper/blob/master/src/worker/pixelMapper.js). This contains all interesting stuff.

Below I will guide you through my thought process to get the the current algorithm. Is starts by splitting up the problem into 2 sub problems:  
1.	Where are the leds? (which pixels contain leds, which do not?)  
2.	Given a led, which one is it?  
  
#### Naive approach to subproblem 2
We can address each led from the ESP32 individually, and say if each one should be either  
*on* or *off*. Then, take a picture and repeat the process a few times with different patterns. If we choose the *on*-or-*off* patterns carefully we can analyse the photos and calculate which led is which. Now, we reduced the problem to representing each led index as a series of *on*-or-*offs*. I call this series the 'code' in the source code. The most trivial way to do this is to use the binary representation of the index. I.e. Led with index 2 will get code 10 in binary, which means: *on* in picture 1 and *off* in picture 0. When processing the pictures, we take the pixel intensity value at a led position, and check if it is above a threshold. Depending on the outcome we add a 0 or a 1 in that bit position. Do this for all pictures, and we've determined the led code.
 
| Led code | 0 | 1| 2| 3|
|--|--|--|--|--|
| Picture 1 | 0 | 0 | 1 | 1 |
| Picture 0 | 0 | 1 | 0 | 1 |

  

#### Subproblem 1 is hard to solve
Now we still have to solve the problem of finding out where to look for these codes. in other words: which pixels contain a led? This turned out to be a difficult problem, the OpenCV blob detector would be the tool for this job, but it gives a lot of false positives, and results depend heavily on lighting conditions. This was not going to work. 
  
#### Invert the process  
With that many false positives: Why not treat every pixel as a potential led? Instead of taking one pixel value at a specific position, why not try to decode all pixels, and see what comes out of it?
This basically inverts the process. I start with the code I am looking for, and see which pixels correspond to that code. To do this I preprocess the pictures by transforming them to grayscale values in the range  from 0 to 1, subtract a background image, and tweak the intensity/gamma a bit. Now i have a set of images in which pixels belonging to *on* leds are (close to) 1 and *off* leds are (close to) 0. The images are mostly dark, with light spots where the *on* leds for that image are. I call these images the positives. For each positive I create a negative by inverting the pixel values. The negatives are mostly white with dark spots where the *on* leds are. Now I am able find the led I am looking for by multiplying the positives and negatives pixel by pixel. For example, to find led 2 (binary code: 10) I multiply the positive of image 1 with the negative of image 0. The resulting image is an image where only led 2 lights up. The others are canceled out. This process is similar to printing the positives and negatives on transparencies and stacking them on top of each other. When you start with positive 1, you will only see the leds which have bit 1 set. (led 2 and 3). Now if you put the negative of 0 in the stack, it will black out all leds that were 'on' when picture 0 was taken, eliminating led 3 (and 1), leaving us with led 2. The blob detector works flawlessly on resulting image, because only one led shows up.

This method also eliminated the need for a threshold on each image. I simply multiply the pixel values, and the signal gets stronger on each multiplication. This makes the method more robust in difficult lighting conditions. 

I was surprised by how well this works. You will actually get a resulting image where you see only 1 led, clearly, with contour. To get a visual idea of the inner workings you can have a look at this [interactive example](https://yorenschriever.github.io/pixelmapper/?concept). It solves the position of 4 leds, and shows the intermediate states it uses to get to the solution. This example also shows the flaws of the binary encoding scheme, which are discussed in the next chapter. You can also load the first example state to see how this mechanism solves a strand of 50 leds.

####  Line coding  
The algorithm still was not optimal. The results varied. I noticed that codes with a lot of zeros (like 000001) were harder to detect than codes that were balanced (like  010101). The reason for this is that pixels that are *off* are nearly 0, but the background is also nearly 0. So while both images (positive or negative) contribute equally to the signal at the pixels where a led is present, the background pixels are only reduced in value when positive images are used.

A good intuitive example would be the edge case of led 0. This led would get code 0, and therefore be 'off' in all images. Good luck separating that one from the background. (I worked around this edge case by throwing a 'white' image in the stack in which all leds are *on*) 

You can also see the effect in the [example](https://yorenschriever.github.io/pixelmapper/?concept): code 00 is noisiest and code 11 the cleanest. Because codes with lot of zeros contained so much background noise, I wanted to eliminate them.

I also noticed that sometimes leds with similars code also lit up. For example when looking for leds with code 23, 24 and 25, leds 55 56 and 57 would  also be visible in the stacked images, although less bright than the one we were looking for. This reason is that they only differ in 1 bit, and the contrast of the corresponding picture was probably not high enough.

I had to use better codes. After some googling I found out about line coding, and read the ones mentioned on [Wikipedia](https://en.wikipedia.org/wiki/Line_code), with Hamming and 6b8b in particular. Something like this would solve my problems.
I decided to go with a simpler one. I simply brute force all codes that contain an equal number of ones and zeros, and consecutively assign them to the indices. Now i got a scheme where
- **All codes are balanced.** (Equal amount of 1s and 0s).
- **Each code differs in at least 2 bits from another code.** (If you would change one bit,  the code would not be balanced anymore, and be eliminated by the previous point)
- **The code space is relatively dense.** (Highest code divided by highest index is close to 1)  

This turned out to be good enough so i stopped looking further. However, the code is prepared for other encoding schemes if necessary.  
  
The last point is relevant, because how the images are stacked: I use a binary tree to multiply all images: start with the white image, then create 2 branches: one where I multiply with the positive image, and one with the negative image. Then I repeat the branching until I end up with a stack that represents a code. This makes it very memory and cpu efficient, and solves all codes in O(N log N), where N is the highest code value used. (This is why a dense coding scheme is important).

If you are interested you can see the stacked output image by clicking 'show calculated' in the leds menu. I still find it fascinating so see how this highlights exactly the pixel you are looking for.  
  
## Make improvements
You can run the code locally if you want to make changes, add functionality and tweak settings. Pixelmapper is a React project, so getting started is easy:

- Install [NodeJS](https://nodejs.org/en/)  
- `git clone git@github.com:yorenschriever/PixelMapper.git`
- `cd PixelMapper`
- `npm install`
- `npm start`  
  
### Open issues, help to improve  
- **Improve the hybrid phone/desktop interface.** The led menu is trying to be helpful on both types of devices, but arguably this only makes it worse.
- **UX of initial screen.**  It's an ugly beast
- **Improve export .h file**  Current format is not well though out
- **Use colour channels to reduce number of images**
- **Make it work without tripod 1: Stabilisation** 
- **Make it work without tripod 2: Totally different approach** I do not expect that stabilisation will be able to compensate for larger movements. Find something else.
- **Asynchronous capture** Encode timing in the images. Now I use relatively large delays to make sure the data is through the pipeline (wifi transmission, Neopixel transmission, camera buffer), The process currently is: set led data, delay 500ms, take photo, repeat, but this can be done faster: Blast frames asynchronously at 30 fps continuously, take a video, and recover everything later. Reducing the capture time like this would also help with stabilisation.  
- **3d mapping**
- **Typescript for worker** worker is currently written in javascript.
- **Change your project name** You cannot change the name anymore after the initial screen. 
- **Example pattern** Include an example Arduino sketch that displays a simple mapped pattern, so people can quickly test mapping results on the installation
- **Include quartz composer example sketch**
- **Test led button in example sketch** Make the ESP32s button light up all leds. This is useful for debugging your hardware configuration.
- **Store devices config in localstorage.** It is not  unlikely that the next time you will map the same device
- **Detect branches in the binary tree that will not end in a code.** This will speed up the solve process for less dense coding schemes

Suggestions and questions are welcome.
