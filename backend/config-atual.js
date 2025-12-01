const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const PORT = 8040;

const cors = require("cors");
app.use(cors());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/config_atual.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd 'config_atual'.");
        throw err;
    }
    console.log("Banco de dados 'config_atual' criado/conectado com sucesso.");
});


db.run(`CREATE TABLE IF NOT EXISTS config_atual (
        id INTEGER PRIMARY KEY,
        max_distance_cm INTEGER check(max_distance_cm > 1),
        min_delay_ms INTEGER check(min_delay_ms > 10),
        max_delay_ms INTEGER check(max_delay_ms > 20),
        light_on BOOLEAN,
        sound_on BOOLEAN
        )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados 'config_atual'.");
        }
    }
);

var nova_config_aplicada = true;

app.post('/config-atual/aplica-config', (req, res) => {
    db.run(`DELETE FROM config_atual`, [], (err, bd_res) => {
        if (err){
            console.log("erro ao deletar config antiga: ", err);
            return res.status(500).send("Erro ao limpar config antiga."); 
        }
        db.run(`INSERT INTO config_atual (max_distance_cm, min_delay_ms, max_delay_ms, light_on, sound_on)
            VALUES (?, ?, ?, ?, ?)`,
            [req.body.max_distance_cm, req.body.min_delay_ms, req.body.max_delay_ms, req.body.light_on, req.body.sound_on],
            (err, bd_res) => {
                if (err){
                    console.log("erro: ", err);
                    return res.status(500).send("Erro ao salvar nova config.");
                } else {
                    nova_config_aplicada = true;
                    return res.status(200).send("Config Aplicada");
                }
            }
        );
    });
});

app.get('/config-atual/pega-config-atual', (req, res) => {
    if(nova_config_aplicada){
        db.all(`SELECT * FROM config_atual`, [], (err, bd_res) => {
            if (err){
                console.log("erro: ", err);
                return res.status(500).send("Erro ao buscar configuração atual.");
            } else {
                if (!bd_res || bd_res.length === 0) {
                    return res.status(404).send("Nenhuma configuração encontrada.");
                }
                res.send(bd_res[0]);
            }
        });
        nova_config_aplicada = false;
    } else {
        res.send(false);
    }
});

app.listen(PORT, "0.0.0.0", () =>{
    console.log("Servidor 'config-atual' rodando localmente na porta ", PORT);
});
