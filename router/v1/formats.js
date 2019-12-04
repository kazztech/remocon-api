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
    pos_y
}) => ({
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
    }
});