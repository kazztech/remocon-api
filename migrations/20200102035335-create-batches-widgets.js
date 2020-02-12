'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('batches_widgets', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            batches_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                  model: 'batches',
                  key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT'
            },
            widgets_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                  model: 'widgets',
                  key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT'
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
        return queryInterface.dropTable('batches_widgets');
    }
};
