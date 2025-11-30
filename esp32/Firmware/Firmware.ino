#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// // --- Pines ESP32 ---
// #define TRIG_PIN  5     // escolha pinos válidos para PWM e IO
// #define ECHO_PIN  18
// #define BUZZER_PIN  23
// #define LED_PIN  2      // LED externo (não é o LED onboard)

struct Config {
    int max_distance;
    int min_delay;
    int max_delay;
    bool light_on;
    bool sound_on;
    bool sucesso; // flag pra ver se a busca deu certo
};

const char* ssid = "NAMASTE"; // "y a n"
const char* password = "Cambirela502"; // "esqueite"

String NOTEBOOK_IP = "http://192.168.15.124:5000";

void setup() {
    Serial.begin(9600);

    // // pinos
    // pinMode(TRIG_PIN, OUTPUT);
    // pinMode(ECHO_PIN, INPUT);
    // pinMode(BUZZER_PIN, OUTPUT);
    // pinMode(LED_PIN, OUTPUT);
    // digitalWrite(TRIG_PIN, LOW);

    //wifi
    WiFi.begin(ssid, password);
    Serial.print("Conectando ao WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConectado! IP do ESP32: ");
    Serial.println(WiFi.localIP());
}

Config buscarDados() {
    Config config; //cria a struct
    config.sucesso = false; //flag

    if(WiFi.status() == WL_CONNECTED){
        HTTPClient http;
        http.begin(NOTEBOOK_IP + "/controle/get/2"); // get config
        int httpResponseCode = http.GET();

        if (httpResponseCode > 0) {
            String response_str = http.getString(); // resposta

            JsonDocument json;
            DeserializationError error = deserializeJson(json, response_str); // tenta transformar em json

            if (!error){
                config.max_distance = json["max_distance"];
                config.min_delay = json["min_delay"];
                config.max_delay = json["max_delay"];
                config.light_on = json["light_on"];
                config.sound_on = json["sound_on"];
                config.sucesso = true; //flag
            } else {
                Serial.print("Erro JSON: ");
                Serial.println(error.c_str());
            }
        } else {
            Serial.print("Erro HTTP: ");
            Serial.println(httpResponseCode);
        }
        http.end();
    } else {
        Serial.println("Wifi não conectado.");
    }
    return config;
}

// --- Função para medir distância ---
// long calculaDistanciaSonic() {
//     // pulso no TRIG
//     digitalWrite(TRIG_PIN, LOW);
//     delayMicroseconds(4);
//     digitalWrite(TRIG_PIN, HIGH);
//     delayMicroseconds(10);
//     digitalWrite(TRIG_PIN, LOW);
//     // retorno no ECHO
//     long duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout 30ms = 5m
//     // converte microsegundos pra centímetros
//     long distance = duration * 0.034 / 2;
//     return distance;
// }



void loop() {
    Config config_atual = buscarDados();

    if (config_atual.sucesso) {
        Serial.println("--- config RECEBIDA ---");
    
        Serial.print("Max Distance: ");
        Serial.println(config_atual.max_distance);

        Serial.print("Min Delay: ");
        Serial.println(config_atual.min_delay);
        
        Serial.print("Luz Ligada: ");
        Serial.println(config_atual.light_on ? "Sim" : "Nao"); // Truque para imprimir bool bonito

    } else {
        Serial.println("Erro ao buscar dados (ou WiFi off).");
    }
    delay(10000);

    // long sonic_dist = calculaDistanciaSonic();

    // Serial.print("Distância: ");
    // Serial.print(sonic_dist);
    // Serial.println(" cm");

    // // cálculo de sensibilidade de acordo com a distância
    // int sensibilidade = (sonic_dist * 20) / 4;
    // if (sensibilidade < 10) {
    //     sensibilidade = 10;
    // }

    // // sinais de alerta
    // if (sonic_dist > 30 || sonic_dist == 0) {
    //     // Longe ou sem leitura
    //     noTone(BUZZER_PIN);
    //     digitalWrite(LED_PIN, LOW);

    // } else if (sonic_dist > 2.5) {
    //     // Distância média - sinal de acordo com a distãncia
    //     tone(BUZZER_PIN, 440);
    //     digitalWrite(LED_PIN, HIGH);
    //     delay(sensibilidade);

    //     noTone(BUZZER_PIN);
    //     digitalWrite(LED_PIN, LOW);
    //     delay(sensibilidade);

    // } else {
    //     // Muito perto - apito contínuo
    //     tone(BUZZER_PIN, 220);
    //     digitalWrite(LED_PIN, HIGH);
    // }
}
