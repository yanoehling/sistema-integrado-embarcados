const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const port = 8040;

const cors = require("cors");
app.use(cors());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/config_atual.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd.");
        throw err;
    }
    console.log("Banco de dados criado/conectado com sucesso.");
});


db.run(`CREATE TABLE IF NOT EXISTS config_atual (
        id INTEGER PRIMARY KEY,
        max_distance INTEGER check(max_distance > 1),
        min_delay INTEGER check(min_delay > 10),
        max_delay INTEGER check(max_delay > 20),
        light_on BOOLEAN,
        sound_on BOOLEAN
        )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados.");
        }
    }
);

var nova_config_aplicada = true;

app.post('/config-atual/aplica-config', (req, res) => {
    db.run(`DELETE * FROM config_atual`, [], (err, bd_res) => {
        if (err){
            return res.status(400).send("erro: ", err);
        }
    });
    db.run(`INSERT INTO config_atual (max_distance, min_delay, max_delay, light_on, sound_on)
            VALUES (?, ?, ?, ?, ?)`,
        [req.body.max_distance, req.body.min_delay, req.body.max_delay, req.body.light_on, req.body.sound_on],
        (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            return res.status(200).send("Config Aplicada");
        }
    });
    nova_config_aplicada = true;
});

app.get('/config-atual/pega-config-atual', (req, res) => {
    if(nova_config_aplicada){
        db.all(`SELECT * FROM config_atual`, [], (err, bd_res) => {
            if (err){
                console.log("erro: ", err);
            } else {
                res.send(bd_res[0]);
            }
        });
        nova_config_aplicada = false;
    } else {
        res.send(null);
    }
});

app.listen(port, "0.0.0.0", () =>{
    console.log("Servidor rodando localmente na porta ", port);
});
