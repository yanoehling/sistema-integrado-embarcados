const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const cors = require("cors");
app.use(cors());
const PORT = 8080;

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/logs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd 'logs'.");
        throw err;
    }
    console.log("Banco de dados 'logs' criado/conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datetime DATETIME,
        values_json_cms TEXT,
        tempo_leitura_s FLOAT
        )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados 'logs'.");
        }
    }
);

app.post('/logging/register', (req, res) => {
    db.run(`INSERT INTO logs (datetime, values_json_cms, tempo_leitura_s) VALUES (?, ?, ?)`,
        [new Date().toISOString(), JSON.stringify(req.body.values_json_cms), req.body.tempo_leitura_s],
        (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao registrar log.");
        } else {
            return res.status(201).send("Log adicionado com sucesso");
        }
    });
});

app.get('/logging/get-all', (req, res) => {
    db.all(`SELECT * FROM logs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao obter logs.");
        } else {
            res.send(bd_res);
        }
    });
});

app.delete('/logging/limpar-tudo', (req, res) => {
    db.run(`DELETE FROM logs`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
            return res.status(500).send("Erro ao limpar logs.");
        } else {
            return res.status(200).send("Logs limpados com sucesso");
        }
    });
});

app.listen(PORT, "0.0.0.0", () =>{
    console.log("Servidor rodando localmente na porta ", PORT);
});
