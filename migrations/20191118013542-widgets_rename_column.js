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
      queryInterface.renameColumn('widgets', 'tabel_text', 'label_text')
        .then(() => {
          queryInterface.renameColumn('widgets', 'tabel_color', 'label_color')
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
      queryInterface.renameColumn('widgets', 'label_text', 'tabel_text')
        .then(() => {
          queryInterface.renameColumn('widgets', 'label_color', 'tabel_color')
        })
    );
  }
};
