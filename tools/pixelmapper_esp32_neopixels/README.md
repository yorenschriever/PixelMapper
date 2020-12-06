# Pixelmapper ESP32 Neopixels Websocket

## Get started

1. Install [Arduino IDE](https://www.arduino.cc/en/software)  
2. Get the [ESP32 core](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/) 
3. Get [ESP32 HTTPS Server library](https://github.com/fhessel/esp32_https_server#arduino-ide).

4. Open the [Arduino sketch](https://github.com/yorenschriever/PixelMapper/tree/master/tools/pixelmapper_esp32_neopixels) from the tool folder. Create a file "password.h", and add your wifi credentials like this:

```
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PSK "YOUR_PASSWORD"
```

5. Now you need to create a self signed certificate for your ESP32. Instructions for that are in the [ESP32 HTTPS Server](https://github.com/fhessel/esp32_https_server) library. Copy the generated the private_key.h and cert.h to the sketch folder to replace the existing ones.

6. Upload the sketch to the ESP32. Then open the serial port so see if it can connect to the network. After it's connected it will print its IP address. 

7. Use your phone to go to https://[ip of the esp]. This will test if your phone and ESP32 are on the same network and can find each other. It will also trigger a screen where you can accept the self-signed certificate of the esp. (You know the drill: "This certificate is not trusted" -> More info -> Continue anyway). You need to accept the certificate here to establish the websocket connection later on. This step can be slow.

8. Open [Pixelmapper](https://yorenschriever.github.io/pixelmapper/). Fill in the ip address and number of leds, and wait for a connection. When connected, all leds 
should flash at a stable 1Hz to indicate a good connection.

9. From here the steps are the same as for the BLE sketch. See [Pixelmapper project readme](https://github.com/yorenschriever/PixelMapper/tree/master/)


