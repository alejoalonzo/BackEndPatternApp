"use strict";

// const env = require("./global");

//conexion entre la base de datos mongobd y la apirest de express
var mongoose = require("mongoose");
mongoose.set("strictQuery", false);

//llamo al servicio
var app = require("./app");
var port = 3700;

//mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
//el path para conectar es mongodb: ip, puerto mongo y nombre de la base de datos

mongoose
  .connect("mongodb://127.0.0.1:27017/Estefania", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    //como el try-catch
    console.log("database conexion ok..");
    //creacion del servidor
    app.listen(port, function () {
      console.log("server is running... Url->127.0.0.1:3700");
    });
  })
  .catch(err => console.log(err));

/*mongoose
  .connect("mongodb://127.0.0.1:27017/portfolio")
  .then(() => {
    console.log("Connection to database is ready...");
  })
  .catch(err => {
    console.log(err);
  });

app.listen(3700, () => {
  console.log("Server is running http://127.0.0.1:3700");
});*/
