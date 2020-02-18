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
const readAllBatchHandler = (req, res) => {
    db.batch.findAll({
        include: [{
            model: db.batches_widgets,
            required: false,
            include: [{
                model: db.widget,
                required: false,
                include: [{
                    model: db.remocon,
                    required: false
                }]
            }]
        }],
        order: [
            ["priority", "DESC"]
        ]

    }).then(data => {
        let batches = [];
        for (let batch of data) {
            let currentBatchWidgets = [];
            for (let widgets of batch.batches_widgets) {
                currentBatchWidgets.push(widgetPropsFormat(widgets.widget, true, false));
            }
            let formatBatch = batchPropsFormat(batch);
            formatBatch.widgets = currentBatchWidgets;
            batches.push(formatBatch);
        }

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, { batches }
        ));
    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
};

// 
const readBatchHandler = (req, res) => {
    let batchId = req.params.batchId;

    db.batch.findAll({
        where: {
            id: batchId
        },
        include: [{
            model: db.batches_widgets,
            required: false,
            include: [{
                model: db.widget,
                required: false,
                include: [{
                    model: db.remocon,
                    required: false
                }]
            }]
        }]

    }).then(data => {
        if (data.length !== 1) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_REMOCON.CODE,
                ERROR.UNDEFINED_REMOCON.MESSAGE,
                null
            ));
        }

        let currentBatchWidgets = [];
        for (let widgets of data[0].batches_widgets) {
            const wf = widgetPropsFormat(widgets.widget, true, false);
            wf.batchesWidgetsId = widgets.id;
            currentBatchWidgets.push(wf);
        }
        let batch = batchPropsFormat(data[0]);
        batch.widgets = currentBatchWidgets;

        return res.json(responsePropsFormat(
            ERROR.SUCCESS.CODE,
            ERROR.SUCCESS.MESSAGE, batch
        ));
    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, null));
    });
};

//
const createBatchValidate = [
    check("name").isString().isLength({ min: 1, max: 12 }),
    check("priority").isInt().isIn([1, 2, 3, 4, 5])
];
const createBatchHandler = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json(responsePropsFormat(
            ERROR.VALIDATE.CODE,
            ERROR.VALIDATE.MESSAGE,
            null
        ));
    }

    db.batch.create({
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

//
const deleteBatchHandler = (req, res) => {
    const batchId = req.params.batchId;

    db.batch.destroy({
        where: {
            id: batchId
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
const removeWidgetBacthValidate = (req, res) => {
    const id = req.params.id;

    db.batches_widgets.destroy({
        where: {
            id: id
        }

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
const addWidgetBacthValidate = [
    check("widgetId").isInt()
];
const addWidgetBacthHandler = (req, res) => {
    const batchId = req.params.batchId;

    db.batches_widgets.create({
        batch_id: batchId,
        widget_id: req.body.widgetId
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
const sendBatchIrHandler = (req, res) => {
    const batchId = req.params.batchId;

    db.batch.findAll({
        where: {
            id: batchId
        },
        include: [{
            model: db.batches_widgets,
            required: false,
            include: [{
                model: db.widget,
                required: false
            }]
        }]
    }).then(data => {
        if (data.length === 0) {
            return res.json(responsePropsFormat(
                ERROR.UNDEFINED_WIDGET.CODE,
                ERROR.UNDEFINED_WIDGET.MESSAGE,
                null
            ));
        }

        let widgetIds = data[0].batches_widgets.map(widget => widget.widget.id);

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
                ...widgetIds
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

    }).catch(err => {
        return res.json(responsePropsFormat(ERROR.DB.CODE, ERROR.DB.MESSAGE, err));
    });
}

// ===============================
// =========== Routes ============
// ===============================

// BASE: /batches

router.get("/", readAllBatchHandler);
router.delete("/widgets/:id(\\d+)", removeWidgetBacthValidate);
router.get("/:batchId(\\d+)", readBatchHandler);
router.post("/", createBatchValidate, createBatchHandler);
router.delete("/:batchId(\\d+)", deleteBatchHandler);
router.post("/:batchId(\\d+)/add", addWidgetBacthValidate, addWidgetBacthHandler);
router.get("/:batchId(\\d+)/ir-send", sendBatchIrHandler);

module.exports = router;