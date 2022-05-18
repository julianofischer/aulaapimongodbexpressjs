var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var gamesRouter = require('./routes/games');
var devsRouter = require('./routes/devs');
var md5 = require('md5');
const db = require('./db.js');

var app = express();

/*var bodyparser = require("body-parser");
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LogRocket Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LogRocket",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var senha = "123456";
//var timestamp = '1652749876466'

app.use(async (req, res, next) => {
  let _, token;
  let login = req.body.login;
  let timestamp = req.body.timestamp;
  if(req.headers.authorization){
    [_, token] = req.headers.authorization.split(" ");
  }else{
    return res.status(403).json({erro: "Falha de autenticação"})
  }

  const conn = await db.connect();
  const usuarios = conn.collection("users");
  const doc = await usuarios.findOne({ "login": login });
  console.log(doc);

  if(!doc){
    return res.status(403).json({erro: "Usuário não existe"})
  }

  const token_g = md5(`${timestamp}${doc.pwd}`);
  if (token_g === token) {
    next();
  }else{
    return res.status(403).json({erro: "Falha de autenticação"})
  }
});

app.use('/', indexRouter);
app.use('/games', gamesRouter);
app.use('/devs', devsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
