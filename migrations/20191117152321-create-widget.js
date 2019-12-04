'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('widgets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      remocon_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'remocons',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
      },
      tabel_text: {
        type: Sequelize.STRING
      },
      tabel_color: {
        type: Sequelize.STRING
      },
      icon_style: {
        type: Sequelize.STRING
      },
      icon_color: {
        type: Sequelize.STRING
      },
      pos_x: {
        type: Sequelize.INTEGER
      },
      pos_y: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('widgets');
  }
};