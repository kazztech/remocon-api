'use strict';
module.exports = (sequelize, DataTypes) => {
  const remocon = sequelize.define('remocon', {
    name: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  remocon.associate = function(models) {
    // associations can be defined here
    remocon.hasMany(models.widget, {foreignKey: "remocon_id"});
  };
  return remocon;
};