'use strict';
module.exports = (sequelize, DataTypes) => {
    const batches_widgets = sequelize.define('batches_widgets', {
        batch_id: DataTypes.INTEGER,
        widget_id: DataTypes.INTEGER
    }, {
        underscored: true,
    });
    batches_widgets.associate = function (models) {
        // associations can be defined here
        //batches_widgets.hasMany(models.widget, { foreignKey: "widget_id" });
        batches_widgets.belongsTo(models.batch);
        batches_widgets.belongsTo(models.widget);
    };
    return batches_widgets;
};