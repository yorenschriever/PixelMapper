#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include "SPI.h"

#define SERVICE_UUID "52077e21-e0b5-4b71-950c-2522c81adab0"
#define CHARACTERISTIC_UUID "ad86aa6a-70b7-4291-8943-598258fa2776"

const int dataPin = 5;
const int clkPin = 4;

uint8_t ledon[] = {255, 255, 255};
uint8_t ledoff[] = {0, 0, 0};

uint8_t *buffer = NULL;

SPIClass SPI1(HSPI);

class MyCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *pCharacteristic)
    {
        std::string rxValue = pCharacteristic->getValue();

        if (rxValue.length() < 2)
        {
            Serial.println("Message too short. ignoring.");
            return;
        }

        uint16_t pixelcount = (rxValue[0] << 8) | rxValue[1];
        Serial.printf("Got led data: %d bytes. pixelcount: %d\n", rxValue.length(), pixelcount);

        buffer = (uint8_t*) realloc(buffer, (rxValue.length()-2) * 8 * 3);

        for (int i = 2; i < rxValue.length(); i++)
        {
            for (int j = 0; j < 8; j++)
            {
                bool val = (rxValue[i] & 1 << j) > 0;
                memcpy(buffer + ((i - 2) * 8 + j) * 3, val ? &ledon : &ledoff, 3);
            }
        }

        SPI1.transfer(buffer, pixelcount * 3);
    }
};

void setup()
{
    Serial.begin(115200);
    Serial.println("Starting BLE work!");

    BLEDevice::init("Pixelmapper ESP32");
    BLEDevice::setMTU(517);
    BLEServer *pServer = BLEDevice::createServer();
    BLEService *pService = pServer->createService(SERVICE_UUID);
    BLECharacteristic *pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_WRITE);
    pCharacteristic->setCallbacks(new MyCallbacks());
    pService->start();
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06); // functions that help with iPhone connections issue
    pAdvertising->setMinPreferred(0x12);

    pAdvertising->setMaxPreferred(0x12);

    BLEDevice::startAdvertising();
    Serial.println("Characteristic defined! Now you can read it in your phone!");

    SPI1.begin(clkPin,-1,dataPin);
    SPI1.setClockDivider(SPI_CLOCK_DIV32);
}

void loop()
{
    delay(2000);
}
