const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const port = 8000;

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/configs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar o bd.");
        throw err;
    }
    console.log("Banco de dados conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        light_on BOOLEAN,
        sound_on BOOLEAN,
        sensibility INTEGER )`,
    [], (err) => {
        if (err){
            console.log("Erro na conexão/criação do banco de dados.");
        }
    }
);

app.post('/add-config', (req, res) => {
    db.all(`INSERT INTO configs VALUES (?, ?, ?)`,
        [req.body.light_on, req.body.sound_on, req.body.sensibility], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/get-all', (req, res) => {
    db.all(`SELECT * FROM configs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/get/:id', (req, res) => {
    db.all(`SELECT * FROM configs WHERE id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            res.send(bd_res)
        }
    });
});

app.delete('/delete-config/:id', (req, res) => {
    db.all(`DELETE FROM configs where id = ?`, [req.params.id], (err, bd_res) => {
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
