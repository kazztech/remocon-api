const HOST = "0.0.0.0";
const PORT = 3000;

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const v1Router = require("./router/v1");
const errorHandler = require("./middlewares/error");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(errorHandler);

app.get("/", (req, res) => {
    res.render("index", {});
});

app.use("/api/v1/", v1Router);

const server = app.listen(PORT, HOST, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`api listen ${host}:${port}`);
});