#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Pinos ESP32
#define TRIG_PIN  5
#define ECHO_PIN  18
#define BUZZER_PIN  23
#define LED_PIN  2

struct Config { // estrutura da configuracao e flags
    unsigned int max_distance_cm;
    unsigned int min_delay_ms;
    unsigned int max_delay_ms;
    bool light_on;
    bool sound_on;
    bool sucesso; // flag pra saber se a busca deu certo
    bool config_nova; // flag pra saber se é uma nova config ou a mesma de antes
};

const char* ssid = "y a n"; // "y a n"
const char* password = "esqueite"; // "esqueite"

// String NOTEBOOK_IP = "http://192.168.0.55:5000"; // note do Raiden wifi de casa
// String NOTEBOOK_IP = "http://192.168.15.124:5000";  // note do Yan wifi de casa
String NOTEBOOK_IP = "http://10.243.28.142:5000";  // note do Yan no 4g do celular


Config config_atual;
std::vector<int> log_leituras;
unsigned long tempo_inicial_ms = 0;
bool boot_recem_feito = true;


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
                config.max_distance_cm = json["max_distance_cm"];
                config.min_delay_ms = json["min_delay_ms"];
                config.max_delay_ms = json["max_delay_ms"];
                config.light_on = json["light_on"];
                config.sound_on = json["sound_on"];
                config.sucesso = true; //flags
                config.config_nova = true;
                tone(BUZZER_PIN, 660); // "avisa" a mudança
                delay(500);
                noTone(BUZZER_PIN); 
                delay(1000);
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


void enviaLogLeituras(std::vector<int> lista_de_leituras, int tempo_leitura_ms) {
    if(WiFi.status() == WL_CONNECTED){
        HTTPClient http;

        http.begin(NOTEBOOK_IP + "/logging/register");
        http.addHeader("Content-Type", "application/json");

        JsonDocument request_json; // cria o json e os campos de log e de tempo
        float tempo_leitura_s = tempo_leitura_ms;
        request_json["tempo_leitura_s"] = tempo_leitura_s/1000;
        JsonArray arrayValores = request_json["values_json_cms"].to<JsonArray>();

        for(int v: lista_de_leituras){ // add os valores da lista no json
            arrayValores.add(v);
        }

        String jsonOutput;
        serializeJson(request_json, jsonOutput); // deixa como texto para enviar por HTTP

        Serial.println();
        Serial.print("Enviando JSON para o logging na API: ");
        Serial.println(jsonOutput); 

        int httpResponseCode = http.POST(jsonOutput); // dá o post

        if(httpResponseCode > 0){
            String response = http.getString();
            Serial.print("Resposta: ");
            Serial.println(response);
            Serial.println();
        } else {
            Serial.print("Erro POST: ");
            Serial.println(httpResponseCode);
            Serial.println();
        }
        http.end(); 
    } else {
        Serial.println("WiFi desconectado.");
        Serial.println();
    }
    Serial.print("Distâncias lidas (cms): ");
}


long calculaDistanciaSonic() { // função para o sensor medir a distância
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
    Config possivel_config_nova = buscaConfigAtualDaAPI();
    
    if (possivel_config_nova.sucesso) {
        if (possivel_config_nova.config_nova){  //printa se chegarem dados de config novos
            boot_recem_feito = false;
            config_atual = possivel_config_nova;
            config_atual.config_nova = false;

            delay(1000);
            Serial.println();
            Serial.println();
            Serial.println("--- NOVA CONFIG APLICADA ---");
            Serial.print("Distância máxima: ");
            Serial.print(config_atual.max_distance_cm);
            Serial.print(";  Delay Mínimo: ");
            Serial.print(config_atual.min_delay_ms);
            Serial.print(";  Delay Máximo: ");
            Serial.print(config_atual.max_delay_ms);
            Serial.print(";  Luz Ligada: ");
            Serial.print(config_atual.light_on ? "Sim" : "Não"); 
            Serial.print(";  Som Ligado: ");
            Serial.println(config_atual.sound_on ? "Sim" : "Não"); 
            Serial.println(); 
            
        } else if (boot_recem_feito){
            Serial.println("APLIQUE UMA CONFIGURAÇÃO.");
        } 
    } else {
        Serial.println("Erro ao buscar dados atualizados.");
    }

    if (log_leituras.size() == 0){ // se a lista de logs estiver vazia, registra tempo de inicio de leitura
        tempo_inicial_ms = millis();
    }

    long distancia_cms = calculaDistanciaSonic(); // sensor calcula distancia
    if (possivel_config_nova.config_nova || boot_recem_feito){
        Serial.print("Distâncias lidas (cms): ");
    }
    Serial.print(distancia_cms);
    Serial.print("; ");

    if (distancia_cms <= config_atual.max_distance_cm && !boot_recem_feito){
        log_leituras.push_back(distancia_cms); // adiciona na lista de logs se estiver dentro da distancia maxima e depois de aplicar config
    }

    if (log_leituras.size() >= 20){ // se derem 20 leituras, calcula o tempo que se passou, envia o log pra API e limpa a lista
        unsigned long tempo_percorrido = millis() - tempo_inicial_ms;
        enviaLogLeituras(log_leituras, tempo_percorrido);
        log_leituras.clear();
    }

    // cálculo de delay de acordo com a config
    int delay_por_cm = (config_atual.max_delay_ms - config_atual.min_delay_ms) / config_atual.max_distance_cm;
    int delay_time = config_atual.min_delay_ms + (distancia_cms * delay_por_cm);

    if (distancia_cms > config_atual.max_distance_cm || distancia_cms == 0) { // Se maior q a distancia maxima, ou sem leitura
        noTone(BUZZER_PIN);
        digitalWrite(LED_PIN, LOW);
        delay(500); // espera um pouco pra não fazer muuitos requests quando não estiver sendo utilizado
    } else { // sinal de acordo com a distancia
        if (config_atual.sound_on){ // buzz só se sound_on
            tone(BUZZER_PIN, 440);
        } 
        if (config_atual.light_on){ // led só se light_on
            digitalWrite(LED_PIN, HIGH);
        }
        delay(delay_time);

        noTone(BUZZER_PIN); // desliga som e luz
        digitalWrite(LED_PIN, LOW);
        delay(delay_time);
    } 
}
