const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const body_parser = require('body-parser');
const port = 8000;

const cors = require("cors");
app.use(cors());

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

var db = new sqlite3.Database('./dbs/configs.db', (err) =>{
    if(err){
        console.log("Não foi possível criar/conectar com o bd.");
        throw err;
    }
    console.log("Banco de dados criado/conectado com sucesso.");
});

db.run(`CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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

app.post('/controle/add-config', (req, res) => {
    db.run(`INSERT INTO configs (max_distance, min_delay, max_delay, light_on, sound_on)
            VALUES (?, ?, ?, ?, ?)`,
        [req.body.max_distance, req.body.min_delay, req.body.max_delay, req.body.light_on, req.body.sound_on],
        (err, bd_res) => {
        if (err){
            return res.status(400).send("erro: ", err);
        } else {
            return res.status(200).send("Adicionado com sucesso");
        }
    });
});

app.get('/controle/get-all', (req, res) => {
    db.all(`SELECT * FROM configs`, [], (err, bd_res) => {
        if (err){
            console.log("erro: ", err);
        } else {
            res.send(bd_res);
        }
    });
});

app.get('/controle/get/:id', (req, res) => {
    db.get(`SELECT * FROM configs WHERE id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            res.send(bd_res)
        }
    });
});

app.delete('/controle/delete-config/:id', (req, res) => {
    db.run(`DELETE FROM configs where id = ?`, [req.params.id], (err, bd_res) => {
        if (err){
            console.log("erro: ", err)
        } else {
            res.send("Deletado com sucesso")
        }
    });
});

app.listen(port, "0.0.0.0", () =>{
    console.log("Servidor rodando localmente na porta ", port);
});
