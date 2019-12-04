'use strict';
module.exports = (sequelize, DataTypes) => {
    const widget = sequelize.define('widget', {
        remocon_id: DataTypes.INTEGER,
        label_text: DataTypes.STRING,
        label_color: DataTypes.STRING,
        icon_style: DataTypes.STRING,
        icon_color: DataTypes.STRING,
        pos_x: DataTypes.INTEGER,
        pos_y: DataTypes.INTEGER,
        ir_pattern: DataTypes.STRING
    }, {
        underscored: true,
    });
    widget.associate = function(models) {
        // associations can be defined here
        widget.belongsTo(models.remocon);
    };
    return widget;
};