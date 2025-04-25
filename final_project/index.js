const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    next();
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Middleware para tratar rotas inexistentes (404)
app.use((req, res) => {
    res.status(404).send(`Página não encontrada!<br> Método: ${req.method} <br> URL requisitada: '${req.originalUrl}'`);
});

app.listen(PORT,()=>console.log("Server is running"));

