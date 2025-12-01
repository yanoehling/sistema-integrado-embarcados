const httpProxy = require("express-http-proxy");
const express = require("express");
const app = express();
var logger = require("morgan");

const PORT = 5000;
app.use(logger('dev'));

function selecionarMicrosservico(req){
    if (req.path.startsWith('/controle')){
        return 'http://localhost:8000';
    } else if (req.path.startsWith('/config-atual')){
        return 'http://localhost:8040';
    } else if (req.path.startsWith('/logging')){
        return 'http://localhost:8080'
    } else {
        return null;
    }
};

app.use((req, res, next) => {
    var microsservico = selecionarMicrosservico(req);
    if (microsservico == null){
        return res.status(404).send('Microsserviço não encontrado.');
    } else {
        return httpProxy(microsservico, {
            proxyReqPathResolver: req => req.originalUrl,

            proxyErrorHandler: (err, res, next) => {
                if (err && err.code === 'ECONNREFUSED') {
                    res.status(502).send('Microsserviço indisponível.');
                } else {
                    res.status(500).send('Erro interno no proxy.');
                }
            }
        })(req, res, next);
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log('API Gateway iniciado na porta ', PORT);
});
