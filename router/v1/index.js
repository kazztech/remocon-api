const express = require("express");
const router = express.Router();

const { PythonShell } = require("python-shell");
const { check, validationResult } = require("express-validator/check");

const db = require("../../models");
const ERROR = require("./errors");
const CONF = require("./config");
require("./formats");


// CORS許可
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// ドキュメント
router.get("/", (req, res) => {
    res.render("v1/index", {});
});


// リモコンデータ一括取得
router.get("/remocons", (req, res) => {
    db.remocon.findAll({
        include: [{
            model: db.widget,
            required: false
        }],
        order: [
            ["priority", "DESC"]
        ]

    }).then(data => {
        let remocons = [];
        for (let i = 0, iLen = data.length; i < iLen; i++) {
            let remocon = remoconPropsFormat(data[i]);
            for (let j = 0, jLen = data[i].widgets.length; j < jLen; j++) {
                remocon.widgets.push(widgetPropsFormat(data[i].widgets[j]));

                if (req.query.ir === "true") {
                    const ir_pattern = data[i].widgets[j].ir_pattern;
                    remocon.widgets[j].ir_pattern
                        = ir_pattern === null ? [] : ir_pattern.split(",");
                }
            }
            remocons.push(remocon);
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { remocons: remocons }
        ));
    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// リモコンデータ個別取得
router.get("/remocons/:id(\\d+)", (req, res) => {
    let remoconId = req.params.id;

    db.remocon.findAll({
        where: {
            id: remoconId
        },
        include: [{
            model: db.widget,
            required: false
        }]

    }).then(data => {
        if (data.length !== 1) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_REMOCON.CODE,
                ERROR.UNDEFINED_REMOCON.MESSAGE,
                null
            ));
        }

        let remocon = remoconPropsFormat(data[0]);
        for (let i = 0, iLen = data[0].widgets.length; i < iLen; i++) {
            remocon.widgets.push(widgetPropsFormat(data[0].widgets[i]));
        }
        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE,
            remocon
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// リモコン作成
router.post("/remocons", [
    check("name").isString().isLength({ min: 1, max: 6 }),
    check("priority").isInt().isIn([1, 2, 3, 4, 5])

], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    db.remocon.create({
        name: req.body.name,
        priority: req.body.priority

    }).then(data => {
        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: data.id }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// リモコン更新
router.put("/remocons/:id(\\d+)", [
    check("name").isString().isLength({ min: 1, max: 6 }),
    check("priority").isInt().isIn([1, 2, 3, 4, 5])

], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const remoconId = req.params.id;

    db.remocon.update({
        name: req.body.name,
        priority: req.body.priority
    }, {
        where: {
            id: remoconId
        }

    }).then(data => {
        if (Array.isArray(data) && data[0] === 0) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_REMOCON.CODE,
                ERROR.UNDEFINED_REMOCON.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: remoconId }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// リモコン削除
router.delete("/remocons/:id(\\d+)", (req, res) => {
    const remoconId = req.params.id;

    db.remocon.destroy({
        where: {
            id: remoconId
        }

    }).then(data => {
        //
        if (data === 0) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_REMOCON.CODE,
                ERROR.UNDEFINED_REMOCON.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: remoconId }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// ウィジェット個別取得
router.get("/widgets/:id(\\d+)", (req, res) => {
    const widgetId = req.params.id;

    db.widget.findAll({
        where: {
            id: widgetId
        }

    }).then(data => {
        if (data.length !== 1) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_WIDGET.CODE,
                ERROR.UNDEFINED_WIDGET.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE,
            widgetPropsFormat(data[0])
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
});


// ウィジェット作成
router.post("/widgets", [
    check("remoconId")
        .isInt(),
    check("label.text")
        .isString()
        .isLength({ min: 1, max: 6 }),
    check("label.color")
        .isString()
        .isLength({ min: 1, max: 100 }),
    check("icon.style")
        .isString()
        .isLength({ min: 1, max: 100 }),
    check("icon.color")
        .isString()
        .isLength({ min: 1, max: 100 }),
    check("position.x")
        .isInt()
        .isIn([1, 2, 3, 4]),
    check("position.y")
        .isInt()
        .isIn([...Array(32).keys()].map(i => ++i))

], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const options = {
        mode: "text",
        pythonPath: CONF.PYTHON_ENV_PATH,
        pythonOptions: ["-u"],
        scriptPath: CONF.PYTHON_SCRIPTS_PATH,
        args: ["-r", "-g" + CONF.GPIO_OUT, "-f", "20", "--no-confirm", "--post", "150", "ir"]
    };
    PythonShell.run("irrp.py", options, (err, result) => {
        if (err) {
            return res.json(responsePropsFormat(
                ERROR.FAILD_EXECUTE_SCRIPT.CODE,
                ERROR.FAILD_EXECUTE_SCRIPT.MESSAGE,
                null
            ));
        }

        db.widget.create({
            remocon_id: req.body.remocon_id,
            label_text: req.body.label.text,
            label_color: req.body.label.color,
            icon_style: req.body.icon.style,
            icon_color: req.body.icon.color,
            pos_x: req.body.position.x,
            pos_y: req.body.position.y,
            ir_pattern: JSON.parse(result[0].replace(/'/g, "\"")).ir.join(",")

        }).then(data => {
            return res.json(responsePropsFormat(
                ERROR.SUCCESS.CODE,
                ERROR.SUCCESS.MESSAGE,
                null
            ));

        }).catch(err => {
            return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
        });
    })
});


// ウィジェット更新
router.put("/widgets/:id(\\d+)", [
    check("remoconId")
        .isInt(),
    check("label.text")
        .isString()
        .optional({ nullable: true })
        .isLength({ min: 1, max: 6 }),
    check("label.color")
        .isString()
        .optional({ nullable: true })
        .isLength({ min: 1, max: 100 }),
    check("icon.style")
        .isString()
        .optional({ nullable: true })
        .isLength({ min: 1, max: 100 }),
    check("icon.color")
        .isString()
        .optional({ nullable: true })
        .isLength({ min: 1, max: 100 }),
    check("position.x")
        .isInt()
        .optional({ nullable: true })
        .isIn([1, 2, 3, 4]),
    check("position.y")
        .isInt()
        .optional({ nullable: true })
        .isIn([...Array(32).keys()].map(i => ++i))

], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }
    const widgetId = req.params.id;

    const insertParams = {
        remocon_id: req.body.remocon_id
    };
    if (typeof req.body.label !== "undefined") {
        if (typeof req.body.label.text !== "undefined") {
            insertParams.label_text = req.body.label.text;
        }
        if (typeof req.body.label.color !== "undefined") {
            insertParams.label_text = req.body.label.color;
        }
    }
    if (typeof req.body.icon !== "undefined") {
        if (typeof req.body.icon.style !== "undefined") {
            insertParams.icon_style = req.body.icon.style;
        }
        if (typeof req.body.icon.color !== "undefined") {
            insertParams.icon_color = req.body.icon.color;
        }
    }
    if (typeof req.body.position !== "undefined") {
        if (typeof req.body.position.x !== "undefined") {
            insertParams.pos_x = req.body.position.x;
        }
        if (typeof req.body.position.y !== "undefined") {
            insertParams.pos_y = req.body.position.y;
        }
    }

    db.widget.update(insertParams, {
        where: {
            id: widgetId
        }

    }).then(data => {
        if (Array.isArray(data) && data[0] === 0) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_REMOCON.CODE,
                ERROR.UNDEFINED_REMOCON.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: widgetId }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });

});


// ウィジェット削除
router.delete("/widgets/:id(\\d+)", (req, res) => {
    const widgetId = req.params.id;

    db.widget.destroy({
        where: {
            id: widgetId
        }

    }).then(data => {
        if (data === 0) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_WIDGET.CODE,
                ERROR.UNDEFINED_WIDGET.MESSAGE,
                null
            ));
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: widgetId }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(
            ERROR.DB.CODE,
            ERROR.DB.MESSAGE,
            null
        ));
    });
});


// ウィジェット赤外線送信
router.post("/widgets/ir-send", [
    check("irPatterns")
        .isArray()

], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const irPatterns = req.body.irPatterns;
    for (let p in irPatterns) {
        if (!Number.isInteger(irPatterns[p])) {
            return res.json(responsePropsFormat(
                ERROR.VALIDATE.CODE,
                ERROR.VALIDATE.MESSAGE,
                null
            ));
        }
    }

    const options = {
        mode: "text",
        pythonPath: CONF.PYTHON_ENV_PATH,
        pythonOptions: ["-u"],
        scriptPath: CONF.PYTHON_SCRIPTS_PATH,
        args: [
            "-p",
            "-g" + CONF.GPIO_OUT,
            "-f",
            "ir",
            ...irPatterns
        ]
    };
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
            result
        ));
    });
});


// ウィジェット赤外線更新
router.put("/widgets/:id(\\d+)/ir", (req, res) => {
    const widgetId = req.params.id;

    const options = {
        mode: "text",
        pythonPath: CONF.PYTHON_ENV_PATH,
        pythonOptions: ["-u"],
        scriptPath: CONF.PYTHON_SCRIPTS_PATH,
        args: [
            "-r",
            "-g" + CONF.GPIO_IN,
            "-f",
            "ir",
            "--no-confirm",
            "--post",
            CONF.IR_WAIT_MS,
            "ir"
        ]
    };

    PythonShell.run("irrp.py", options, (err, result) => {
        if (err) {
            return res.json(responsePropsFormat(
                ERROR.FAILD_EXECUTE_SCRIPT.CODE,
                ERROR.FAILD_EXECUTE_SCRIPT.MESSAGE,
                null
            ));
        }

        db.widget.update({
            ir_pattern: JSON.parse(result[0].replace(/'/g, "\"")).ir.join(",")
        }, {
            where: {
                id: widgetId
            }

        }).then(data => {
            if (Array.isArray(data) && data[0] === 0) {
                return res.json(responsePropsFormat(
                    ERROR.UNDEFINED_REMOCON.CODE,
                    ERROR.UNDEFINED_REMOCON.MESSAGE,
                    null
                ));
            }

            return res.json(responsePropsFormat(
                ERROR.SUCCESS.CODE,
                ERROR.SUCCESS.MESSAGE, { id: widgetId }
            ));

        }).catch(err => {
            return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
        });
    });
});


module.exports = router;