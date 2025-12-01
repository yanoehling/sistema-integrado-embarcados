const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const cors = require("cors");
app.use(cors());
const port = 8080;

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/logs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd.");
        throw err;
    }
    console.log("Banco de dados criado/conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datetime DATETIME,
        values_json_cms TEXT,
        tempo_leitura_s FLOAT
        )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados.");
        }
    }
);

app.post('/logging/register', (req, res) => {
    db.run(`INSERT INTO logs (datetime, values_json_cms, tempo_leitura_s) VALUES (?, ?, ?)`,
        [new Date().toISOString(), JSON.stringify(req.body.values_json_cms), req.body.tempo_leitura_s],
        (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            return res.status(200).send("Log dicionado com sucesso");
        }
    });
});

app.get('/logging/get-all', (req, res) => {
    db.all(`SELECT * FROM logs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.delete('/logging/limpar-tudo', (req, res) => {
    db.run(`DELETE FROM logs`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            return res.status(200).send("Logs limpados com sucesso");
        }
    });
});

app.listen(port, "0.0.0.0", () =>{
    console.log("Servidor rodando localmente na porta ", port);
});
