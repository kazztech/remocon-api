const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator/check");

const db = require("../../models");
const ERROR = require("./commons/errors");
const CONF = require("./commons/config");
require("./commons/formats");

// ===============================
// ========== Handlers ===========
// ===============================

// リモコン一括取得
const readAllRemoconHandler = (req, res) => {
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
                remocon.widgets.push(widgetPropsFormat(data[i].widgets[j], true, true));

                if (req.query.ir === "true") {
                    const ir_pattern = data[i].widgets[j].ir_pattern;
                    remocon.widgets[j].ir_pattern = ir_pattern === null ? [] : ir_pattern.split(",");
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
};

// リモコン個別取得
const readRemoconHandler = (req, res) => {
    let remoconId = req.params.remoconId;

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
            remocon.widgets.push(widgetPropsFormat(data[0].widgets[i], false));
        }
        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE,
            remocon
        ));

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
};

// リモコン作成
const createRemoconValidate = [
    check("name").isString().isLength({ min: 1, max: 6 }),
    check("priority").isInt().isIn([1, 2, 3, 4, 5])
];
const createRemoconHandler = (req, res) => {
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
};

// リモコン更新
const updateRemoconValidate = [
    check("name").isString().isLength({ min: 1, max: 6 }),
    check("priority").isInt().isIn([1, 2, 3, 4, 5])
];
const updateRemoconHandler = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const remoconId = req.params.remoconId;

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
};

// リモコン削除
const deleteRemoconHandler = (req, res) => {
    const remoconId = req.params.remoconId;

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
};

//
const downloadRemoconValidate = [];
const downloadRemoconHandler = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    const remoconData = req.body;
    db.sequelize.transaction(async t => {

        const insertedRemocon = await db.remocon.create({
            name: remoconData.name,
            priority: remoconData.priority
        }, { transaction: t });

        const newWidgets = [];
        for (let widget of remoconData.widgets) {
            newWidgets.push({
                remocon_id: insertedRemocon.id,
                label_text: widget.label.text,
                label_color: widget.label.color,
                icon_style: widget.icon.style,
                icon_color: widget.icon.color,
                pos_x: widget.position.x,
                pos_y: widget.position.y,
                ir_pattern: widget.irPattern.join(",")
            });
        }

        await db.widget.bulkCreate(newWidgets, { transaction: t });

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { id: insertedRemocon.id }
        ));

    }).catch(() => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
}

// ===============================
// =========== Routes ============
// ===============================

// BASE: /remocons

// リモコンデータ一括取得
router.get("/", readAllRemoconHandler);
// リモコンデータ個別取得
router.get("/:remoconId(\\d+)", readRemoconHandler);
// リモコン作成
router.post("/", createRemoconValidate, createRemoconHandler);
// リモコン更新
router.put("/:remoconId(\\d+)", updateRemoconValidate, updateRemoconHandler);
// リモコン削除
router.delete("/:remoconId(\\d+)", deleteRemoconHandler);
router.post("/download", downloadRemoconValidate, downloadRemoconHandler);


module.exports = router;