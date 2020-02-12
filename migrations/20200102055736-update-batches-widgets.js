'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.
    
          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
        return (
            queryInterface.renameColumn('batches_widgets', 'batches_id', 'batch_id')
                .then(() => {
                    queryInterface.renameColumn('batches_widgets', 'widgets_id', 'widget_id')
                })
        );
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.
    
          Example:
          return queryInterface.dropTable('users');
        */
        return (
            queryInterface.renameColumn('batches_widgets', 'batch_id', 'batches_id')
                .then(() => {
                    queryInterface.renameColumn('batches_widgets', 'widget_id', 'widgets_id')
                })
        );
    }
};
