# Requirements:
## Para o backend:
npm install express sqlite3 body-parser cors express-http-proxy morgan

## Para o frontend:
npm install (geral)

## Para o esp32:
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
(baixados no arduino IDE)



# Instrução para rodar:
## Na pasta backend:
node api-gateway.js
node controle.js
node config-atual.js
node logging.js

## Na pasta frontend:
npx expo start

## Embarcado (esp32):
Mudar apenas ip para o da máquina local, adicionar o código na placa via IDE (Arduino IDE) e deixar rodando.
