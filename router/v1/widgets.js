const express = require("express");
const router = express.Router();

const { PythonShell } = require("python-shell");
const { check, validationResult } = require("express-validator/check");

const db = require("../../models");
const ERROR = require("./commons/errors");
const CONF = require("./commons/config");
require("./commons/formats");

// ===============================
// ========== Handlers ===========
// ===============================

//
const readWidgetHandler = (req, res) => {
    const widgetId = req.params.widgetId;

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
            widgetPropsFormat(data[0], false)
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
};

//
const createWidgetValidate = [
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
    .isIn([0, 1, 2, 3]),
    check("position.y")
    .isInt()
    .isIn([...Array(32).keys()]),
    check("irPattern")
    .isArray()

];
const createWidgetHandler = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const remoconId = req.params.remoconId;

    // 取得したIRパターンと入力値をもとにDB保存
    db.widget.create({
        remocon_id: remoconId,
        label_text: req.body.label.text,
        label_color: req.body.label.color,
        icon_style: req.body.icon.style,
        icon_color: req.body.icon.color,
        pos_x: req.body.position.x,
        pos_y: req.body.position.y,
        ir_pattern: req.body.irPattern.join(",")

    }).then(data => {
        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: data.id }
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
};

//
const updateWidgetValidate = [
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
    .isIn([0, 1, 2, 3]),
    check("position.y")
    .isInt()
    .optional({ nullable: true })
    .isIn([...Array(32).keys()]),
    check("irPattern")
    .isArray()
];
const updateWidgetHandler = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const widgetId = req.params.widgetId;

    const insertParams = {
        ir_pattern: req.body.irPattern.join(",")
    };
    if (typeof req.body.label !== "undefined") {
        if (typeof req.body.label.text !== "undefined") {
            insertParams.label_text = req.body.label.text;
        }
        if (typeof req.body.label.color !== "undefined") {
            insertParams.label_color = req.body.label.color;
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

};

//
const deleteWidgetHandler = (req, res) => {
    const widgetId = req.params.widgetId;

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
};

//
const sendWidgetIrHandler = (req, res) => {
    const widgetId = req.params.widgetId;

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
            widgetId
        ]
    };
    PythonShell.run("irrp.py", options, (err, result) => {
        if (err) {
            return res.json(responsePropsFormat(
                ERROR.FAILD_EXECUTE_SCRIPT.CODE,
                ERROR.FAILD_EXECUTE_SCRIPT.MESSAGE,
                null
            ));
        } else {
            return res.json(responsePropsFormat(
                ERROR.SUCCESS.CODE,
                ERROR.SUCCESS.MESSAGE,
                null
            ));
        }
    });
};

//
const updateWidgetIrHandler = (req, res) => {
    const widgetId = req.params.widgetId;

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
};

// ===============================
// =========== Routes ============
// ===============================

// ウィジェット個別取得
router.get("/remocons/:remoconId(\\d+)/widgets/:widgetId(\\d+)", readWidgetHandler);
// ウィジェット作成
router.post("/remocons/:remoconId(\\d+)/widgets", createWidgetValidate, createWidgetHandler);
// ウィジェット更新
router.put("/remocons/:remoconId(\\d+)/widgets/:widgetId(\\d+)", updateWidgetValidate, updateWidgetHandler);
// ウィジェット削除
router.delete("/remocons/:remoconId(\\d+)/widgets/:widgetId(\\d+)", deleteWidgetHandler);
// ウィジェット赤外線送信
router.get("/widgets/:widgetId(\\d+)/ir-send", sendWidgetIrHandler);
// ウィジェット赤外線更新
router.put("/widgets/:widgetId(\\d+)/ir", updateWidgetIrHandler);


module.exports = router;