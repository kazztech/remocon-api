'use strict';
module.exports = (sequelize, DataTypes) => {
  const batch = sequelize.define('batch', {
    name: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  batch.associate = function(models) {
    // associations can be defined here
    batch.hasMany(models.batches_widgets, {foreignKey: "batch_id"});
  };
  return batch;
};