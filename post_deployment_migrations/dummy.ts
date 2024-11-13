import {QueryInterface, Sequelize} from 'sequelize';

// TODO: provide the info below for the review
// Affected records: X rows
// Estimated run time: Y seconds

const results = {
  success: 0,
  errors: 0
};

/**
 * Instructions (https://wiki.deel.network/en/deel-workspace/engineering/teams/database/postgres/DB-Best-Practices)
 */
const up = async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
  try {
    // do work in batches

    log.info('Successfully finished executing script');
  } catch (err) {
    log.error({err});
  }

  log.info({message: 'Runtime script result', results: JSON.stringify(results)});
};

export {up};
