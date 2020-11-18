
//based on this lib:
//https://github.com/fhessel/esp32_https_server

// Max clients to be connected to the mapper
#define MAX_CLIENTS 1

#define numstrips 8
const int order[numstrips] =   {4,  1,  3,  2,   8,  6,  5,7};
const int lengths[numstrips] = {150,150,150,100, 100,150,0,0};

#include "cert.h"
#include "private_key.h"

#include <WiFi.h>
#include <ESPmDNS.h>
#include <HTTPSServer.hpp>
#include <SSLCert.hpp>
#include <HTTPRequest.hpp>
#include <HTTPResponse.hpp>
#include <WebsocketHandler.hpp>
#include "neoPixelOutput.h"
#include "password.h"

using namespace httpsserver;


SSLCert cert = SSLCert(
  example_crt_DER, example_crt_DER_len,
  example_key_DER, example_key_DER_len
);
HTTPSServer secureServer = HTTPSServer(&cert, 443, MAX_CLIENTS);

void handleRoot(HTTPRequest * req, HTTPResponse * res);
void handle404(HTTPRequest * req, HTTPResponse * res);

NeopixelOutput<Kpbs800>* pixels[numstrips];

class MapServiceHandler : public WebsocketHandler {
public:
  static WebsocketHandler* create();
  void onMessage(WebsocketInputStreambuf * input);
  void onClose();
};

MapServiceHandler* activeClients[MAX_CLIENTS];

void setup() {
  // Initialize the slots
  for(int i = 0; i < MAX_CLIENTS; i++) activeClients[i] = nullptr;

  Serial.begin(115200);

  // Connect to WiFi
  Serial.println("Setting up WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PSK);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.print("Connected. IP=");
  Serial.println(WiFi.localIP());

//  WiFi.softAP("Mapper","mapper123");
//  IPAddress IP = WiFi.softAPIP();
//  Serial.print("AP IP address: ");
//  Serial.println(IP);

  // For every resource available on the server, we need to create a ResourceNode
  // The ResourceNode links URL and HTTP method to a handler function
  ResourceNode * nodeRoot    = new ResourceNode("/", "GET", &handleRoot);
  ResourceNode * node404     = new ResourceNode("", "GET", &handle404);

  secureServer.registerNode(nodeRoot);
  WebsocketNode * chatNode = new WebsocketNode("/map", &MapServiceHandler::create);
  secureServer.registerNode(chatNode);
  secureServer.setDefaultNode(node404);

  Serial.println("Starting server...");
  secureServer.start();
  if (secureServer.isRunning()) {
    Serial.print("Server ready. Open the following URL in multiple browser windows to start mapping: https://");
    Serial.println(WiFi.localIP());
  }

  MDNS.begin("pixelmapper");

  for (int i=0; i<numstrips; i++){

    pixels[i] = new NeopixelOutput<Kpbs800>(order[i]);
    pixels[i]->Begin();
    pixels[i]->SetLength(lengths[i]*3);
    pixels[i]->Clear();
    pixels[i]->Show();
    
  }

}

void MapServiceHandler::onMessage(WebsocketInputStreambuf * inbuf) {
    std::istreambuf_iterator<char, std::char_traits<char> > iter (inbuf);
    const std::istreambuf_iterator<char,std::char_traits<char> > end;

    Serial.printf("got message\n");

    // output the content of the file
    int i=0;
    int activestrip=0;
    int posinstrip=0;
    uint8_t data[3];
    while (!iter.equal (end)) {
        char val = *iter++;

        data[0]=val;
        data[1]=val;
        data[2]=val;
        
        pixels[activestrip]->SetData(data, 3, posinstrip*3);
        
        posinstrip++;
        if (posinstrip >= lengths[activestrip]){
          do {
            activestrip++;
          } while(lengths[activestrip] == 0);
          posinstrip=0;
          if (activestrip >= numstrips) break;
        }
    }

  for (int i=0;i<numstrips;i++){
    pixels[i]->Show();
  }
  delay(100);
  
//  for (int i=0;i<numstrips;i++){
//    pixels[i]->Show();
//  }
//  delay(100);
  
  //delay(150);//give some time to update the leds and to wait for a new frame on the camera
  
  for(int i = 0; i < MAX_CLIENTS; i++) {
    if (activeClients[i] != nullptr) {
      activeClients[i]->send("OK", SEND_TYPE_TEXT);
    }
  }
}













void loop() {
  secureServer.loop();
  delay(1);
}


// In the create function of the handler, we create a new Handler and keep track
// of it using the activeClients array
WebsocketHandler * MapServiceHandler::create() {
  Serial.println("Creating new chat client!");
  MapServiceHandler * handler = new MapServiceHandler();
  for(int i = 0; i < MAX_CLIENTS; i++) {
    if (activeClients[i] == nullptr) {
      activeClients[i] = handler;
      break;
    }
  }
  return handler;
}

// When the websocket is closing, we remove the client from the array
void MapServiceHandler::onClose() {
  for(int i = 0; i < MAX_CLIENTS; i++) {
    if (activeClients[i] == this) {
      activeClients[i] = nullptr;
    }
  }
}

const char* OKSTR = "OK";



void handleRoot(HTTPRequest * req, HTTPResponse * res) {
  res->setHeader("Content-Type", "text/html");
  res->print(
    "<!DOCTYPE HTML>\n"
    "<html>\n"
    "   <head>\n"
    "   <title>Hyperion mapper client</title>\n"
    "</head>\n"
    "<body>\n"
    "If you can read this, the certificate is accepted\n"
    "</body>\n"
    "</html>\n"
  );
}

void handle404(HTTPRequest * req, HTTPResponse * res) {
  req->discardRequestBody();
  res->setStatusCode(404);
  res->setStatusText("Not Found");
  res->setHeader("Content-Type", "text/html");
  res->println("<!DOCTYPE html>");
  res->println("<html>");
  res->println("<head><title>Not Found</title></head>");
  res->println("<body><h1>404 Not Found</h1><p>The requested resource was not found on this server.</p></body>");
  res->println("</html>");
}

