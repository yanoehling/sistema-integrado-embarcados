#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Pinos ESP32 ---
#define TRIG_PIN  5    
#define ECHO_PIN  18
#define BUZZER_PIN  23
#define LED_PIN  2    

struct Config {
    int max_distance;
    int min_delay;
    int max_delay;
    bool light_on;
    bool sound_on;
    bool sucesso; // flag pra ver se a busca deu certo
    bool config_nova;
};

const char* ssid = "NAMASTE"; // "y a n"
const char* password = "Cambirela502"; // "esqueite"

String NOTEBOOK_IP = "http://192.168.15.124:5000";
Config config_atual;
bool muito_proximo = false;

void setup() {
    Serial.begin(9600);

    // pinos
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(TRIG_PIN, LOW);

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

Config buscaConfigAtualDaAPI() {
    Config config; //cria a struct
    config.sucesso = false; //flags

    if(WiFi.status() == WL_CONNECTED){
        HTTPClient http;
        http.begin(NOTEBOOK_IP + "/config-atual/pega-config-atual"); // get config
        int httpResponseCode = http.GET();

        if (httpResponseCode > 0) {
            String response_str = http.getString(); // resposta

            if (response_str == "false") { //se não houver mudança de config e a api retornar apenas false ao invés de json
                config.config_nova = false;
                config.sucesso = true;
                http.end();
                return config; 
            }
            JsonDocument json;
            DeserializationError error = deserializeJson(json, response_str); // tenta transformar em json

            if (!error){
                config.max_distance = json["max_distance"];
                config.min_delay = json["min_delay"];
                config.max_delay = json["max_delay"];
                config.light_on = json["light_on"];
                config.sound_on = json["sound_on"];
                config.sucesso = true; //flags
                config.config_nova = true;
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


// void enviaLogs() {
//     if(WiFi.status() == WL_CONNECTED){
//         HTTPClient http;

//         http.begin(NOTEBOOK_IP + "/logging/register");
//         http.addHeader("Content-Type", "application/json"); // enviando JSON

//         JsonDocument doc; // documento JSON

//         for(int i = 0; i < 5; i++){
//             doc.add(random(0, 10)); // Adiciona ao array do JSON
//         }
//         String jsonOutput;
//         serializeJson(doc, jsonOutput); // converte o JSON para string

//         Serial.println("Enviando: " + jsonOutput); 

//         int httpResponseCode = http.POST(jsonOutput); //post

//         if(httpResponseCode > 0){
//             String response = http.getString();
//             Serial.print("Log enviado - resposta do servidor: ");
//             Serial.println(response);
//         } else {
//             Serial.print("Erro no envio do Log: ");
//             Serial.println(httpResponseCode);
//         }
//         http.end(); 
//     } else {
//         Serial.println("WiFi desconectado. Não foi possível enviar log.");
//     }
// }

// --- Função para medir distância ---
long calculaDistanciaSonic() {
    // pulso no TRIG
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(4);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    // retorno no ECHO
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout 30ms = 5m
    // converte microsegundos pra centímetros
    long distance = duration * 0.034 / 2;
    return distance;
}



void loop() {
    delay(10); 
    if (!muito_proximo){ // se estiver muito proximo (apito constante) cancela as requests até que se fique mais distante
        Config possivel_config_nova = buscaConfigAtualDaAPI();
        
        if (possivel_config_nova.sucesso) {
            if (possivel_config_nova.config_nova){  //printa apenas se chegar dados de config novos
                config_atual = possivel_config_nova;
                Serial.println();
                Serial.println("--- NOVA CONFIG APLICADA ---");
                Serial.print("Distância máxima: ");
                Serial.print(config_atual.max_distance);
                Serial.print(";  Delay Mínimo: ");
                Serial.print(config_atual.min_delay);
                Serial.print(";  Delay Máximo: ");
                Serial.print(config_atual.max_delay);
                Serial.print(";  Luz Ligada: ");
                Serial.print(config_atual.light_on ? "Sim" : "Não"); 
                Serial.print(";  Som Ligado: ");
                Serial.println(config_atual.sound_on ? "Sim" : "Não"); 
                Serial.println(); 
            } else {
                Serial.println("Config não modificada.");
            }
        } else {
            Serial.println("Erro ao buscar dados atualizados.");
        }
    }

    long distancia = calculaDistanciaSonic();
    Serial.print("Distância: ");
    Serial.print(distancia);
    Serial.println(" cm");

    // cálculo de delay de acordo com a config
    int delay_por_cm = abs(config_atual.max_delay - config_atual.min_delay) / config_atual.max_distance;
    int delay_time = config_atual.min_delay + (distancia * delay_por_cm);

    if (distancia < 2.5){ // muito perto - apito contínuo
        muito_proximo = true; // cancela as requests até que se fique mais distante
        tone(BUZZER_PIN, 440);
        digitalWrite(LED_PIN, HIGH);
    }

    else if (distancia > config_atual.max_distance || distancia == 0) { // Se maior q a distancia maxima, ou sem leitura
        noTone(BUZZER_PIN);
        digitalWrite(LED_PIN, LOW);
        delay(500); // espera um pouco pra não fazer muuitos requests quando não estiver sendo utilizado

    } else { // sinal de acordo com a distãncia
        muito_proximo = false;
        if (config_atual.sound_on){
            tone(BUZZER_PIN, 440);
        } 
        if (config_atual.light_on){
            digitalWrite(LED_PIN, HIGH);
        }
        delay(delay_time);

        noTone(BUZZER_PIN);
        digitalWrite(LED_PIN, LOW);
        delay(delay_time);
    } 
}
