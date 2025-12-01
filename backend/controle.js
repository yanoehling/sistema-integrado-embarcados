const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const PORT = 8000;

const cors = require("cors");
app.use(cors());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/configs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd 'configs'.");
        throw err;
    }
    console.log("Banco de dados 'configs' criado/conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        max_distance_cm INTEGER check(max_distance_cm > 1),
        min_delay_ms INTEGER check(min_delay_ms > 10),
        max_delay_ms INTEGER check(max_delay_ms > 20),
        light_on BOOLEAN,
        sound_on BOOLEAN
        )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados 'configs'.");
        }
    }
);

app.post('/controle/add-config', (req, res) => {
    db.run(`INSERT INTO configs (max_distance_cm, min_delay_ms, max_delay_ms, light_on, sound_on)
            VALUES (?, ?, ?, ?, ?)`,
        [req.body.max_distance_cm, req.body.min_delay_ms, req.body.max_delay_ms, req.body.light_on, req.body.sound_on],
        (err, bd_res) => {
        if (err){
            return res.status(400).send("Erro ao adicionar configuração.");
        } else {
            return res.status(201).send("Config dicionada com sucesso");
        }
    });
});

app.get('/controle/get-all', (req, res) => {
    db.all(`SELECT * FROM configs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao obter configurações.");
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/controle/get/:id', (req, res) => {
    db.get(`SELECT * FROM configs WHERE id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao obter configuração.");       // linha 58 <-- alterado
        } else {
            if (!bd_res) {
                return res.status(404).send("Configuração não encontrada.");  // linha 60 <-- alterado
            }
            res.send(bd_res);
        }
    });
});

app.delete('/controle/delete-config/:id', (req, res) => {
    db.run(`DELETE FROM configs where id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao deletar configuração.");
        } else {
            return res.status(200).send("Config deletada com sucesso");
        }
    });
});

app.listen(PORT, "0.0.0.0", () =>{
    console.log("Servidor 'controle' rodando localmente na porta ", PORT);
});
