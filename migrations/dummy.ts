import {QueryInterface, Sequelize} from 'sequelize';

const up = async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
  /**
   * Instructions (https://wiki.deel.network/en/deel-workspace/engineering/teams/database/postgres/DB-Best-Practices)
   * =============
   * Separate modifying different tables to different transactions/migrations - to avoid potential deadlocks
   * Avoid long running migrations - use a runtime_script instead
   * Comment all new/modified tables and columns. Add the `SENSITIVE` tag and anonymize sensitive columns (https://wiki.deel.network/en/deel-workspace/engineering/teams/database/postgres/DBDocs#sensitive-columns)
   * Use lower_snake_case for table, column and any other object name. Table names should be last-word-plural
   * Use the proper data type, for strings set an appropriate size limit
   * Any change you make in the migration must reflect in the model and vice versa - they must be aligned
   *
   */
  queryInterface.sequelize.transaction(async (transaction) => {
    // Add your migration here
  });
};

export {up};
