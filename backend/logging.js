const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const port = 8080;

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/logs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar o bd.");
        throw err;
    }
    console.log("Banco de dados conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS logs (
        datetime DATETIME PRIMARY KEY
        values_json TEXT)`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados.");
        }
    }
);

app.post('/register', (req, res) => {
    db.all(`INSERT INTO logs VALUES (?, ?)`,
        [req.body.datetime, req.body.values_json], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/get-all', (req, res) => {
    db.all(`SELECT * FROM logs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/get/:id', (req, res) => {
    db.all(`SELECT * FROM logs WHERE id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            res.send(bd_res)
        }
    });
});

app.delete('/delete-log/:id', (req, res) => {
    db.all(`DELETE FROM logs where id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            res.send(bd_res)
        }
    });
});

app.listen(port, () =>{
    console.log("Servidor rodando localmente na porta ", port);
});
