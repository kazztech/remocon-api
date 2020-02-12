const express = require("express");
const router = express.Router();

const { PythonShell } = require("python-shell");
const { check, validationResult } = require("express-validator/check");

const db = require("../../models");
const ERROR = require("./commons/errors");
const CONF = require("./commons/config");
require("./commons/formats");



// CORS許可
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});


// ドキュメント
router.get("/", (req, res) => {
    res.render("v1/index", {});
});

// リモコン
router.use("/remocons", require("./remocons"));
// ウィジェット
router.use("/", require("./widgets"));
// 一括処理
router.use("/batches", require("./batches"));


// 読み取った赤外線の内容を返す
router.get("/ir-read", [], (req, res) => {
    // 赤外線受信オプション
    const options = {
        mode: "text",
        pythonPath: CONF.PYTHON_ENV_PATH,
        pythonOptions: ["-u"],
        scriptPath: CONF.PYTHON_SCRIPTS_PATH,
        args: ["-r", "-g" + CONF.GPIO_IN, "-f", "20", "--no-confirm", "--post", "150", "ir"]
    };
    // 赤外線受信スクリプト
    PythonShell.run("irrp.py", options, (err, result) => {
        if (err) {
            return res.json(responsePropsFormat(
                ERROR.FAILD_EXECUTE_SCRIPT.CODE,
                ERROR.FAILD_EXECUTE_SCRIPT.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE,
            {
                irPattern: JSON.parse(result[0].replace(/'/g, "\"")).ir
            }
        ));
    })
});

module.exports = router;
