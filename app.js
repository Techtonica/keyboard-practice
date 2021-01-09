require("dotenv").config();
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const { setupAuth } = require("./src/server/auth-setup");
const { connectToDb } = require("./src/server/orm");
const { port } = require("./src/server/config");
const favicon = require("serve-favicon");

const app = express();
app.use(morgan("dev")); //morgan gives us useful logging

require("ejs");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/js", express.static(path.resolve("dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + "/public/images/favicon.ico"));

setupAuth(app);
const routes = require("./src/server/routes");
app.use("/", routes);

app.use((_, res) => {
  res.status(404).render("not_found");
});

const startServer = async () => {
  await connectToDb();
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port} :-D`);
  });
};

startServer();

module.exports = app;
