module.exports = responsePropsFormat = (exitCode, errorMessage, content) => ({
    exitCode: exitCode,
    errorMessage: errorMessage,
    content: content
});

module.exports = remoconPropsFormat = ({ id, name, priority }) => ({
    id: id,
    name: name,
    priority: priority,
    widgets: []
});

module.exports = widgetPropsFormat = ({
        id,
        label_text,
        label_color,
        icon_style,
        icon_color,
        pos_x,
        pos_y,
        ir_pattern,
        remocon = null
    },
    noIrPattern = true,
    noParentRemoconInfo = true
) => ({
    id: id,
    label: {
        text: label_text,
        color: label_color
    },
    icon: {
        style: icon_style,
        color: icon_color
    },
    position: {
        x: pos_x,
        y: pos_y
    },
    // データ量削減のため引数がnullだったら省略
    irPattern: noIrPattern ? void 0 : ir_pattern.split(",").map(Number),
    remocon: noParentRemoconInfo ? void 0 : {
        name: remocon.name,
        priority: remocon.priority
    }
});

module.exports = batchPropsFormat = ({ id, name, priority }) => ({
    id: id,
    name: name,
    priority: priority,
    widgets: []
});